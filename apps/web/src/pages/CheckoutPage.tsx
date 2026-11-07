import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import {
  type OrderResponse,
  PaymentMethod,
} from '@lampe/shared'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import { api, ApiError } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import { ShieldAlert, CreditCard, Banknote } from 'lucide-react'

const CheckoutFormSchema = z.object({
  fullName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  phone: z.string().min(8, 'Numéro de téléphone invalide'),
  address: z.string().min(5, 'Adresse complète requise'),
  city: z.string().min(2, 'Ville requise'),
  postalCode: z.string().min(4, 'Code postal requis'),
  paymentMethod: PaymentMethod,
  mockCardNumber: z.string().optional(),
})

type CheckoutFormData = z.infer<typeof CheckoutFormSchema>

export default function CheckoutPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { items, totalMillimes, clearCart } = useCart()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [idempotencyKey] = useState<string>(() => uuidv4())

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(CheckoutFormSchema),
    defaultValues: {
      fullName: user?.name ?? '',
      phone: user?.phone ?? '',
      paymentMethod: 'MOCK_CARD',
      mockCardNumber: '4242 4242 4242 4242',
    },
  })

  const selectedPaymentMethod = watch('paymentMethod')

  if (authLoading) {
    return (
      <div className="max-w-content mx-auto px-4 py-20 text-center">
        <p className="text-sm text-mute">Chargement de votre session...</p>
      </div>
    )
  }

  // Visitor-to-client purchase gate:
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <Card className="p-8">
          <h1 className="text-xl font-heading font-bold text-ink mb-2">Connexion requise</h1>
          <p className="text-xs text-mute mb-6">
            Pour finaliser votre commande, veuillez vous connecter ou créer un compte client. Votre
            panier sera conservé.
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/auth/login" state={{ returnTo: '/checkout' }}>
              <Button variant="primary" size="md" className="w-full">
                Se connecter
              </Button>
            </Link>
            <Link to="/auth/register" state={{ returnTo: '/checkout' }}>
              <Button variant="secondary" size="md" className="w-full">
                Créer un compte
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <Card className="p-8">
          <h1 className="text-xl font-heading font-bold text-ink mb-2">Votre panier est vide</h1>
          <p className="text-xs text-mute mb-6">
            Ajoutez des luminaires à votre panier avant de procéder au paiement.
          </p>
          <Link to="/products">
            <Button variant="primary" size="md">
              Découvrir le catalogue
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      // First ensure cart is synced to server before placing order
      await api.post(
        '/cart/merge',
        items.map((i) => ({ productId: i.productId, qty: i.qty })),
      )

      const payload = {
        shippingAddress: {
          fullName: data.fullName,
          phone: data.phone,
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
        },
        paymentMethod: data.paymentMethod,
        idempotencyKey,
        mockCardNumber: data.paymentMethod === 'MOCK_CARD' ? data.mockCardNumber : undefined,
      }

      const order = await api.post<OrderResponse>('/orders', payload)
      clearCart()
      toast('Commande passée avec succès !', 'success')
      navigate(`/orders/${order.id}`, { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage('Une erreur est survenue lors du paiement.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-heading font-bold text-ink mb-8">Finaliser la commande</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form column */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {errorMessage && (
              <div
                role="alert"
                className="p-4 rounded-card bg-danger/10 border border-danger/20 text-xs text-danger flex items-start gap-3"
              >
                <ShieldAlert size={18} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Paiement refusé ou erreur :</p>
                  <p>{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Step 1: Shipping address */}
            <Card className="p-6">
              <h2 className="text-sm font-heading font-bold text-ink mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal text-white flex items-center justify-center text-xs">
                  1
                </span>
                Adresse de livraison en Tunisie
              </h2>

              <div className="space-y-4">
                <Input
                  label="Nom complet du destinataire"
                  error={errors.fullName?.message}
                  {...register('fullName')}
                />
                <Input
                  label="Numéro de téléphone"
                  type="tel"
                  placeholder="+216 -- --- ---"
                  error={errors.phone?.message}
                  {...register('phone')}
                />
                <Input
                  label="Adresse de livraison"
                  placeholder="Rue, appartement, étage..."
                  error={errors.address?.message}
                  {...register('address')}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Ville / Gouvernorat" error={errors.city?.message} {...register('city')} />
                  <Input
                    label="Code postal"
                    placeholder="1001"
                    error={errors.postalCode?.message}
                    {...register('postalCode')}
                  />
                </div>
              </div>
            </Card>

            {/* Step 2: Payment method */}
            <Card className="p-6">
              <h2 className="text-sm font-heading font-bold text-ink mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal text-white flex items-center justify-center text-xs">
                  2
                </span>
                Mode de règlement
              </h2>

              <div className="space-y-4">
                {/* Method selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-3 p-4 rounded-card border cursor-pointer transition-all ${
                      selectedPaymentMethod === 'MOCK_CARD'
                        ? 'border-teal bg-teal/5'
                        : 'border-line hover:border-mute'
                    }`}
                  >
                    <input
                      type="radio"
                      value="MOCK_CARD"
                      className="sr-only"
                      {...register('paymentMethod')}
                    />
                    <CreditCard
                      size={20}
                      className={selectedPaymentMethod === 'MOCK_CARD' ? 'text-teal' : 'text-mute'}
                    />
                    <div className="text-left">
                      <p className="text-xs font-semibold text-ink">Carte bancaire (Simulée)</p>
                      <p className="text-[11px] text-mute">Test de paiement immédiat</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-4 rounded-card border cursor-pointer transition-all ${
                      selectedPaymentMethod === 'CASH_ON_DELIVERY'
                        ? 'border-teal bg-teal/5'
                        : 'border-line hover:border-mute'
                    }`}
                  >
                    <input
                      type="radio"
                      value="CASH_ON_DELIVERY"
                      className="sr-only"
                      {...register('paymentMethod')}
                    />
                    <Banknote
                      size={20}
                      className={
                        selectedPaymentMethod === 'CASH_ON_DELIVERY' ? 'text-teal' : 'text-mute'
                      }
                    />
                    <div className="text-left">
                      <p className="text-xs font-semibold text-ink">Paiement à la livraison</p>
                      <p className="text-[11px] text-mute">Règlement en espèces</p>
                    </div>
                  </label>
                </div>

                {/* Simulated payment card alert */}
                {selectedPaymentMethod === 'MOCK_CARD' && (
                  <div className="p-4 rounded-card bg-surface border border-line space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-ink flex items-center gap-1.5">
                        <CreditCard size={15} className="text-bulb" /> Formulaire de test
                      </span>
                      <span className="px-2 py-0.5 rounded-pill bg-bulb/20 text-bulb text-[10px] font-bold uppercase tracking-wider">
                        Simulé
                      </span>
                    </div>
                    <p className="text-[11px] text-mute">
                      Aucune carte réelle requise. Utilisez l&apos;un des numéros de test :
                    </p>

                    <div className="flex flex-wrap gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setValue('mockCardNumber', '4242 4242 4242 4242')}
                        className="px-2 py-1 rounded bg-line/50 hover:bg-line text-ink transition-colors font-mono"
                      >
                        4242... (Succès)
                      </button>
                      <button
                        type="button"
                        onClick={() => setValue('mockCardNumber', '4000 0000 0000 0002')}
                        className="px-2 py-1 rounded bg-line/50 hover:bg-line text-danger transition-colors font-mono"
                      >
                        4000...02 (Refus)
                      </button>
                      <button
                        type="button"
                        onClick={() => setValue('mockCardNumber', '4000 0000 0000 3220')}
                        className="px-2 py-1 rounded bg-line/50 hover:bg-line text-bulb transition-colors font-mono"
                      >
                        4000...20 (Vérif 3s)
                      </button>
                    </div>

                    <Input
                      label="Numéro de carte de test"
                      placeholder="4242 4242 4242 4242"
                      className="font-mono"
                      error={errors.mockCardNumber?.message}
                      {...register('mockCardNumber')}
                    />
                  </div>
                )}
              </div>
            </Card>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full text-sm"
              isLoading={isSubmitting}
            >
              Confirmer et payer {formatPrice(totalMillimes)}
            </Button>
          </form>
        </div>

        {/* Order summary column */}
        <div className="lg:col-span-5">
          <Card className="p-6 sticky top-24">
            <h2 className="text-sm font-heading font-bold text-ink mb-4">Récapitulatif de commande</h2>

            <ul className="divide-y divide-line mb-6 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <li key={item.productId} className="py-3 flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-input bg-line flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-ink truncate">{item.name}</p>
                    <p className="text-[11px] text-mute">Qté : {item.qty}</p>
                  </div>
                  <p className="text-xs font-semibold text-teal flex-shrink-0">
                    {formatPrice(item.priceMillimes * item.qty)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="space-y-2 border-t border-line pt-4 text-xs">
              <div className="flex justify-between text-mute">
                <span>Sous-total</span>
                <span>{formatPrice(totalMillimes)}</span>
              </div>
              <div className="flex justify-between text-mute">
                <span>Livraison en Tunisie</span>
                <span className="text-ok font-medium">Gratuite</span>
              </div>
              <div className="flex justify-between text-ink font-bold text-sm pt-2 border-t border-line">
                <span>Total TTC</span>
                <span className="text-teal">{formatPrice(totalMillimes)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
