import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, Truck, Shield } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { ProductCard } from '@/components/products/ProductCard'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { HeroLamp } from '@/components/3d/HeroLamp'
import { api } from '@/lib/api'
import type { ProductResponse } from '@lampe/shared'

interface ProductListResponse {
  data: ProductResponse[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export default function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => api.get<ProductListResponse>('/products?pageSize=4&sortBy=createdAt&sortDir=desc'),
  })

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden py-12">
        {/* Background gradient */}
        <div
          className="absolute inset-0 bg-bg"
          style={{
            background:
              'radial-gradient(ellipse 65% 65% at 50% 35%, color-mix(in srgb, var(--bulb) 9%, var(--bg)), var(--bg))',
          }}
          aria-hidden="true"
        />

        <div className="relative max-w-content mx-auto px-4 sm:px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Text & CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-6 text-center lg:text-left z-10"
          >
            <p className="text-xs font-semibold text-bulb uppercase tracking-widest mb-3">
              Showroom interactif de luminaires
            </p>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink leading-[1.15] mb-5">
              La lumière idéale pour sublimer chaque espace
            </h1>
            <p className="text-xs text-mute max-w-md mx-auto lg:mx-0 mb-8 leading-relaxed">
              Explorez notre collection exclusive en 3D. Testez la température de couleur, modulez
              l&apos;intensité lumineuse et commandez en ligne avec livraison partout en Tunisie.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <Link to="/products">
                <Button variant="primary" size="lg" className="gap-2 w-full sm:w-auto">
                  Explorer la collection
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <Link to="/products?categoryId=suspension">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Suspensions
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right Column: 3D Interactive Hero Lamp */}
          <div className="lg:col-span-6 flex items-center justify-center relative">
            <HeroLamp />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-t border-line">
        <div className="max-w-content mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Visualisation 3D temps réel',
                desc: 'Manipulez la lampe à 360°, allumez-la et personnalisez la nuance de chaleur.',
              },
              {
                icon: Truck,
                title: 'Livraison express en Tunisie',
                desc: 'Expédition soignée à domicile dans toutes les régions de Tunisie.',
              },
              {
                icon: Shield,
                title: 'Paiement flexible & sécurisé',
                desc: 'Paiement par carte test instantané ou règlement en espèces à la livraison.',
              },
            ].map((f) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                viewport={{ once: true }}
                className="flex flex-col items-start gap-3"
              >
                <div className="p-3 rounded-card bg-surface border border-line">
                  <f.icon size={20} className="text-teal" />
                </div>
                <h3 className="text-xs font-heading font-bold text-ink">{f.title}</h3>
                <p className="text-xs text-mute">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="py-16">
        <div className="max-w-content mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-heading font-bold text-ink">Nouveautés phares</h2>
              <p className="text-xs text-mute">Nos créations et luminaires les plus récents</p>
            </div>
            <Link to="/products" className="text-xs text-teal hover:underline flex items-center gap-1 font-semibold">
              Voir tout le catalogue <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : data?.data.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-line bg-surface/30">
        <div className="max-w-content mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-lg font-heading font-bold text-ink mb-3">Envie d&apos;illuminer votre intérieur ?</h2>
          <p className="text-xs text-mute mb-8 max-w-md mx-auto">
            Créez votre compte en quelques secondes pour enregistrer vos coups de cœur et suivre
            vos commandes.
          </p>
          <Link to="/auth/register">
            <Button variant="primary" size="lg">
              Créer un compte client
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
