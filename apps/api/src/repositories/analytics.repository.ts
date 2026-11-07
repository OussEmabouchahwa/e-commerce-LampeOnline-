import { prisma } from '../lib/prisma'

export const analyticsRepository = {
  async recordPageView(data: {
    visitorId: string
    userId: string | null
    path: string
    referrer: string | null
    sessionKey: string
  }) {
    // Dedup: one view per session+path combo within 30 min
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000)
    const existing = await prisma.pageView.findFirst({
      where: { sessionKey: data.sessionKey, path: data.path, createdAt: { gte: thirtyMinAgo } },
    })
    if (existing) return null
    return prisma.pageView.create({ data })
  },

  async recordFunnelEvent(data: {
    visitorId: string
    userId: string | null
    event: string
    productId: string | null
  }) {
    return prisma.funnelEvent.create({ data })
  },

  async getStats(rangeDays: number) {
    const now = new Date()
    const rangeStart = new Date(now.getTime() - rangeDays * 24 * 60 * 60 * 1000)
    const prevStart = new Date(rangeStart.getTime() - rangeDays * 24 * 60 * 60 * 1000)

    const [
      visits, prevVisits,
      uniqueVisitors, prevUniqueVisitors,
      newClients, prevNewClients,
      orders, prevOrders,
    ] = await Promise.all([
      prisma.pageView.count({ where: { createdAt: { gte: rangeStart } } }),
      prisma.pageView.count({ where: { createdAt: { gte: prevStart, lt: rangeStart } } }),
      prisma.pageView.groupBy({ by: ['visitorId'], where: { createdAt: { gte: rangeStart } } }).then((r) => r.length),
      prisma.pageView.groupBy({ by: ['visitorId'], where: { createdAt: { gte: prevStart, lt: rangeStart } } }).then((r) => r.length),
      prisma.user.count({ where: { createdAt: { gte: rangeStart }, role: 'CLIENT' } }),
      prisma.user.count({ where: { createdAt: { gte: prevStart, lt: rangeStart }, role: 'CLIENT' } }),
      prisma.order.findMany({ where: { createdAt: { gte: rangeStart }, status: { not: 'CANCELLED' } }, select: { totalMillimes: true } }),
      prisma.order.findMany({ where: { createdAt: { gte: prevStart, lt: rangeStart }, status: { not: 'CANCELLED' } }, select: { totalMillimes: true } }),
    ])

    const revenue = orders.reduce((sum, o) => sum + o.totalMillimes, 0)
    const prevRevenue = prevOrders.reduce((sum, o) => sum + o.totalMillimes, 0)
    const orderCount = orders.length
    const prevOrderCount = prevOrders.length
    const avgOrderValue = orderCount > 0 ? Math.round(revenue / orderCount) : 0
    const conversionRate = uniqueVisitors > 0 ? (orderCount / uniqueVisitors) * 100 : 0

    // Daily visits + revenue for chart
    const dailyVisits = await prisma.$queryRawUnsafe<Array<{ date: string; count: number }>>(
      `SELECT date(createdAt) as date, count(*) as count FROM PageView WHERE createdAt >= ? GROUP BY date(createdAt) ORDER BY date`,
      rangeStart.toISOString(),
    )

    // Funnel
    const funnelCounts = await prisma.funnelEvent.groupBy({
      by: ['event'],
      where: { createdAt: { gte: rangeStart } },
      _count: { _all: true },
    })

    // Orders by status
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      where: { createdAt: { gte: rangeStart } },
      _count: { _all: true },
    })

    // Top 5 products
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: { order: { createdAt: { gte: rangeStart }, status: { not: 'CANCELLED' } } },
      _sum: { qty: true },
      orderBy: { _sum: { qty: 'desc' } },
      take: 5,
    })
    const topProductDetails = await Promise.all(
      topProducts.map(async (tp) => {
        const product = await prisma.product.findUnique({ where: { id: tp.productId }, select: { name: true, slug: true } })
        return { productId: tp.productId, name: product?.name ?? 'Unknown', totalQty: tp._sum.qty ?? 0 }
      }),
    )

    // Latest orders
    const latestOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, status: true, totalMillimes: true, createdAt: true,
        user: { select: { name: true, email: true } },
      },
    })

    // Low stock
    const lowStock = await prisma.product.findMany({
      where: { stock: { lte: 5 }, isActive: true },
      select: { id: true, name: true, stock: true, slug: true },
      orderBy: { stock: 'asc' },
      take: 10,
    })

    return {
      kpis: {
        visits, prevVisits,
        uniqueVisitors, prevUniqueVisitors,
        newClients, prevNewClients,
        orders: orderCount, prevOrders: prevOrderCount,
        revenue, prevRevenue,
        avgOrderValue,
        conversionRate: Math.round(conversionRate * 100) / 100,
      },
      dailyVisits,
      funnel: funnelCounts.map((f) => ({ event: f.event, count: f._count._all })),
      ordersByStatus: ordersByStatus.map((o) => ({ status: o.status, count: o._count._all })),
      topProducts: topProductDetails,
      latestOrders,
      lowStock,
    }
  },
}
