import { Router } from 'express'
import { orderController } from '../controllers/order.controller'
import { validate } from '../middleware/validate'
import { requireAuth, requireRole } from '../middleware/auth'
import { CreateOrderSchema, OrderListQuerySchema, UpdateOrderStatusSchema } from '@lampe/shared'

const router = Router()

router.use(requireAuth)
router.post('/', validate(CreateOrderSchema), orderController.create)
router.get('/', validate(OrderListQuerySchema, 'query'), orderController.list)
router.get('/export', requireRole('ADMIN'), orderController.exportCsv)
router.get('/all', requireRole('ADMIN'), validate(OrderListQuerySchema, 'query'), orderController.listAll)
router.get('/:id', orderController.getById)
router.patch('/:id/status', requireRole('ADMIN'), validate(UpdateOrderStatusSchema), orderController.updateStatus)

export default router
