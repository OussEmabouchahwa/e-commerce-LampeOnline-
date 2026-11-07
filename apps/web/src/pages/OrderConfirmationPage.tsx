import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { CheckCircle2, Clock, Truck, PackageCheck, AlertCircle } from 'lucide-react'
import type { OrderResponse } from '@lampe/shared'

const STATUS_STEPS = [
  { key: 'PENDING', label: 'En attente', icon: Clock },
  { key: 'PAID', label: 'Payée', icon: CheckCircle2 },
  { key: 'SHIPPED', label: 'Expédiée', icon: Truck },
  { key: 'DELIVERED', label: 'Livrée', icon: PackageCheck },
]

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>()

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get<OrderResponse>(`/orders/${id!}`),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="max-w-content mx-auto px-4 py-20 text-center">
        <p className="text-xs text-mute">Chargement de votre commande...</p>
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <Card className="p-8">
          <AlertCircle size={36} className="text-danger mx-auto mb-4" />
          <h1 className="text-lg font-heading font-bold text-ink mb-2">Commande introuvable</h1>
          <p className="text-xs text-mute mb-6">
            Cette commande n&apos;existe pas ou vous n&apos;avez pas l&apos;autorisation de la consulter.
          </p>
          <Link to="/products">
            <Button variant="primary" size="md">
              Retour au catalogue
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  const currentStepIdx = STATUS_STEPS.findIndex((s) => s.key === order.status)
  const isCancelled = order.status === 'CANCELLED'

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 py-12">
      {/* Header banner */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <div className="inline-flex p-3 rounded-full bg-ok/10 text-ok mb-4">
          <CheckCircle2 size={36} />
        </div>
        <h1 className="text-2xl font-heading font-bold text-ink">Merci pour votre commande !</h1>
        <p className="text-xs text-mute mt-2">
          Numéro de référence : <span className="font-mono text-ink font-semibold">{order.id}</span>
        </p>
        <p className="text-[11px] text-mute mt-1">Passée le {formatDate(order.createdAt)}</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Status Timeline */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-heading font-bold text-ink uppercase tracking-wider">
              Statut d&apos;acheminement
            </h2>
            <Badge variant={isCancelled ? 'danger' : 'ok'}>{order.status}</Badge>
          </div>

          {isCancelled ? (
            <div className="p-4 rounded-card bg-danger/10 border border-danger/20 text-xs text-danger">
              Cette commande a été annulée. Si vous avez été débité, le remboursement sera effectué sous
              48 heures.
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 relative">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = idx <= currentStepIdx
                const isCurrent = idx === currentStepIdx
                const IconComponent = step.icon
                return (
                  <div key={step.key} className="flex flex-col items-center text-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors mb-2 ${
                        isCurrent
                          ? 'bg-bulb text-ink shadow-low'
                          : isPassed
                            ? 'bg-teal text-white'
                            : 'bg-line text-mute'
                      }`}
                    >
                      <IconComponent size={18} />
                    </div>
                    <span
                      className={`text-[11px] font-medium ${
                        isPassed ? 'text-ink font-semibold' : 'text-mute'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Order Items */}
        <Card className="p-6">
          <h2 className="text-xs font-heading font-bold text-ink uppercase tracking-wider mb-4">
            Articles commandés
          </h2>
          <ul className="divide-y divide-line">
            {order.items.map((item) => (
              <li key={item.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-ink truncate">{item.nameSnapshot}</p>
                  <p className="text-[11px] text-mute">Quantité : {item.qty}</p>
                </div>
                <p className="text-xs font-semibold text-teal flex-shrink-0">
                  {formatPrice(item.priceSnapshot * item.qty)}
                </p>
              </li>
            ))}
          </ul>
          <div className="flex justify-between items-center border-t border-line pt-4 mt-2">
            <span className="text-xs font-bold text-ink">Total payé</span>
            <span className="text-sm font-bold text-teal">{formatPrice(order.totalMillimes)}</span>
          </div>
        </Card>

        {/* Shipping address & payment info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xs font-heading font-bold text-ink uppercase tracking-wider mb-3">
              Adresse de livraison
            </h2>
            <div className="text-xs text-mute space-y-1">
              <p className="font-semibold text-ink">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.address}</p>
              <p>
                {order.shippingAddress.postalCode} {order.shippingAddress.city}
              </p>
              <p>Tél : {order.shippingAddress.phone}</p>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xs font-heading font-bold text-ink uppercase tracking-wider mb-3">
              Mode de paiement
            </h2>
            <div className="text-xs text-mute space-y-1">
              <p className="font-semibold text-ink">
                {order.paymentMethod === 'MOCK_CARD'
                  ? 'Carte bancaire (Simulée)'
                  : 'Paiement à la livraison'}
              </p>
              <p>Statut du règlement : {order.paymentStatus}</p>
              <p className="text-[11px] text-mute pt-2">
                Livraison gratuite partout sur le territoire tunisien.
              </p>
            </div>
          </Card>
        </div>

        {/* Bottom actions */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Link to="/account">
            <Button variant="secondary" size="md" className="w-full sm:w-auto">
              Voir toutes mes commandes
            </Button>
          </Link>
          <Link to="/products">
            <Button variant="primary" size="md" className="w-full sm:w-auto">
              Continuer mes achats
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
