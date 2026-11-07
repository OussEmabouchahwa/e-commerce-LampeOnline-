import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Heart, Package, Box, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { ProductViewer3D } from '@/components/3d/ProductViewer3D'
import { api } from '@/lib/api'
import { formatPrice, cn } from '@/lib/utils'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
import type { ProductResponse } from '@lampe/shared'

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const { addItem } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedImg, setSelectedImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [viewMode, setViewMode] = useState<'photo' | '3d'>('photo')

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => api.get<ProductResponse>(`/products/${slug!}`),
    enabled: !!slug,
  })

  // Check if product is in wishlist
  const { data: wishlistData } = useQuery({
    queryKey: ['my-wishlist'],
    queryFn: () => api.get<Array<{ productId: string }>>('/wishlist'),
    enabled: !!user,
  })

  const isWishlisted = !!wishlistData?.some((item) => item.productId === product?.id)

  const handleToggleWishlist = async () => {
    if (!user) {
      toast('Connectez-vous pour ajouter ce produit à vos coups de cœur', 'info')
      return
    }
    if (!product) return

    try {
      if (isWishlisted) {
        await api.delete(`/wishlist/${product.id}`)
        toast('Retiré de vos coups de cœur', 'info')
      } else {
        await api.post('/wishlist', { productId: product.id })
        toast('Ajouté à vos coups de cœur !', 'success')
      }
      queryClient.invalidateQueries({ queryKey: ['my-wishlist'] })
    } catch {
      toast('Une erreur est survenue', 'error')
    }
  }

  if (isLoading) return (
    <div className="max-w-content mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-12">
      <Skeleton className="aspect-square rounded-card" />
      <div className="space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  )

  if (isError || !product) return (
    <div className="max-w-content mx-auto px-4 sm:px-6 py-20 text-center">
      <p className="text-sm text-danger mb-4">Product not found</p>
      <Button variant="secondary" size="md" onClick={() => navigate('/products')}>Back to catalogue</Button>
    </div>
  )

  const images = product.images.length > 0 ? product.images : ['https://picsum.photos/seed/lamp/800/600']
  const image = images[selectedImg] ?? images[0] ?? ''

  function handleAddToCart() {
    addItem({ productId: product!.id, qty, name: product!.name, priceMillimes: product!.priceMillimes, image, slug: product!.slug })
    toast(`Added "${product!.name}" to cart`, 'success')
  }

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-mute mb-8" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-ink transition-colors">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-ink transition-colors">Catalogue</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link to={`/products?categoryId=${product.category.slug}`} className="hover:text-ink transition-colors">
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Visual Media with Photo/3D switcher */}
        <div>
          <div className="flex justify-end gap-1 mb-2">
            <button
              onClick={() => setViewMode('photo')}
              className={cn(
                'px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors',
                viewMode === 'photo'
                  ? 'bg-teal text-white'
                  : 'bg-surface text-mute hover:text-ink border border-line',
              )}
            >
              <ImageIcon size={13} /> Photo
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={cn(
                'px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors',
                viewMode === '3d'
                  ? 'bg-teal text-white'
                  : 'bg-surface text-mute hover:text-ink border border-line',
              )}
            >
              <Box size={13} /> Vue 3D
            </button>
          </div>

          {viewMode === '3d' && product.model3d ? (
            <ProductViewer3D model={product.model3d} />
          ) : (
            <>
              <motion.div
                layoutId={`product-image-${product.id}`}
                className="aspect-square rounded-card overflow-hidden bg-bg mb-4 border border-line"
              >
                <img
                  src={image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  width={600}
                  height={600}
                />
              </motion.div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImg(i)}
                      className={cn(
                        'flex-shrink-0 h-16 w-16 rounded-input overflow-hidden border-2 transition-colors',
                        i === selectedImg ? 'border-teal' : 'border-line hover:border-mute',
                      )}
                    >
                      <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-6">
          {product.category && (
            <Badge variant="mute">{product.category.name}</Badge>
          )}
          <h1 className="text-xl font-heading font-bold text-ink">{product.name}</h1>
          <div className="text-2xl font-bold text-teal">{formatPrice(product.priceMillimes)}</div>

          {/* Stock */}
          <div className="flex items-center gap-2">
            <Package size={16} className={product.stock > 0 ? 'text-ok' : 'text-danger'} />
            <span className={cn('text-xs', product.stock > 0 ? 'text-ok' : 'text-danger')}>
              {product.stock === 0 ? 'Out of stock' : product.stock <= 5 ? `Only ${product.stock} remaining` : 'In stock'}
            </span>
          </div>

          <p className="text-xs text-mute leading-relaxed">{product.description}</p>

          {/* Qty + Add to cart */}
          {product.stock > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-line rounded-input overflow-hidden">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-3 py-2 text-mute hover:text-ink hover:bg-line transition-colors"
                  aria-label="Decrease quantity"
                >−</button>
                <span className="px-4 py-2 text-xs font-medium text-ink border-x border-line">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  className="px-3 py-2 text-mute hover:text-ink hover:bg-line transition-colors"
                  aria-label="Increase quantity"
                >+</button>
              </div>
              <Button variant="primary" size="lg" onClick={handleAddToCart} className="flex-1 gap-2">
                <ShoppingCart size={16} /> Add to cart
              </Button>
              <button
                onClick={handleToggleWishlist}
                className="p-3 border border-line rounded-input hover:border-bulb transition-colors"
                aria-label={isWishlisted ? 'Retirer de vos coups de cœur' : 'Ajouter à vos coups de cœur'}
                title={isWishlisted ? 'Retirer de vos coups de cœur' : 'Ajouter à vos coups de cœur'}
              >
                <Heart size={18} className={cn(isWishlisted ? 'fill-bulb text-bulb' : 'text-mute')} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
