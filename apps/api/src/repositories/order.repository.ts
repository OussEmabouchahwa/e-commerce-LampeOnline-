import { prisma } from '../lib/prisma'

export const orderRepository = {
  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: { items: true, payments: true, user: { select: { id: true, name: true, email: true } } },
    })
  },
  async findByIdempotencyKey(key: string) {
    return prisma.order.findUnique({ where: { idempotencyKey: key }, include: { items: true } })
  },
  async listForUser(userId: string, params: { page: number; pageSize: number; status?: string }) {
    const where: { userId: string; status?: string } = { userId }
    if (params.status) where.status = params.status
    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
      prisma.order.count({ where }),
    ])
    return { data, total }
  },
  async listAll(params: { page: number; pageSize: number; status?: string }) {
    const where: { status?: string } = {}
    if (params.status) where.status = params.status
    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.order.count({ where }),
    ])
    return { data, total }
  },
  async updateStatus(id: string, status: string) {
    return prisma.order.update({ where: { id }, data: { status } })
  },
  async createWithTransaction(data: {
    userId: string
    totalMillimes: number
    paymentMethod: string
    shippingAddress: string
    idempotencyKey: string
    items: Array<{ productId: string; nameSnapshot: string; priceSnapshot: number; qty: number }>
    paymentProvider: string
    paymentReference: string
  }) {
    return prisma.$transaction(async (tx) => {
      // Check + decrement stock for each item
      for (const item of data.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } })
        if (!product) throw new Error(`Product ${item.productId} not found`)
        if (product.stock < item.qty) throw new Error(`Insufficient stock for "${product.name}"`)
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.qty } },
        })
      }
      // Create order
      const order = await tx.order.create({
        data: {
          userId: data.userId,
          status: 'PENDING',
          totalMillimes: data.totalMillimes,
          paymentMethod: data.paymentMethod,
          paymentStatus: 'PENDING',
          shippingAddress: data.shippingAddress,
          idempotencyKey: data.idempotencyKey,
          items: { create: data.items },
          payments: {
            create: {
              provider: data.paymentProvider,
              status: 'PENDING',
              reference: data.paymentReference,
            },
          },
        },
        include: { items: true },
      })
      return order
    })
  },
  async confirmPayment(orderId: string) {
    return prisma.$transaction([
      prisma.order.update({ where: { id: orderId }, data: { status: 'PAID', paymentStatus: 'SUCCESS' } }),
      prisma.payment.updateMany({ where: { orderId }, data: { status: 'SUCCESS' } }),
    ])
  },
  async failPayment(orderId: string) {
    // Restore stock
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } })
    if (order) {
      await prisma.$transaction([
        ...order.items.map((item) =>
          prisma.product.update({ where: { id: item.productId }, data: { stock: { increment: item.qty } } }),
        ),
        prisma.order.update({ where: { id: orderId }, data: { status: 'CANCELLED', paymentStatus: 'FAILED' } }),
        prisma.payment.updateMany({ where: { orderId }, data: { status: 'FAILED' } }),
      ])
    }
  },
}
