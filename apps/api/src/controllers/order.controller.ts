import { Request, Response, NextFunction } from 'express'
import { orderRepository } from '../repositories/order.repository'
import { getPaymentProvider } from '../services/payment.service'
import { prisma } from '../lib/prisma'
import { Errors } from '../lib/errors'
import type { CreateOrderInput, OrderListQuery } from '@lampe/shared'

const ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['PAID', 'CANCELLED'],
  PAID: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
}

function formatOrder(o: {
  id: string; userId: string; status: string; totalMillimes: number; paymentMethod: string;
  paymentStatus: string; shippingAddress: string; idempotencyKey: string; createdAt: Date;
  items: Array<{ id: string; productId: string; nameSnapshot: string; priceSnapshot: number; qty: number }>
  user?: { id: string; name: string; email: string } | null
}) {
  return {
    ...o,
    shippingAddress: JSON.parse(o.shippingAddress) as object,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({ ...i })),
  }
}

export const orderController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const input = req.body as CreateOrderInput

      // Idempotency check
      const existing = await orderRepository.findByIdempotencyKey(input.idempotencyKey)
      if (existing) {
        res.status(200).json(formatOrder(existing as Parameters<typeof formatOrder>[0]))
        return
      }

      // Get server-side cart
      const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: { product: true },
      })
      if (cartItems.length === 0) throw Errors.BadRequest('Your cart is empty.')

      // Compute total server-side
      const totalMillimes = cartItems.reduce((sum, i) => sum + i.product.priceMillimes * i.qty, 0)
      const provider = getPaymentProvider()

      // For mock card, we process payment first (before order) to avoid stock issues on failure
      const paymentResult = await provider.createPayment({
        orderId: 'pending',
        amountMillimes: totalMillimes,
        cardNumber: input.mockCardNumber,
      })

      if (!paymentResult.success) {
        throw Errors.PaymentFailed(paymentResult.message ?? 'Payment was declined.')
      }

      const order = await orderRepository.createWithTransaction({
        userId,
        totalMillimes,
        paymentMethod: input.paymentMethod,
        shippingAddress: JSON.stringify(input.shippingAddress),
        idempotencyKey: input.idempotencyKey,
        items: cartItems.map((i) => ({
          productId: i.productId,
          nameSnapshot: i.product.name,
          priceSnapshot: i.product.priceMillimes,
          qty: i.qty,
        })),
        paymentProvider: input.paymentMethod === 'CASH_ON_DELIVERY' ? 'cash_on_delivery' : 'mock',
        paymentReference: paymentResult.reference,
      })

      // Confirm payment
      await orderRepository.confirmPayment(order.id)

      // Clear cart
      await prisma.cartItem.deleteMany({ where: { userId } })

      res.status(201).json(formatOrder(order as Parameters<typeof formatOrder>[0]))
    } catch (err) { next(err) }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const query = req.query as unknown as OrderListQuery
      const { data, total } = await orderRepository.listForUser(userId, {
        page: query.page,
        pageSize: query.pageSize,
        status: query.status,
      })
      res.json({
        data: data.map((o) => formatOrder(o as Parameters<typeof formatOrder>[0])),
        total,
        page: query.page,
        pageSize: query.pageSize,
        totalPages: Math.ceil(total / query.pageSize),
      })
    } catch (err) { next(err) }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string }
      const order = await orderRepository.findById(id)
      if (!order) throw Errors.NotFound('Order')
      // Ownership check
      if (req.user!.role !== 'ADMIN' && order.userId !== req.user!.id) throw Errors.Forbidden()
      res.json(formatOrder(order as Parameters<typeof formatOrder>[0]))
    } catch (err) { next(err) }
  },

  // Admin: list all orders
  async listAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as OrderListQuery
      const { data, total } = await orderRepository.listAll({
        page: query.page,
        pageSize: query.pageSize,
        status: query.status,
      })
      res.json({
        data: data.map((o) => formatOrder(o as Parameters<typeof formatOrder>[0])),
        total,
        page: query.page,
        pageSize: query.pageSize,
        totalPages: Math.ceil(total / query.pageSize),
      })
    } catch (err) { next(err) }
  },

  // Admin: update status
  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string }
      const { status } = req.body as { status: string }
      const order = await orderRepository.findById(id)
      if (!order) throw Errors.NotFound('Order')
      const allowed = ORDER_STATUS_TRANSITIONS[order.status] ?? []
      if (!allowed.includes(status)) {
        throw Errors.Conflict(`Cannot transition from ${order.status} to ${status}.`)
      }
      if (status === 'CANCELLED') {
        await orderRepository.failPayment(id)
      } else {
        await orderRepository.updateStatus(id, status)
      }
      const updated = await orderRepository.findById(id)
      res.json(formatOrder(updated as Parameters<typeof formatOrder>[0]))
    } catch (err) { next(err) }
  },

  // Admin: export CSV
  async exportCsv(_req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await prisma.order.findMany({
        include: { user: { select: { name: true, email: true } }, items: true },
        orderBy: { createdAt: 'desc' },
      })
      const rows = [
        ['ID', 'Date', 'Client', 'Email', 'Status', 'Total (TND)', 'Payment', 'Items'].join(','),
        ...orders.map((o) =>
          [
            o.id,
            o.createdAt.toISOString().split('T')[0],
            o.user.name,
            o.user.email,
            o.status,
            (o.totalMillimes / 1000).toFixed(3),
            o.paymentMethod,
            o.items.length,
          ].join(','),
        ),
      ].join('\n')
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', 'attachment; filename=orders.csv')
      res.send(rows)
    } catch (err) { next(err) }
  },
}
