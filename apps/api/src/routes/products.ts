import { Router } from 'express'
import { productController } from '../controllers/product.controller'
import { validate } from '../middleware/validate'
import { requireAuth, requireRole } from '../middleware/auth'
import { ProductListQuerySchema, CreateProductSchema, UpdateProductSchema } from '@lampe/shared'
import multer from 'multer'
import path from 'path'
import { randomUUID } from 'crypto'

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${randomUUID()}${ext}`)
  },
})
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only JPEG, PNG and WebP images are allowed'))
    }
  },
})

const router = Router()

router.get('/categories', productController.getCategories)
router.get('/', validate(ProductListQuerySchema, 'query'), productController.list)
router.get('/:slug', productController.getBySlug)

// Admin routes
router.get(
  '/admin/list',
  requireAuth,
  requireRole('ADMIN'),
  validate(ProductListQuerySchema, 'query'),
  productController.listAdmin,
)
router.post(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  validate(CreateProductSchema),
  productController.create,
)
router.patch(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  validate(UpdateProductSchema),
  productController.update,
)
router.delete('/:id', requireAuth, requireRole('ADMIN'), productController.delete)
router.post(
  '/upload',
  requireAuth,
  requireRole('ADMIN'),
  upload.single('image'),
  productController.uploadImage,
)

export default router
