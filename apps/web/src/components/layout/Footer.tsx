import { Link } from 'react-router-dom'
import { Logo } from '../ui/Logo'

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface mt-20">
      <div className="max-w-content mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {/* Brand */}
        <div className="flex flex-col items-start gap-3">
          <Logo size="lg" />
          <p className="text-xs text-mute max-w-[200px]">
            Showroom interactif de luminaires haut de gamme. Livraison en Tunisie.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="text-xs font-heading font-bold text-ink mb-3">Catalogue</h3>
          <ul className="flex flex-col gap-2">
            {[
              { href: '/products', label: 'Tous les produits' },
              { href: '/products?categoryId=suspension', label: 'Suspensions' },
              { href: '/products?categoryId=lampadaire', label: 'Lampadaires' },
              { href: '/products?categoryId=table', label: 'Lampes de table' },
              { href: '/products?categoryId=bureau', label: 'Bureau' },
            ].map((l) => (
              <li key={l.href}>
                <Link to={l.href} className="text-xs text-mute hover:text-ink transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Account */}
        <div>
          <h3 className="text-xs font-heading font-bold text-ink mb-3">Mon compte</h3>
          <ul className="flex flex-col gap-2">
            {[
              { href: '/account', label: 'Mes commandes' },
              { href: '/account/wishlist', label: 'Liste de souhaits' },
              { href: '/account/profile', label: 'Mon profil' },
            ].map((l) => (
              <li key={l.href}>
                <Link to={l.href} className="text-xs text-mute hover:text-ink transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="max-w-content mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-mute">
            &copy; {new Date().getFullYear()} LampeOnline · Tunisie
          </p>
          <p className="text-xs text-mute">
            Paiements simulés — aucune donnée bancaire réelle
          </p>
        </div>
      </div>
    </footer>
  )
}
