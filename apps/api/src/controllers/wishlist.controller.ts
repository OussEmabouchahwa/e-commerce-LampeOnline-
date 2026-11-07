import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'
import { Errors } from '../lib/errors'

export const wishlistController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const items = await prisma.wishlistItem.findMany({
        where: { userId },
        include: { product: { include: { category: true } } },
        orderBy: { createdAt: 'desc' },
      })
      res.json(items.map((i) => ({
        productId: i.productId,
        createdAt: i.createdAt.toISOString(),
        product: {
          ...i.product,
          images: JSON.parse(i.product.images) as string[],
          model3d: JSON.parse(i.product.model3d) as object,
          createdAt: i.product.createdAt.toISOString(),
        },
      })))
    } catch (err) { next(err) }
  },

  async add(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const { productId } = req.body as { productId: string }
      const product = await prisma.product.findUnique({ where: { id: productId } })
      if (!product) throw Errors.NotFound('Product')
      await prisma.wishlistItem.upsert({
        where: { userId_productId: { userId, productId } },
        update: {},
        create: { userId, productId },
      })
      res.status(201).json({ productId })
    } catch (err) { next(err) }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id
      const { productId } = req.params as { productId: string }
      await prisma.wishlistItem.deleteMany({ where: { userId, productId } })
      res.status(204).send()
    } catch (err) { next(err) }
  },
}
