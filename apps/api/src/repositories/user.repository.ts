import { prisma } from '../lib/prisma'

export const userRepository = {
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } })
  },
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } })
  },
  async findByGoogleId(googleId: string) {
    return prisma.user.findUnique({ where: { googleId } })
  },
  async create(data: {
    email: string
    name: string
    passwordHash?: string
    googleId?: string
    avatarUrl?: string
    phone?: string
    role?: string
  }) {
    return prisma.user.create({ data })
  },
  async update(id: string, data: Partial<{ name: string; phone: string; avatarUrl: string; passwordHash: string; status: string }>) {
    return prisma.user.update({ where: { id }, data })
  },
  async list(params: { page: number; pageSize: number; search?: string }) {
    const where = params.search
      ? {
          OR: [
            { name: { contains: params.search } },
            { email: { contains: params.search } },
          ],
          role: 'CLIENT' as const,
        }
      : { role: 'CLIENT' as const }
    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, email: true, name: true, avatarUrl: true, phone: true,
          role: true, status: true, createdAt: true,
          _count: { select: { orders: true } },
        },
      }),
      prisma.user.count({ where }),
    ])
    return { data, total }
  },
}
