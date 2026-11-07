import { prisma } from '../lib/prisma'
import { Prisma } from '@prisma/client'
import type { ProductListQuery } from '@lampe/shared'

export const productRepository = {
  async findById(id: string) {
    return prisma.product.findUnique({ where: { id }, include: { category: true } })
  },
  async findBySlug(slug: string) {
    return prisma.product.findUnique({ where: { slug }, include: { category: true } })
  },
  async list(query: ProductListQuery) {
    const where: Prisma.ProductWhereInput = {}
    if (query.search) {
      where['OR'] = [
        { name: { contains: query.search } },
        { description: { contains: query.search } },
      ]
    }
    if (query.categoryId) where['categoryId'] = query.categoryId
    if (query.minPrice !== undefined) where['priceMillimes'] = { ...((where['priceMillimes'] as object) ?? {}), gte: query.minPrice }
    if (query.maxPrice !== undefined) where['priceMillimes'] = { ...((where['priceMillimes'] as object) ?? {}), lte: query.maxPrice }
    if (query.inStock) where['stock'] = { gt: 0 }
    if (query.isActive !== undefined) where['isActive'] = query.isActive
    else where['isActive'] = true

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        orderBy: { [query.sortBy]: query.sortDir },
        include: { category: true },
      }),
      prisma.product.count({ where }),
    ])
    return { data, total }
  },
  async listAdmin(query: ProductListQuery) {
    const where: Prisma.ProductWhereInput = {}
    if (query.search) {
      where['OR'] = [
        { name: { contains: query.search } },
        { description: { contains: query.search } },
      ]
    }
    if (query.categoryId) where['categoryId'] = query.categoryId
    if (query.isActive !== undefined) where['isActive'] = query.isActive

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        orderBy: { [query.sortBy]: query.sortDir },
        include: { category: true },
      }),
      prisma.product.count({ where }),
    ])
    return { data, total }
  },
  async create(data: {
    slug: string; name: string; description: string; priceMillimes: number;
    stock: number; categoryId: string; images: string; model3d: string; isActive: boolean
  }) {
    return prisma.product.create({ data, include: { category: true } })
  },
  async update(id: string, data: Partial<{
    slug: string; name: string; description: string; priceMillimes: number;
    stock: number; categoryId: string; images: string; model3d: string; isActive: boolean
  }>) {
    return prisma.product.update({ where: { id }, data, include: { category: true } })
  },
  async delete(id: string) {
    // Archive (soft delete) if orders exist, otherwise hard delete
    const orderCount = await prisma.orderItem.count({ where: { productId: id } })
    if (orderCount > 0) {
      return prisma.product.update({ where: { id }, data: { isActive: false } })
    }
    return prisma.product.delete({ where: { id } })
  },
  async lowStock(threshold = 5) {
    return prisma.product.findMany({
      where: { stock: { lte: threshold }, isActive: true },
      orderBy: { stock: 'asc' },
      take: 10,
      include: { category: true },
    })
  },
}
