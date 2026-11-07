import { Router } from 'express'
import { analyticsController } from '../controllers/analytics.controller'
import { requireAuth, requireRole } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { PageViewSchema, FunnelEventSchema } from '@lampe/shared'

const router = Router()

// Public endpoints (no auth required for visit tracking)
router.post('/visit', validate(PageViewSchema), analyticsController.recordVisit)
router.post('/event', validate(FunnelEventSchema), analyticsController.recordEvent)

// Admin stats
router.get('/stats', requireAuth, requireRole('ADMIN'), analyticsController.getStats)

export default router
