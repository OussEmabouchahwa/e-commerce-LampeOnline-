import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  CreateProductSchema,
  CreateCategorySchema,
  type CreateProductInput,
  type CreateCategoryInput,
  type ProductResponse,
  type OrderResponse,
  type Category,
} from '@lampe/shared'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Drawer } from '@/components/ui/Drawer'
import { Logo } from '@/components/ui/Logo'
import { SkeletonList } from '@/components/ui/Skeleton'
import { api, ApiError } from '@/lib/api'
import { formatPrice, formatDate, pctChange, slugify } from '@/lib/utils'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  AlertTriangle,
  Download,
  Plus,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Check,
} from 'lucide-react'

type AdminSection = 'dashboard' | 'products' | 'categories' | 'orders' | 'clients'

interface AdminStats {
  kpis: {
    visits: number
    prevVisits: number
    uniqueVisitors: number
    prevUniqueVisitors: number
    newClients: number
    prevNewClients: number
    orders: number
    prevOrders: number
    revenue: number
    prevRevenue: number
    avgOrderValue: number
    conversionRate: number
  }
  dailyVisits: Array<{ date: string; count: number }>
  funnel: Array<{ event: string; count: number }>
  ordersByStatus: Array<{ status: string; count: number }>
  topProducts: Array<{ productId: string; name: string; totalQty: number }>
  latestOrders: Array<{
    id: string
    status: string
    totalMillimes: number
    createdAt: string
    user: { name: string; email: string }
  }>
  lowStock: Array<{ id: string; name: string; stock: number; slug: string }>
}

interface CategoryWithCount extends Category {
  _count?: { products: number }
}

interface ClientListItem {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  status: string
  createdAt: string
  orderCount: number
}

export default function AdminPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [section, setSection] = useState<AdminSection>('dashboard')
  const [rangeDays, setRangeDays] = useState<'7' | '30' | '90'>('30')
  const [productDrawerOpen, setProductDrawerOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null)

  // Category modal states
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryWithCount | null>(null)

  const isAdmin = Boolean(user && user.role === 'ADMIN')

  // Stats query
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats', rangeDays],
    queryFn: () => api.get<AdminStats>(`/analytics/stats?range=${rangeDays}`),
    enabled: isAdmin && section === 'dashboard',
  })

  // Products query
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => api.get<{ data: ProductResponse[]; total: number }>('/products/admin/list?pageSize=50'),
    enabled: isAdmin && section === 'products',
  })

  // Categories query
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<CategoryWithCount[]>('/products/categories'),
  })

  // Orders query
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => api.get<{ data: OrderResponse[]; total: number }>('/orders/all?pageSize=50'),
    enabled: isAdmin && section === 'orders',
  })

  // Clients query
  const { data: clientsData, isLoading: clientsLoading } = useQuery({
    queryKey: ['admin-clients'],
    queryFn: () => api.get<{ data: ClientListItem[]; total: number }>('/users?pageSize=50'),
    enabled: isAdmin && section === 'clients',
  })

  // Product mutations
  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast('Produit archivé', 'info')
    },
  })

  // Category mutations
  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/products/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast('Catégorie supprimée avec succès', 'info')
    },
    onError: (err: ApiError) => toast(err.message, 'error'),
  })

  // Order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      api.patch(`/orders/${orderId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      toast('Statut de commande mis à jour', 'success')
    },
    onError: (err: ApiError) => toast(err.message, 'error'),
  })

  // Client status mutation
  const updateClientStatusMutation = useMutation({
    mutationFn: ({ clientId, status }: { clientId: string; status: string }) =>
      api.patch(`/users/${clientId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-clients'] })
      toast('Statut client mis à jour', 'success')
    },
    onError: (err: ApiError) => toast(err.message, 'error'),
  })

  // Export CSV
  const handleExportCsv = () => {
    window.open('/api/orders/export', '_blank')
  }

  // Auth guard: must be ADMIN
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <Card className="p-8">
          <p className="text-xs text-danger mb-4">Accès réservé aux administrateurs.</p>
          <Link to="/">
            <Button variant="secondary" size="md">
              Retour à l&apos;accueil
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Admin Sidebar */}
      <aside className="w-60 border-r border-line bg-surface flex flex-col justify-between p-4 flex-shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <Logo size="sm" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-mute">Admin</span>
          </div>

          <nav className="space-y-1">
            {[
              { key: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
              { key: 'products', label: 'Luminaires', icon: Package },
              { key: 'categories', label: 'Catégories', icon: Layers },
              { key: 'orders', label: 'Commandes', icon: ShoppingBag },
              { key: 'clients', label: 'Clients', icon: Users },
            ].map((item) => {
              const Icon = item.icon
              const isActive = section === item.key
              return (
                <button
                  key={item.key}
                  onClick={() => setSection(item.key as AdminSection)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-input transition-colors ${
                    isActive
                      ? 'bg-teal text-white shadow-low'
                      : 'text-mute hover:text-ink hover:bg-line/40'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>

        <Link
          to="/"
          className="flex items-center gap-2 text-xs text-mute hover:text-ink px-3 py-2 rounded-input hover:bg-line/40 transition-colors"
        >
          <ArrowLeft size={16} />
          Retour à la boutique
        </Link>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-8 overflow-y-auto bg-bg">
        {/* DASHBOARD SECTION */}
        {section === 'dashboard' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-heading font-bold text-ink">Statistiques générales</h1>
                <p className="text-xs text-mute">Activité et performances de LampeOnline</p>
              </div>

              {/* Period selector */}
              <div className="flex items-center gap-1 bg-surface p-1 rounded-input border border-line">
                {(['7', '30', '90'] as const).map((days) => (
                  <button
                    key={days}
                    onClick={() => setRangeDays(days)}
                    className={`px-3 py-1 text-xs font-semibold rounded ${
                      rangeDays === days ? 'bg-teal text-white' : 'text-mute hover:text-ink'
                    }`}
                  >
                    {days} jours
                  </button>
                ))}
              </div>
            </div>

            {statsLoading || !stats ? (
              <SkeletonList count={4} />
            ) : (
              <>
                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <KpiCard
                    title="Chiffre d’affaires"
                    value={formatPrice(stats.kpis.revenue)}
                    prevValue={formatPrice(stats.kpis.prevRevenue)}
                    change={pctChange(stats.kpis.revenue, stats.kpis.prevRevenue)}
                  />
                  <KpiCard
                    title="Commandes"
                    value={String(stats.kpis.orders)}
                    prevValue={String(stats.kpis.prevOrders)}
                    change={pctChange(stats.kpis.orders, stats.kpis.prevOrders)}
                  />
                  <KpiCard
                    title="Visites uniques"
                    value={String(stats.kpis.uniqueVisitors)}
                    prevValue={String(stats.kpis.prevUniqueVisitors)}
                    change={pctChange(stats.kpis.uniqueVisitors, stats.kpis.prevUniqueVisitors)}
                  />
                  <KpiCard
                    title="Taux de conversion"
                    value={`${stats.kpis.conversionRate}%`}
                    prevValue="Visite → Achat"
                    highlight
                  />
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Daily Visits Chart */}
                  <Card className="p-6">
                    <h2 className="text-xs font-heading font-bold text-ink uppercase tracking-wider mb-4">
                      Fréquentation quotidienne ({stats.dailyVisits.length} jours enregistrés)
                    </h2>
                    <div className="h-64">
                      {stats.dailyVisits.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-xs text-mute">
                          Aucune visite enregistrée pour cette période.
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats.dailyVisits}>
                            <XAxis
                              dataKey="date"
                              stroke="var(--mute)"
                              fontSize={10}
                              tickFormatter={(d: string) => d.slice(5)}
                            />
                            <YAxis stroke="var(--mute)" fontSize={10} allowDecimals={false} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'var(--surface)',
                                borderColor: 'var(--line)',
                                borderRadius: '8px',
                                fontSize: '11px',
                              }}
                            />
                            <Bar dataKey="count" fill="var(--teal)" radius={[4, 4, 0, 0]} name="Visites" />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </Card>

                  {/* Funnel Chart */}
                  <Card className="p-6">
                    <h2 className="text-xs font-heading font-bold text-ink uppercase tracking-wider mb-4">
                      Tunnel de conversion
                    </h2>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.funnel} layout="vertical">
                          <XAxis type="number" stroke="var(--mute)" fontSize={10} allowDecimals={false} />
                          <YAxis dataKey="event" type="category" stroke="var(--mute)" fontSize={10} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'var(--surface)',
                              borderColor: 'var(--line)',
                              borderRadius: '8px',
                              fontSize: '11px',
                            }}
                          />
                          <Bar dataKey="count" fill="var(--bulb)" radius={[0, 4, 4, 0]} name="Événements" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>

                {/* Low Stock & Latest Orders */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Low Stock Alert */}
                  <Card className="p-6">
                    <h2 className="text-xs font-heading font-bold text-ink uppercase tracking-wider mb-4 flex items-center gap-2">
                      <AlertTriangle size={16} className="text-danger" />
                      Alertes stock faible (≤ 5)
                    </h2>
                    {stats.lowStock.length === 0 ? (
                      <p className="text-xs text-mute">Tous les stocks sont suffisants.</p>
                    ) : (
                      <ul className="divide-y divide-line">
                        {stats.lowStock.map((prod) => (
                          <li
                            key={prod.id}
                            className="py-2.5 flex items-center justify-between text-xs"
                          >
                            <span className="font-medium text-ink truncate">{prod.name}</span>
                            <Badge variant={prod.stock === 0 ? 'danger' : 'bulb'}>
                              {prod.stock === 0 ? 'Rupture' : `${prod.stock} restant(s)`}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    )}
                  </Card>

                  {/* Latest Orders */}
                  <Card className="p-6">
                    <h2 className="text-xs font-heading font-bold text-ink uppercase tracking-wider mb-4">
                      Dernières commandes
                    </h2>
                    {stats.latestOrders.length === 0 ? (
                      <p className="text-xs text-mute">Aucune commande récente.</p>
                    ) : (
                      <ul className="divide-y divide-line">
                        {stats.latestOrders.map((o) => (
                          <li key={o.id} className="py-2.5 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-semibold text-ink">{o.user?.name ?? 'Client'}</p>
                              <p className="text-[10px] text-mute">{formatDate(o.createdAt)}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-teal">{formatPrice(o.totalMillimes)}</p>
                              <Badge>{o.status}</Badge>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </Card>
                </div>
              </>
            )}
          </div>
        )}

        {/* PRODUCTS SECTION */}
        {section === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-heading font-bold text-ink">Gestion des luminaires</h1>
                <p className="text-xs text-mute">Ajoutez, modifiez ou archivez vos produits avec gestion des photos</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setEditingProduct(null)
                  setProductDrawerOpen(true)
                }}
                className="gap-2"
              >
                <Plus size={16} /> Nouveau luminaire
              </Button>
            </div>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface/50 border-b border-line text-mute uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Produit</th>
                      <th className="p-4">Catégorie</th>
                      <th className="p-4">Prix</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4">Statut</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {productsLoading ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-mute">
                          Chargement des produits...
                        </td>
                      </tr>
                    ) : (
                      productsData?.data.map((prod) => (
                        <tr key={prod.id} className="hover:bg-line/20 transition-colors">
                          <td className="p-4 flex items-center gap-3">
                            <img
                              src={prod.images[0] ?? ''}
                              alt=""
                              className="w-10 h-10 object-cover rounded-input bg-line flex-shrink-0"
                            />
                            <div>
                              <p className="font-semibold text-ink">{prod.name}</p>
                              <p className="text-[11px] text-mute font-mono">{prod.slug}</p>
                            </div>
                          </td>
                          <td className="p-4 text-mute">{prod.category?.name ?? '—'}</td>
                          <td className="p-4 font-bold text-teal">
                            {formatPrice(prod.priceMillimes)}
                          </td>
                          <td className="p-4">
                            <span className={prod.stock <= 5 ? 'text-danger font-bold' : 'text-ink'}>
                              {prod.stock}
                            </span>
                          </td>
                          <td className="p-4">
                            <Badge variant={prod.isActive ? 'ok' : 'mute'}>
                              {prod.isActive ? 'Actif' : 'Archivé'}
                            </Badge>
                          </td>
                          <td className="p-4 text-right space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingProduct(prod)
                                setProductDrawerOpen(true)
                              }}
                              aria-label="Modifier"
                              title="Modifier le produit et ses photos"
                            >
                              <Edit2 size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-danger hover:bg-danger/10"
                              onClick={() => {
                                if (confirm(`Archiver le luminaire "${prod.name}" ?`)) {
                                  deleteProductMutation.mutate(prod.id)
                                }
                              }}
                              aria-label="Archiver"
                              title="Archiver"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Product Create/Edit Drawer */}
            <Drawer
              open={productDrawerOpen}
              onClose={() => setProductDrawerOpen(false)}
              title={editingProduct ? 'Modifier le luminaire' : 'Ajouter un luminaire'}
              className="max-w-xl"
            >
              <ProductFormDrawer
                initialData={editingProduct}
                categories={categories ?? []}
                onSuccess={() => {
                  setProductDrawerOpen(false)
                  queryClient.invalidateQueries({ queryKey: ['admin-products'] })
                }}
              />
            </Drawer>
          </div>
        )}

        {/* CATEGORIES SECTION */}
        {section === 'categories' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-heading font-bold text-ink">Gestion des catégories</h1>
                <p className="text-xs text-mute">Créez, renommez ou supprimez vos catégories de luminaires</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setEditingCategory(null)
                  setCategoryModalOpen(true)
                }}
                className="gap-2"
              >
                <Plus size={16} /> Nouvelle catégorie
              </Button>
            </div>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface/50 border-b border-line text-mute uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Nom de la catégorie</th>
                      <th className="p-4">Slug URL</th>
                      <th className="p-4">Nombre de produits</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {categoriesLoading ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-mute">
                          Chargement des catégories...
                        </td>
                      </tr>
                    ) : (
                      categories?.map((cat) => (
                        <tr key={cat.id} className="hover:bg-line/20 transition-colors">
                          <td className="p-4 font-semibold text-ink">{cat.name}</td>
                          <td className="p-4 font-mono text-mute">{cat.slug}</td>
                          <td className="p-4 font-semibold text-teal">
                            {cat._count?.products ?? 0} luminaire(s)
                          </td>
                          <td className="p-4 text-right space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingCategory(cat)
                                setCategoryModalOpen(true)
                              }}
                              aria-label="Modifier"
                              title="Modifier la catégorie"
                            >
                              <Edit2 size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-danger hover:bg-danger/10"
                              onClick={() => {
                                if (
                                  confirm(
                                    `Voulez-vous supprimer la catégorie "${cat.name}" ?`,
                                  )
                                ) {
                                  deleteCategoryMutation.mutate(cat.id)
                                }
                              }}
                              aria-label="Supprimer"
                              title="Supprimer la catégorie"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Category Modal */}
            <Modal
              open={categoryModalOpen}
              onClose={() => setCategoryModalOpen(false)}
              title={editingCategory ? 'Modifier la catégorie' : 'Créer une catégorie'}
              size="sm"
            >
              <CategoryFormModal
                initialData={editingCategory}
                onSuccess={() => {
                  setCategoryModalOpen(false)
                  queryClient.invalidateQueries({ queryKey: ['categories'] })
                }}
              />
            </Modal>
          </div>
        )}

        {/* ORDERS SECTION */}
        {section === 'orders' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-heading font-bold text-ink">Gestion des commandes</h1>
                <p className="text-xs text-mute">Modifiez les statuts et exportez les rapports</p>
              </div>
              <Button variant="secondary" size="sm" onClick={handleExportCsv} className="gap-2">
                <Download size={16} /> Exporter CSV
              </Button>
            </div>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface/50 border-b border-line text-mute uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Réf.</th>
                      <th className="p-4">Client</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Montant</th>
                      <th className="p-4">Statut</th>
                      <th className="p-4 text-right">Changer statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {ordersLoading ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-mute">
                          Chargement des commandes...
                        </td>
                      </tr>
                    ) : (
                      ordersData?.data.map((o) => (
                        <tr key={o.id} className="hover:bg-line/20 transition-colors">
                          <td className="p-4 font-mono font-semibold text-ink">{o.id}</td>
                          <td className="p-4">
                            <p className="font-medium text-ink">{o.shippingAddress?.fullName}</p>
                            <p className="text-[11px] text-mute">{o.shippingAddress?.city}</p>
                          </td>
                          <td className="p-4 text-mute">{formatDate(o.createdAt)}</td>
                          <td className="p-4 font-bold text-teal">{formatPrice(o.totalMillimes)}</td>
                          <td className="p-4">
                            <Badge variant={o.status === 'CANCELLED' ? 'danger' : 'ok'}>
                              {o.status}
                            </Badge>
                          </td>
                          <td className="p-4 text-right">
                            <select
                              value={o.status}
                              onChange={(e) =>
                                updateOrderStatusMutation.mutate({
                                  orderId: o.id,
                                  status: e.target.value,
                                })
                              }
                              className="px-2 py-1 text-xs bg-surface border border-line rounded-input text-ink"
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="PAID">PAID</option>
                              <option value="SHIPPED">SHIPPED</option>
                              <option value="DELIVERED">DELIVERED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* CLIENTS SECTION */}
        {section === 'clients' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-heading font-bold text-ink">Gestion des clients</h1>
              <p className="text-xs text-mute">
                Consultez vos clients et gérez les autorisations d&apos;accès
              </p>
            </div>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface/50 border-b border-line text-mute uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Nom</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Téléphone</th>
                      <th className="p-4">Commandes</th>
                      <th className="p-4">Statut</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {clientsLoading ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-mute">
                          Chargement des clients...
                        </td>
                      </tr>
                    ) : (
                      clientsData?.data.map((c) => (
                        <tr key={c.id} className="hover:bg-line/20 transition-colors">
                          <td className="p-4 font-semibold text-ink">{c.name}</td>
                          <td className="p-4 text-mute">{c.email}</td>
                          <td className="p-4 text-mute">{c.phone ?? '—'}</td>
                          <td className="p-4 font-semibold text-teal">{c.orderCount}</td>
                          <td className="p-4">
                            <Badge variant={c.status === 'BLOCKED' ? 'danger' : 'ok'}>
                              {c.status}
                            </Badge>
                          </td>
                          <td className="p-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className={
                                c.status === 'BLOCKED'
                                  ? 'text-ok hover:bg-ok/10'
                                  : 'text-danger hover:bg-danger/10'
                              }
                              onClick={() => {
                                const nextStatus = c.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED'
                                if (
                                  confirm(
                                    `Voulez-vous vraiment changer le statut de ${c.name} à ${nextStatus} ?`,
                                  )
                                ) {
                                  updateClientStatusMutation.mutate({
                                    clientId: c.id,
                                    status: nextStatus,
                                  })
                                }
                              }}
                            >
                              {c.status === 'BLOCKED' ? (
                                <Unlock size={14} className="mr-1" />
                              ) : (
                                <Lock size={14} className="mr-1" />
                              )}
                              {c.status === 'BLOCKED' ? 'Débloquer' : 'Bloquer'}
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}

function KpiCard({
  title,
  value,
  prevValue,
  change,
  highlight = false,
}: {
  title: string
  value: string
  prevValue?: string
  change?: number
  highlight?: boolean
}) {
  return (
    <Card className={`p-5 ${highlight ? 'border-teal' : ''}`}>
      <p className="text-[11px] font-semibold text-mute uppercase tracking-wider">{title}</p>
      <div className="flex items-baseline justify-between mt-2">
        <h3 className="text-xl font-heading font-bold text-ink">{value}</h3>
        {change !== undefined && (
          <span
            className={`flex items-center text-xs font-semibold ${
              change >= 0 ? 'text-ok' : 'text-danger'
            }`}
          >
            {change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      {prevValue && <p className="text-[10px] text-mute mt-1">Précédent : {prevValue}</p>}
    </Card>
  )
}

function ProductFormDrawer({
  initialData,
  categories,
  onSuccess,
}: {
  initialData: ProductResponse | null
  categories: Category[]
  onSuccess: () => void
}) {
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [images, setImages] = useState<string[]>(
    initialData?.images && initialData.images.length > 0
      ? initialData.images
      : ['https://picsum.photos/seed/lamp/800/600'],
  )

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateProductInput>({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          slug: initialData.slug,
          description: initialData.description,
          priceMillimes: initialData.priceMillimes,
          stock: initialData.stock,
          categoryId: initialData.categoryId,
          images: initialData.images,
          model3d: initialData.model3d,
          isActive: initialData.isActive,
        }
      : {
          name: '',
          slug: '',
          description: '',
          priceMillimes: 120000,
          stock: 10,
          categoryId: categories[0]?.id ?? '',
          images: ['https://picsum.photos/seed/lamp/800/600'],
          model3d: {
            shade: 'cone',
            shadeColor: '#ffffff',
            stemColor: '#888888',
            baseColor: '#444444',
            colorTemp: 3000,
          },
          isActive: true,
        },
  })

  // Watch name to auto-slugify if adding new
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!initialData) {
      setValue('slug', slugify(e.target.value))
    }
  }

  // Handle local file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      const res = await api.uploadImage(file)
      const updated = [...images, res.url]
      setImages(updated)
      setValue('images', updated)
      toast('Photo téléversée avec succès', 'success')
    } catch {
      toast('Échec du téléversement de la photo', 'error')
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  // Handle image URL add
  const handleAddUrl = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!urlInput.trim()) return
    const updated = [...images, urlInput.trim()]
    setImages(updated)
    setValue('images', updated)
    setUrlInput('')
    toast('Image ajoutée', 'success')
  }

  // Remove photo
  const handleRemoveImage = (index: number) => {
    if (images.length <= 1) {
      toast('Le produit doit avoir au moins une image', 'info')
      return
    }
    const updated = images.filter((_, i) => i !== index)
    setImages(updated)
    setValue('images', updated)
  }

  // Set primary photo
  const handleSetPrimary = (index: number) => {
    if (index === 0) return
    const target = images[index]
    if (!target) return
    const remaining = images.filter((_, i) => i !== index)
    const updated = [target, ...remaining]
    setImages(updated)
    setValue('images', updated)
  }

  const onSubmit = async (data: CreateProductInput) => {
    setSubmitting(true)
    try {
      const payload = { ...data, images }
      if (initialData) {
        await api.patch(`/products/${initialData.id}`, payload)
        toast('Luminaire modifié avec succès', 'success')
      } else {
        await api.post('/products', payload)
        toast('Luminaire créé avec succès', 'success')
      }
      onSuccess()
    } catch (err) {
      if (err instanceof ApiError) toast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
      {/* Basic information */}
      <div className="space-y-4">
        <h3 className="text-xs font-heading font-bold text-ink uppercase tracking-wider">
          Informations produit
        </h3>

        <Input
          label="Nom du produit"
          error={errors.name?.message}
          {...register('name')}
          onChange={(e) => {
            register('name').onChange(e)
            handleNameChange(e)
          }}
        />

        <Input
          label="Slug (identifiant URL)"
          placeholder="mon-luminaire"
          error={errors.slug?.message}
          {...register('slug')}
        />

        <div>
          <label className="text-xs font-medium text-ink block mb-1">Catégorie</label>
          <select
            className="w-full px-3 py-2 text-xs bg-surface border border-line rounded-input text-ink"
            {...register('categoryId')}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Prix (en millimes)"
            type="number"
            hint="Ex: 189000 = 189 TND"
            error={errors.priceMillimes?.message}
            {...register('priceMillimes', { valueAsNumber: true })}
          />
          <Input
            label="Stock disponible"
            type="number"
            error={errors.stock?.message}
            {...register('stock', { valueAsNumber: true })}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-ink block mb-1">Description</label>
          <textarea
            rows={3}
            className="w-full px-3 py-2 text-xs bg-surface border border-line rounded-input text-ink placeholder:text-mute"
            {...register('description')}
          />
          {errors.description && (
            <p className="text-xs text-danger mt-1">{errors.description.message}</p>
          )}
        </div>
      </div>

      {/* PHOTO MANAGEMENT (Upload + URL + Preview) */}
      <div className="space-y-4 pt-4 border-t border-line">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-heading font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
            <ImageIcon size={15} className="text-teal" /> Photos du luminaire ({images.length})
          </h3>
          <span className="text-[10px] text-mute">La première photo est la principale</span>
        </div>

        {/* Existing photos preview grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`relative aspect-square rounded-input overflow-hidden border-2 bg-surface group ${
                idx === 0 ? 'border-teal ring-2 ring-teal/20' : 'border-line'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
              {idx === 0 && (
                <span className="absolute top-1 left-1 bg-teal text-white text-[9px] font-bold px-1.5 py-0.5 rounded-pill shadow-low">
                  Principale
                </span>
              )}
              <div className="absolute inset-0 bg-ink/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {idx !== 0 && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(idx)}
                    className="p-1 rounded bg-surface/90 text-teal hover:bg-surface text-[10px] font-semibold"
                    title="Définir comme principale"
                  >
                    <Check size={14} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="p-1 rounded bg-surface/90 text-danger hover:bg-surface"
                  title="Supprimer la photo"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Upload file + Add URL inputs */}
        <div className="space-y-3 bg-surface p-3 rounded-card border border-line">
          {/* File picker */}
          <div>
            <label className="text-xs font-medium text-ink block mb-1">
              Téléverser une image locale
            </label>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-input bg-teal/10 text-teal hover:bg-teal/20 text-xs font-semibold transition-colors">
                <Upload size={14} />
                {isUploading ? 'Téléversement en cours...' : 'Choisir un fichier image'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>
              <span className="text-[11px] text-mute">JPEG, PNG ou WebP</span>
            </div>
          </div>

          {/* URL input */}
          <div className="pt-2 border-t border-line/60">
            <label className="text-xs font-medium text-ink block mb-1">
              Ou coller l&apos;URL d&apos;une image web
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/photo-lampe.jpg"
                className="flex-1 px-3 py-1.5 text-xs bg-bg border border-line rounded-input text-ink placeholder:text-mute"
              />
              <Button type="button" variant="secondary" size="sm" onClick={handleAddUrl}>
                Ajouter
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 3D MODEL PARAMETERS */}
      <div className="space-y-4 pt-4 border-t border-line">
        <h3 className="text-xs font-heading font-bold text-ink uppercase tracking-wider">
          Paramètres 3D (Rendu temps réel)
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-ink block mb-1">Forme abat-jour</label>
            <select
              className="w-full px-3 py-2 text-xs bg-surface border border-line rounded-input text-ink"
              {...register('model3d.shade')}
            >
              <option value="cone">Cône classique</option>
              <option value="dome">Dôme / Cloche</option>
              <option value="cylinder">Cylindre</option>
              <option value="sphere">Sphère translucide</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-ink block mb-1">Température par défaut</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={2700}
                max={6500}
                step={100}
                className="w-full h-1.5 accent-bulb cursor-pointer"
                {...register('model3d.colorTemp', { valueAsNumber: true })}
              />
              <span className="text-xs font-mono font-semibold text-mute w-14 text-right">
                {watch('model3d.colorTemp') || 3000}K
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-medium text-mute block mb-1">Couleur abat-jour</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                className="w-8 h-8 rounded border border-line cursor-pointer bg-transparent"
                {...register('model3d.shadeColor')}
              />
              <span className="text-[10px] font-mono text-ink">{watch('model3d.shadeColor')}</span>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-mute block mb-1">Couleur tige / col</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                className="w-8 h-8 rounded border border-line cursor-pointer bg-transparent"
                {...register('model3d.stemColor')}
              />
              <span className="text-[10px] font-mono text-ink">{watch('model3d.stemColor')}</span>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-mute block mb-1">Couleur socle</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                className="w-8 h-8 rounded border border-line cursor-pointer bg-transparent"
                {...register('model3d.baseColor')}
              />
              <span className="text-[10px] font-mono text-ink">{watch('model3d.baseColor')}</span>
            </div>
          </div>
        </div>
      </div>

      <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={submitting}>
        {initialData ? 'Enregistrer les modifications' : 'Créer le luminaire'}
      </Button>
    </form>
  )
}

function CategoryFormModal({
  initialData,
  onSuccess,
}: {
  initialData: CategoryWithCount | null
  onSuccess: () => void
}) {
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateCategoryInput>({
    resolver: zodResolver(CreateCategorySchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          slug: initialData.slug,
        }
      : {
          name: '',
          slug: '',
        },
  })

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!initialData) {
      setValue('slug', slugify(e.target.value))
    }
  }

  const onSubmit = async (data: CreateCategoryInput) => {
    setSubmitting(true)
    try {
      if (initialData) {
        await api.patch(`/products/categories/${initialData.id}`, data)
        toast('Catégorie mise à jour', 'success')
      } else {
        await api.post('/products/categories', data)
        toast('Catégorie créée avec succès', 'success')
      }
      onSuccess()
    } catch (err) {
      if (err instanceof ApiError) toast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Nom de la catégorie"
        placeholder="Ex: Lampadaire de sol"
        error={errors.name?.message}
        {...register('name')}
        onChange={(e) => {
          register('name').onChange(e)
          handleNameChange(e)
        }}
      />

      <Input
        label="Slug URL"
        placeholder="lampadaire-de-sol"
        hint="Minuscules, chiffres et tirets uniquement"
        error={errors.slug?.message}
        {...register('slug')}
      />

      <Button type="submit" variant="primary" size="md" className="w-full mt-2" isLoading={submitting}>
        {initialData ? 'Mettre à jour' : 'Ajouter la catégorie'}
      </Button>
    </form>
  )
}
