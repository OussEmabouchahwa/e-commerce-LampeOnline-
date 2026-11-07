import { Request, Response, NextFunction } from 'express'
import { analyticsRepository } from '../repositories/analytics.repository'

function getBotPattern() {
  return /bot|crawler|spider|crawling|googlebot|bingbot|slurp|duckduckbot|baidu|yandex|sogou|exabot|facebot|ia_archiver/i
}

export const analyticsController = {
  async recordVisit(req: Request, res: Response, next: NextFunction) {
    try {
      const ua = req.headers['user-agent'] ?? ''
      if (getBotPattern().test(ua)) { res.status(204).send(); return }

      const visitorId = (req.cookies['visitor_id'] as string | undefined) ?? `v-${Date.now()}`
      const sessionKey = (req.cookies['session_id'] as string | undefined) ?? `s-${Date.now()}`
      const { path, referrer } = req.body as { path: string; referrer?: string }

      await analyticsRepository.recordPageView({
        visitorId,
        userId: req.user?.id ?? null,
        path,
        referrer: referrer ?? null,
        sessionKey,
      })

      // Set visitor cookie (1 year, not httpOnly so JS can read for SPA)
      if (!req.cookies['visitor_id']) {
        res.cookie('visitor_id', visitorId, { maxAge: 365 * 24 * 60 * 60 * 1000, sameSite: 'lax' })
      }
      res.status(204).send()
    } catch (err) { next(err) }
  },

  async recordEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const visitorId = (req.cookies['visitor_id'] as string | undefined) ?? `v-${Date.now()}`
      const { event, productId } = req.body as { event: string; productId?: string }
      await analyticsRepository.recordFunnelEvent({
        visitorId,
        userId: req.user?.id ?? null,
        event,
        productId: productId ?? null,
      })
      res.status(204).send()
    } catch (err) { next(err) }
  },

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const range = parseInt((req.query['range'] as string | undefined) ?? '30', 10)
      const stats = await analyticsRepository.getStats(range)
      res.json(stats)
    } catch (err) { next(err) }
  },
}
