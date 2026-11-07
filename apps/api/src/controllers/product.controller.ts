import { Request, Response, NextFunction } from 'express'
import { productRepository } from '../repositories/product.repository'
import { prisma } from '../lib/prisma'
import { Errors } from '../lib/errors'
import type { ProductListQuery, CreateProductInput } from '@lampe/shared'

function formatProduct(p: {
  id: string; slug: string; name: string; description: string; priceMillimes: number;
  stock: number; categoryId: string; images: string; model3d: string; isActive: boolean;
  createdAt: Date; category?: { id: string; slug: string; name: string } | null
}) {
  return {
    ...p,
    images: JSON.parse(p.images) as string[],
    model3d: JSON.parse(p.model3d) as object,
    createdAt: p.createdAt.toISOString(),
  }
}

export const productController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as ProductListQuery
      const { data, total } = await productRepository.list(query)
      res.json({
        data: data.map(formatProduct),
        total,
        page: query.page,
        pageSize: query.pageSize,
        totalPages: Math.ceil(total / query.pageSize),
      })
    } catch (err) { next(err) }
  },

  async listAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as ProductListQuery
      const { data, total } = await productRepository.listAdmin(query)
      res.json({
        data: data.map(formatProduct),
        total,
        page: query.page,
        pageSize: query.pageSize,
        totalPages: Math.ceil(total / query.pageSize),
      })
    } catch (err) { next(err) }
  },

  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = String(req.params['slug'])
      const product = await productRepository.findBySlug(slug)
      if (!product) throw Errors.NotFound('Product')
      res.json(formatProduct(product))
    } catch (err) { next(err) }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input = req.body as CreateProductInput
      const existing = await productRepository.findBySlug(input.slug)
      if (existing) throw Errors.Conflict('A product with this slug already exists.')
      const product = await productRepository.create({
        ...input,
        images: JSON.stringify(input.images),
        model3d: JSON.stringify(input.model3d),
      })
      res.status(201).json(formatProduct(product))
    } catch (err) { next(err) }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string }
      const existing = await productRepository.findById(id)
      if (!existing) throw Errors.NotFound('Product')
      const input = req.body as Partial<CreateProductInput>
      const product = await productRepository.update(id, {
        ...input,
        images: input.images !== undefined ? JSON.stringify(input.images) : undefined,
        model3d: input.model3d !== undefined ? JSON.stringify(input.model3d) : undefined,
      })
      res.json(formatProduct(product))
    } catch (err) { next(err) }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string }
      const existing = await productRepository.findById(id)
      if (!existing) throw Errors.NotFound('Product')
      await productRepository.delete(id)
      res.status(204).send()
    } catch (err) { next(err) }
  },

  async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw Errors.BadRequest('No file uploaded')
      const url = `/uploads/${req.file.filename}`
      res.json({ url })
    } catch (err) { next(err) }
  },

  async getCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })
      res.json(categories)
    } catch (err) { next(err) }
  },
}
