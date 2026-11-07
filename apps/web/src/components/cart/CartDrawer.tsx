import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { Drawer } from '../ui/Drawer'
import { Button } from '../ui/Button'
import { useCart } from '@/contexts/CartContext'
import { formatPrice } from '@/lib/utils'
import { Link } from 'react-router-dom'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQty, totalMillimes, totalItems } = useCart()

  return (
    <Drawer open={open} onClose={onClose} title={`Cart (${totalItems})`}>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center px-6">
          <ShoppingBag size={48} className="text-line" />
          <p className="text-sm text-mute">Your cart is empty</p>
          <Link to="/products" onClick={onClose}>
            <Button variant="primary" size="md">
              Browse products
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <ul className="flex-1 divide-y divide-line overflow-y-auto">
            {items.map((item) => (
              <li key={item.productId} className="flex gap-3 p-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-16 w-16 rounded-input object-cover flex-shrink-0 bg-line"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${item.slug}`}
                    onClick={onClose}
                    className="text-xs font-medium text-ink hover:text-teal line-clamp-2"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-teal font-semibold mt-1">{formatPrice(item.priceMillimes)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQty(item.productId, item.qty - 1)}
                      className="p-1 rounded hover:bg-line text-mute hover:text-ink transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-xs font-medium text-ink w-6 text-center">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.productId, item.qty + 1)}
                      className="p-1 rounded hover:bg-line text-mute hover:text-ink transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="ml-auto p-1 rounded hover:bg-danger/10 text-mute hover:text-danger transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Footer */}
          <div className="border-t border-line p-4 space-y-3 flex-shrink-0">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-mute">Total</span>
              <span className="text-ink font-bold">{formatPrice(totalMillimes)}</span>
            </div>
            <Link to="/checkout" onClick={onClose} className="block">
              <Button variant="primary" size="lg" className="w-full">
                Checkout
              </Button>
            </Link>
          </div>
        </div>
      )}
    </Drawer>
  )
}
