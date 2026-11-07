import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  UpdateProfileSchema,
  ChangePasswordSchema,
  type UpdateProfileInput,
  type ChangePasswordInput,
  type OrderResponse,
  type ProductResponse,
} from '@lampe/shared'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/components/ui/Toast'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { SkeletonList, SkeletonCard } from '@/components/ui/Skeleton'
import { api, ApiError } from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import {
  User,
  ShoppingBag,
  Heart,
  KeyRound,
  LogOut,
  ExternalLink,
  Trash2,
  ShoppingCart,
} from 'lucide-react'

type TabKey = 'overview' | 'orders' | 'wishlist' | 'profile'

interface WishlistItemWithProduct {
  productId: string
  createdAt: string
  product: ProductResponse
}

export default function AccountPage() {
  const { user, logout } = useAuth()
  const { addItem } = useCart()
  const { toast } = useToast()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()

  const tabParam = searchParams.get('tab') as TabKey | null
  const activeTab: TabKey =
    tabParam && ['overview', 'orders', 'wishlist', 'profile'].includes(tabParam)
      ? tabParam
      : 'overview'

  const setActiveTab = (tab: TabKey) => {
    setSearchParams({ tab })
  }

  // Orders Query
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => api.get<{ data: OrderResponse[]; total: number }>('/orders?pageSize=10'),
    enabled: !!user,
  })

  // Wishlist Query
  const { data: wishlistData, isLoading: wishlistLoading } = useQuery({
    queryKey: ['my-wishlist'],
    queryFn: () => api.get<WishlistItemWithProduct[]>('/wishlist'),
    enabled: !!user,
  })

  // Remove Wishlist Mutation
  const removeWishlistMutation = useMutation({
    mutationFn: (productId: string) => api.delete(`/wishlist/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-wishlist'] })
      toast('Retiré de la liste de souhaits', 'info')
    },
  })

  // Profile Update Form
  const {
    register: regProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: {
      name: user?.name ?? '',
      phone: user?.phone ?? '',
    },
  })

  const onUpdateProfile = async (data: UpdateProfileInput) => {
    try {
      await api.patch('/users/me', data)
      toast('Profil mis à jour', 'success')
    } catch (err) {
      if (err instanceof ApiError) toast(err.message, 'error')
    }
  }

  // Password Change Form
  const {
    register: regPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(ChangePasswordSchema),
  })

  const onChangePassword = async (data: ChangePasswordInput) => {
    try {
      await api.post('/users/me/password', data)
      toast('Mot de passe modifié avec succès', 'success')
      resetPasswordForm()
    } catch (err) {
      if (err instanceof ApiError) toast(err.message, 'error')
    }
  }

  const handleLogout = async () => {
    await logout()
    toast('Déconnexion réussie', 'info')
    navigate('/')
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <Card className="p-8">
          <p className="text-xs text-mute mb-4">Veuillez vous connecter pour voir votre compte.</p>
          <Link to="/auth/login">
            <Button variant="primary" size="md">
              Se connecter
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  const latestOrder = ordersData?.data[0]

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 py-10">
      {/* Account Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line mb-8">
        <div>
          <h1 className="text-2xl font-heading font-bold text-ink">Mon espace client</h1>
          <p className="text-xs text-mute mt-1">
            Bonjour, <span className="font-semibold text-ink">{user.name}</span> ({user.email})
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-danger self-start">
          <LogOut size={16} /> Déconnexion
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-line pb-px mb-8 overflow-x-auto">
        {[
          { key: 'overview', label: 'Vue d’ensemble', icon: User },
          { key: 'orders', label: `Commandes (${ordersData?.total ?? 0})`, icon: ShoppingBag },
          { key: 'wishlist', label: `Coups de cœur (${wishlistData?.length ?? 0})`, icon: Heart },
          { key: 'profile', label: 'Paramètres du compte', icon: KeyRound },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-input border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-teal text-teal bg-surface'
                  : 'border-transparent text-mute hover:text-ink'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div>
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Last Order Card */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-heading font-bold text-ink uppercase tracking-wider">
                    Dernière commande
                  </h2>
                  {latestOrder && (
                    <Link
                      to={`/orders/${latestOrder.id}`}
                      className="text-xs text-teal hover:underline flex items-center gap-1"
                    >
                      Détails <ExternalLink size={12} />
                    </Link>
                  )}
                </div>

                {ordersLoading ? (
                  <SkeletonList count={1} />
                ) : latestOrder ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono text-mute">{latestOrder.id}</span>
                      <Badge>{latestOrder.status}</Badge>
                    </div>
                    <p className="text-xs text-mute">Passée le {formatDate(latestOrder.createdAt)}</p>
                    <div className="pt-2 border-t border-line flex justify-between items-center text-xs">
                      <span>{latestOrder.items.length} article(s)</span>
                      <span className="font-bold text-teal">
                        {formatPrice(latestOrder.totalMillimes)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-mute">Aucune commande pour le moment.</p>
                )}
              </Card>

              {/* Wishlist Summary Card */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-heading font-bold text-ink uppercase tracking-wider">
                    Vos coups de cœur
                  </h2>
                  <button
                    onClick={() => setActiveTab('wishlist')}
                    className="text-xs text-teal hover:underline"
                  >
                    Voir tout
                  </button>
                </div>

                {wishlistLoading ? (
                  <SkeletonList count={2} />
                ) : wishlistData && wishlistData.length > 0 ? (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {wishlistData.slice(0, 4).map((item) => (
                      <Link
                        key={item.productId}
                        to={`/products/${item.product.slug}`}
                        className="group flex-shrink-0"
                      >
                        <img
                          src={item.product.images[0] ?? ''}
                          alt={item.product.name}
                          className="w-16 h-16 rounded-input object-cover border border-line group-hover:border-teal transition-colors"
                        />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-mute">Votre liste de souhaits est vide.</p>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {ordersLoading ? (
              <SkeletonList count={4} />
            ) : ordersData && ordersData.data.length > 0 ? (
              <div className="space-y-4">
                {ordersData.data.map((order) => (
                  <Card key={order.id} className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-line mb-4">
                      <div>
                        <span className="font-mono text-xs text-ink font-semibold">
                          Commande #{order.id}
                        </span>
                        <p className="text-[11px] text-mute">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge>{order.status}</Badge>
                        <Link to={`/orders/${order.id}`}>
                          <Button variant="secondary" size="sm">
                            Suivi & Détails
                          </Button>
                        </Link>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                      <div>
                        <p className="font-medium text-ink">
                          {order.items.map((i) => i.nameSnapshot).join(', ')}
                        </p>
                        <p className="text-mute text-[11px] mt-0.5">
                          Mode de paiement :{' '}
                          {order.paymentMethod === 'MOCK_CARD' ? 'Carte bancaire' : 'Espèces à la livraison'}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-teal">
                          {formatPrice(order.totalMillimes)}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <ShoppingBag size={36} className="text-line mx-auto mb-3" />
                <p className="text-xs text-mute mb-4">Vous n&apos;avez pas encore passé de commande.</p>
                <Link to="/products">
                  <Button variant="primary" size="sm">
                    Découvrir le catalogue
                  </Button>
                </Link>
              </Card>
            )}
          </div>
        )}

        {/* WISHLIST TAB */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlistLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : wishlistData && wishlistData.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistData.map((item) => (
                  <Card key={item.productId} className="overflow-hidden flex flex-col justify-between group">
                    <Link to={`/products/${item.product.slug}`} className="block">
                      <div className="relative aspect-[4/3] overflow-hidden bg-bg">
                        <img
                          src={item.product.images[0] ?? ''}
                          alt={item.product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <div className="p-4">
                        <p className="text-[11px] text-mute mb-1">{item.product.category?.name ?? 'Luminaire'}</p>
                        <h3 className="text-xs font-bold text-ink mb-1 truncate group-hover:text-teal transition-colors">
                          {item.product.name}
                        </h3>
                        <p className="text-xs font-bold text-teal">
                          {formatPrice(item.product.priceMillimes)}
                        </p>
                      </div>
                    </Link>
                    <div className="p-4 pt-0 flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1 gap-1"
                        onClick={() => {
                          addItem({
                            productId: item.product.id,
                            qty: 1,
                            name: item.product.name,
                            priceMillimes: item.product.priceMillimes,
                            image: item.product.images[0] ?? '',
                            slug: item.product.slug,
                          })
                          toast(`Ajouté au panier`, 'success')
                        }}
                      >
                        <ShoppingCart size={14} /> Ajouter au panier
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-danger hover:bg-danger/10"
                        onClick={() => removeWishlistMutation.mutate(item.productId)}
                        aria-label="Supprimer de la liste"
                        title="Retirer des coups de cœur"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Heart size={36} className="text-line mx-auto mb-3" />
                <p className="text-xs text-mute mb-4">Votre liste de souhaits est vide.</p>
                <Link to="/products">
                  <Button variant="primary" size="sm">
                    Explorer les produits
                  </Button>
                </Link>
              </Card>
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6">
              <h2 className="text-xs font-heading font-bold text-ink uppercase tracking-wider mb-4">
                Informations personnelles
              </h2>
              <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
                <Input
                  label="Nom complet"
                  error={profileErrors.name?.message}
                  {...regProfile('name')}
                />
                <Input
                  label="Numéro de téléphone"
                  type="tel"
                  placeholder="+216 -- --- ---"
                  error={profileErrors.phone?.message}
                  {...regProfile('phone')}
                />
                <Button type="submit" variant="primary" size="sm" isLoading={profileSubmitting}>
                  Enregistrer les modifications
                </Button>
              </form>
            </Card>

            <Card className="p-6">
              <h2 className="text-xs font-heading font-bold text-ink uppercase tracking-wider mb-4">
                Modifier le mot de passe
              </h2>
              <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4">
                <Input
                  label="Mot de passe actuel"
                  type="password"
                  error={passwordErrors.currentPassword?.message}
                  {...regPassword('currentPassword')}
                />
                <Input
                  label="Nouveau mot de passe"
                  type="password"
                  error={passwordErrors.newPassword?.message}
                  {...regPassword('newPassword')}
                />
                <Input
                  label="Confirmer le nouveau mot de passe"
                  type="password"
                  error={passwordErrors.confirmPassword?.message}
                  {...regPassword('confirmPassword')}
                />
                <Button type="submit" variant="secondary" size="sm" isLoading={passwordSubmitting}>
                  Mettre à jour le mot de passe
                </Button>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
