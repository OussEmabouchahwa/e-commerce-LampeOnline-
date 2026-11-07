import { Request, Response, NextFunction } from 'express'
import { userRepository } from '../repositories/user.repository'
import { Errors } from '../lib/errors'
import type { ClientListQuery } from '@lampe/shared'
import { prisma } from '../lib/prisma'
import argon2 from 'argon2'

export const userController = {
  async listClients(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as ClientListQuery
      const { data, total } = await userRepository.list({ page: query.page, pageSize: query.pageSize, search: query.search })
      res.json({
        data: data.map((u) => ({
          id: u.id, email: u.email, name: u.name, avatarUrl: u.avatarUrl, phone: u.phone,
          role: u.role, status: u.status, createdAt: u.createdAt.toISOString(),
          orderCount: u._count.orders,
        })),
        total,
        page: query.page,
        pageSize: query.pageSize,
        totalPages: Math.ceil(total / query.pageSize),
      })
    } catch (err) { next(err) }
  },

  async getClient(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string }
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          orders: { orderBy: { createdAt: 'desc' }, take: 10, include: { items: true } },
          _count: { select: { orders: true } },
        },
      })
      if (!user) throw Errors.NotFound('Client')
      const totalSpent = await prisma.order.aggregate({
        where: { userId: id, status: { not: 'CANCELLED' } },
        _sum: { totalMillimes: true },
      })
      res.json({
        id: user.id, email: user.email, name: user.name, phone: user.phone,
        role: user.role, status: user.status, createdAt: user.createdAt.toISOString(),
        orderCount: user._count.orders,
        totalSpentMillimes: totalSpent._sum.totalMillimes ?? 0,
        orders: user.orders.map((o) => ({
          ...o,
          shippingAddress: JSON.parse(o.shippingAddress) as object,
          createdAt: o.createdAt.toISOString(),
        })),
      })
    } catch (err) { next(err) }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string }
      if (id === req.user!.id) throw Errors.Forbidden('Admins cannot block themselves.')
      const { status } = req.body as { status: string }
      const user = await userRepository.update(id, { status })
      res.json({ id: user.id, status: user.status })
    } catch (err) { next(err) }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const { name, phone } = req.body as { name?: string; phone?: string }
      const updated = await userRepository.update(userId, { name, phone } as Parameters<typeof userRepository.update>[1])
      res.json({ name: updated.name, phone: updated.phone })
    } catch (err) { next(err) }
  },

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string }
      const user = await userRepository.findById(userId)
      if (!user || !user.passwordHash) throw Errors.BadRequest('Password change not supported for social accounts.')
      const valid = await argon2.verify(user.passwordHash, currentPassword)
      if (!valid) throw Errors.Unauthorized('Current password is incorrect.')
      const passwordHash = await argon2.hash(newPassword)
      await userRepository.update(userId, { passwordHash })
      res.json({ ok: true })
    } catch (err) { next(err) }
  },
}
