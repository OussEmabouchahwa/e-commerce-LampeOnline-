import { Router } from 'express'
import { wishlistController } from '../controllers/wishlist.controller'
import { validate } from '../middleware/validate'
import { requireAuth } from '../middleware/auth'
import { WishlistItemSchema } from '@lampe/shared'

const router = Router()

router.use(requireAuth)
router.get('/', wishlistController.list)
router.post('/', validate(WishlistItemSchema), wishlistController.add)
router.delete('/:productId', wishlistController.remove)

export default router
