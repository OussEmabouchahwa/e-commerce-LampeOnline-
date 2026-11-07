import { Router } from 'express'
import { userController } from '../controllers/user.controller'
import { requireAuth, requireRole } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { ClientListQuerySchema, UpdateClientStatusSchema, UpdateProfileSchema, ChangePasswordSchema } from '@lampe/shared'

const router = Router()

// Client self-management
router.patch('/me', requireAuth, validate(UpdateProfileSchema), userController.updateProfile)
router.post('/me/password', requireAuth, validate(ChangePasswordSchema), userController.changePassword)

// Admin client management
router.get('/', requireAuth, requireRole('ADMIN'), validate(ClientListQuerySchema, 'query'), userController.listClients)
router.get('/:id', requireAuth, requireRole('ADMIN'), userController.getClient)
router.patch('/:id/status', requireAuth, requireRole('ADMIN'), validate(UpdateClientStatusSchema), userController.updateStatus)

export default router
