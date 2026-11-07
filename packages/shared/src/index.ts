import { z } from 'zod'

// ─── Enums ────────────────────────────────────────────────────────────────────

export const UserRole = z.enum(['CLIENT', 'ADMIN'])
export type UserRole = z.infer<typeof UserRole>

export const UserStatus = z.enum(['ACTIVE', 'BLOCKED'])
export type UserStatus = z.infer<typeof UserStatus>

export const OrderStatus = z.enum(['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
export type OrderStatus = z.infer<typeof OrderStatus>

export const PaymentMethod = z.enum(['MOCK_CARD', 'CASH_ON_DELIVERY'])
export type PaymentMethod = z.infer<typeof PaymentMethod>

export const PaymentStatus = z.enum(['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'])
export type PaymentStatus = z.infer<typeof PaymentStatus>

export const FunnelEvent = z.enum(['product_view', 'add_to_cart', 'checkout_start', 'purchase'])
export type FunnelEvent = z.infer<typeof FunnelEvent>

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
})
export type RegisterInput = z.infer<typeof RegisterSchema>

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})
export type LoginInput = z.infer<typeof LoginSchema>

export const GoogleAuthSchema = z.object({
  idToken: z.string().min(1),
  mock: z.boolean().optional(),
})
export type GoogleAuthInput = z.infer<typeof GoogleAuthSchema>

export const UserResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
  phone: z.string().nullable(),
  role: UserRole,
  status: UserStatus,
  createdAt: z.string(),
})
export type UserResponse = z.infer<typeof UserResponseSchema>

// ─── Category ─────────────────────────────────────────────────────────────────

export const CategorySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
})
export type Category = z.infer<typeof CategorySchema>

export const CreateCategorySchema = z.object({
  name: z.string().min(2, 'Le nom doit comporter au moins 2 caractères').max(50),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Le slug doit contenir des lettres minuscules, chiffres et tirets'),
})
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>

export const UpdateCategorySchema = CreateCategorySchema.partial()
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>

// ─── Product ──────────────────────────────────────────────────────────────────

export const Model3dSchema = z.object({
  shade: z.enum(['cone', 'sphere', 'cylinder', 'dome']),
  shadeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  stemColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  baseColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  colorTemp: z.number().min(2700).max(6500),
})
export type Model3d = z.infer<typeof Model3dSchema>

export const CreateProductSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/),
  description: z.string().min(10).max(5000),
  priceMillimes: z.number().int().positive(),
  stock: z.number().int().min(0),
  categoryId: z.string().min(1),
  images: z.array(z.string().url()).min(1).max(10),
  model3d: Model3dSchema,
  isActive: z.boolean().default(true),
})
export type CreateProductInput = z.infer<typeof CreateProductSchema>

export const UpdateProductSchema = CreateProductSchema.partial()
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>

export const ProductResponseSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  priceMillimes: z.number().int(),
  stock: z.number().int(),
  categoryId: z.string(),
  category: CategorySchema.optional(),
  images: z.array(z.string()),
  model3d: Model3dSchema,
  isActive: z.boolean(),
  createdAt: z.string(),
})
export type ProductResponse = z.infer<typeof ProductResponseSchema>

export const ProductListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  inStock: z.coerce.boolean().optional(),
  sortBy: z.enum(['createdAt', 'priceMillimes', 'name', 'stock']).default('createdAt'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
  isActive: z.coerce.boolean().optional(),
})
export type ProductListQuery = z.infer<typeof ProductListQuerySchema>

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export const WishlistItemSchema = z.object({
  productId: z.string().min(1),
})
export type WishlistItemInput = z.infer<typeof WishlistItemSchema>

// ─── Cart ─────────────────────────────────────────────────────────────────────

export const CartItemSchema = z.object({
  productId: z.string().min(1),
  qty: z.number().int().min(1).max(99),
})
export type CartItemInput = z.infer<typeof CartItemSchema>

export const CartSchema = z.array(CartItemSchema)
export type Cart = z.infer<typeof CartSchema>

// ─── Orders ───────────────────────────────────────────────────────────────────

export const ShippingAddressSchema = z.object({
  fullName: z.string().min(2).max(100),
  phone: z.string().min(8).max(20),
  address: z.string().min(5).max(200),
  city: z.string().min(2).max(100),
  postalCode: z.string().min(4).max(10),
})
export type ShippingAddress = z.infer<typeof ShippingAddressSchema>

export const CreateOrderSchema = z.object({
  shippingAddress: ShippingAddressSchema,
  paymentMethod: PaymentMethod,
  idempotencyKey: z.string().uuid(),
  mockCardNumber: z.string().optional(),
})
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>

export const OrderItemResponseSchema = z.object({
  id: z.string(),
  productId: z.string(),
  nameSnapshot: z.string(),
  priceSnapshot: z.number().int(),
  qty: z.number().int(),
})
export type OrderItemResponse = z.infer<typeof OrderItemResponseSchema>

export const OrderResponseSchema = z.object({
  id: z.string(),
  status: OrderStatus,
  totalMillimes: z.number().int(),
  paymentMethod: PaymentMethod,
  paymentStatus: PaymentStatus,
  shippingAddress: ShippingAddressSchema,
  idempotencyKey: z.string(),
  items: z.array(OrderItemResponseSchema),
  createdAt: z.string(),
})
export type OrderResponse = z.infer<typeof OrderResponseSchema>

export const UpdateOrderStatusSchema = z.object({
  status: OrderStatus,
})
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>

export const OrderListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  status: OrderStatus.optional(),
})
export type OrderListQuery = z.infer<typeof OrderListQuerySchema>

// ─── Analytics ────────────────────────────────────────────────────────────────

export const PageViewSchema = z.object({
  path: z.string().min(1).max(500),
  referrer: z.string().max(500).optional(),
})
export type PageViewInput = z.infer<typeof PageViewSchema>

export const FunnelEventSchema = z.object({
  event: FunnelEvent,
  productId: z.string().optional(),
})
export type FunnelEventInput = z.infer<typeof FunnelEventSchema>

export const StatsQuerySchema = z.object({
  range: z.enum(['7', '30', '90']).default('30'),
})
export type StatsQuery = z.infer<typeof StatsQuerySchema>

// ─── Admin ────────────────────────────────────────────────────────────────────

export const UpdateClientStatusSchema = z.object({
  status: UserStatus,
})
export type UpdateClientStatusInput = z.infer<typeof UpdateClientStatusSchema>

export const ClientListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  search: z.string().optional(),
})
export type ClientListQuery = z.infer<typeof ClientListQuerySchema>

// ─── Pagination ───────────────────────────────────────────────────────────────

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    total: z.number().int(),
    page: z.number().int(),
    pageSize: z.number().int(),
    totalPages: z.number().int(),
  })

// ─── Error response ───────────────────────────────────────────────────────────

export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
})
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>

// ─── Profile update ───────────────────────────────────────────────────────────

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  phone: z.string().min(8).max(20).optional(),
})
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>
