import { Router } from 'express'
import { cartController } from '../controllers/cart.controller'
import { validate } from '../middleware/validate'
import { requireAuth } from '../middleware/auth'
import { CartItemSchema } from '@lampe/shared'

const router = Router()

router.use(requireAuth)
router.get('/', cartController.get)
router.put('/', validate(CartItemSchema), cartController.upsert)
router.delete('/:productId', cartController.remove)
router.post('/merge', cartController.merge)
router.delete('/', cartController.clear)

export default router
