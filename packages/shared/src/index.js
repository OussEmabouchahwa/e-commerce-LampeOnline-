import { z } from 'zod';
// ─── Enums ────────────────────────────────────────────────────────────────────
export const UserRole = z.enum(['CLIENT', 'ADMIN']);
export const UserStatus = z.enum(['ACTIVE', 'BLOCKED']);
export const OrderStatus = z.enum(['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']);
export const PaymentMethod = z.enum(['MOCK_CARD', 'CASH_ON_DELIVERY']);
export const PaymentStatus = z.enum(['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED']);
export const FunnelEvent = z.enum(['product_view', 'add_to_cart', 'checkout_start', 'purchase']);
// ─── Auth ─────────────────────────────────────────────────────────────────────
export const RegisterSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(80),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});
export const LoginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});
export const GoogleAuthSchema = z.object({
    idToken: z.string().min(1),
    mock: z.boolean().optional(),
});
export const UserResponseSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    avatarUrl: z.string().nullable(),
    phone: z.string().nullable(),
    role: UserRole,
    status: UserStatus,
    createdAt: z.string(),
});
// ─── Category ─────────────────────────────────────────────────────────────────
export const CategorySchema = z.object({
    id: z.string(),
    slug: z.string(),
    name: z.string(),
});
export const CreateCategorySchema = z.object({
    name: z.string().min(2, 'Le nom doit comporter au moins 2 caractères').max(50),
    slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Le slug doit contenir des lettres minuscules, chiffres et tirets'),
});
export const UpdateCategorySchema = CreateCategorySchema.partial();
// ─── Product ──────────────────────────────────────────────────────────────────
export const Model3dSchema = z.object({
    shade: z.enum(['cone', 'sphere', 'cylinder', 'dome']),
    shadeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    stemColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    baseColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    colorTemp: z.number().min(2700).max(6500),
});
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
});
export const UpdateProductSchema = CreateProductSchema.partial();
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
});
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
});
// ─── Wishlist ─────────────────────────────────────────────────────────────────
export const WishlistItemSchema = z.object({
    productId: z.string().min(1),
});
// ─── Cart ─────────────────────────────────────────────────────────────────────
export const CartItemSchema = z.object({
    productId: z.string().min(1),
    qty: z.number().int().min(1).max(99),
});
export const CartSchema = z.array(CartItemSchema);
// ─── Orders ───────────────────────────────────────────────────────────────────
export const ShippingAddressSchema = z.object({
    fullName: z.string().min(2).max(100),
    phone: z.string().min(8).max(20),
    address: z.string().min(5).max(200),
    city: z.string().min(2).max(100),
    postalCode: z.string().min(4).max(10),
});
export const CreateOrderSchema = z.object({
    shippingAddress: ShippingAddressSchema,
    paymentMethod: PaymentMethod,
    idempotencyKey: z.string().uuid(),
    mockCardNumber: z.string().optional(),
});
export const OrderItemResponseSchema = z.object({
    id: z.string(),
    productId: z.string(),
    nameSnapshot: z.string(),
    priceSnapshot: z.number().int(),
    qty: z.number().int(),
});
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
});
export const UpdateOrderStatusSchema = z.object({
    status: OrderStatus,
});
export const OrderListQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(20),
    status: OrderStatus.optional(),
});
// ─── Analytics ────────────────────────────────────────────────────────────────
export const PageViewSchema = z.object({
    path: z.string().min(1).max(500),
    referrer: z.string().max(500).optional(),
});
export const FunnelEventSchema = z.object({
    event: FunnelEvent,
    productId: z.string().optional(),
});
export const StatsQuerySchema = z.object({
    range: z.enum(['7', '30', '90']).default('30'),
});
// ─── Admin ────────────────────────────────────────────────────────────────────
export const UpdateClientStatusSchema = z.object({
    status: UserStatus,
});
export const ClientListQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(20),
    search: z.string().optional(),
});
// ─── Pagination ───────────────────────────────────────────────────────────────
export const PaginatedResponseSchema = (itemSchema) => z.object({
    data: z.array(itemSchema),
    total: z.number().int(),
    page: z.number().int(),
    pageSize: z.number().int(),
    totalPages: z.number().int(),
});
// ─── Error response ───────────────────────────────────────────────────────────
export const ErrorResponseSchema = z.object({
    error: z.object({
        code: z.string(),
        message: z.string(),
        details: z.unknown().optional(),
    }),
});
// ─── Profile update ───────────────────────────────────────────────────────────
export const UpdateProfileSchema = z.object({
    name: z.string().min(2).max(80).optional(),
    phone: z.string().min(8).max(20).optional(),
});
export const ChangePasswordSchema = z
    .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128),
})
    .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});
//# sourceMappingURL=index.js.map