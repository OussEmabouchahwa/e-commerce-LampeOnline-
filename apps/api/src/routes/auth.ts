import { Router } from 'express'
import { authController } from '../controllers/auth.controller'
import { validate } from '../middleware/validate'
import { requireAuth } from '../middleware/auth'
import { RegisterSchema, LoginSchema, GoogleAuthSchema } from '@lampe/shared'

const router = Router()

router.post('/register', validate(RegisterSchema), authController.register)
router.post('/login', validate(LoginSchema), authController.login)
router.post('/google', validate(GoogleAuthSchema), authController.google)
router.post('/refresh', authController.refresh)
router.post('/logout', authController.logout)
router.get('/me', requireAuth, authController.me)

export default router
