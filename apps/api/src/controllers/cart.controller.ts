import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'
import { Errors } from '../lib/errors'

export const cartController = {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const items = await prisma.cartItem.findMany({
        where: { userId },
        include: { product: { include: { category: true } } },
      })
      res.json(items.map((i) => ({
        productId: i.productId,
        qty: i.qty,
        product: {
          ...i.product,
          images: JSON.parse(i.product.images) as string[],
          model3d: JSON.parse(i.product.model3d) as object,
          createdAt: i.product.createdAt.toISOString(),
        },
      })))
    } catch (err) { next(err) }
  },

  async upsert(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const { productId, qty } = req.body as { productId: string; qty: number }
      const product = await prisma.product.findUnique({ where: { id: productId } })
      if (!product) throw Errors.NotFound('Product')
      if (qty <= 0) {
        await prisma.cartItem.deleteMany({ where: { userId, productId } })
        res.status(204).send()
        return
      }
      const item = await prisma.cartItem.upsert({
        where: { userId_productId: { userId, productId } },
        update: { qty },
        create: { userId, productId, qty },
      })
      res.json(item)
    } catch (err) { next(err) }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const { productId } = req.params as { productId: string }
      await prisma.cartItem.deleteMany({ where: { userId, productId } })
      res.status(204).send()
    } catch (err) { next(err) }
  },

  async merge(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const guestCart = req.body as Array<{ productId: string; qty: number }>
      for (const item of guestCart) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } })
        if (!product) continue
        await prisma.cartItem.upsert({
          where: { userId_productId: { userId, productId: item.productId } },
          update: { qty: item.qty },
          create: { userId, productId: item.productId, qty: item.qty },
        })
      }
      const items = await prisma.cartItem.findMany({ where: { userId }, include: { product: true } })
      res.json(items)
    } catch (err) { next(err) }
  },

  async clear(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      await prisma.cartItem.deleteMany({ where: { userId } })
      res.status(204).send()
    } catch (err) { next(err) }
  },
}
