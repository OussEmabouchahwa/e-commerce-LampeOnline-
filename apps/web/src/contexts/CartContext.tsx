import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export interface LocalCartItem {
  productId: string
  qty: number
  name: string
  priceMillimes: number
  image: string
  slug: string
}

interface CartState {
  items: LocalCartItem[]
  addItem: (item: LocalCartItem) => void
  removeItem: (productId: string) => void
  updateQty: (productId: string, qty: number) => void
  clearCart: () => void
  totalItems: number
  totalMillimes: number
}

const CartContext = createContext<CartState | null>(null)

const STORAGE_KEY = 'lampe_guest_cart'

function loadCart(): LocalCartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as LocalCartItem[]
  } catch {
    return []
  }
}

function saveCart(items: LocalCartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<LocalCartItem[]>(loadCart)

  useEffect(() => { saveCart(items) }, [items])

  function addItem(item: LocalCartItem) {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId)
      if (existing) {
        return prev.map((i) => i.productId === item.productId ? { ...i, qty: i.qty + item.qty } : i)
      }
      return [...prev, item]
    })
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }

  function updateQty(productId: string, qty: number) {
    if (qty <= 0) { removeItem(productId); return }
    setItems((prev) => prev.map((i) => i.productId === productId ? { ...i, qty } : i))
  }

  function clearCart() { setItems([]) }

  const totalItems = items.reduce((s, i) => s + i.qty, 0)
  const totalMillimes = items.reduce((s, i) => s + i.priceMillimes * i.qty, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, totalItems, totalMillimes }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
