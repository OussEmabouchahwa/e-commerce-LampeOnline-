import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'
import { ProductCard } from '@/components/products/ProductCard'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { Pagination } from '@/components/ui/Pagination'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'
import type { ProductResponse, Category } from '@lampe/shared'

interface ProductListResponse {
  data: ProductResponse[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export default function CatalogPage() {
  const [params, setParams] = useSearchParams()
  const [filterOpen, setFilterOpen] = useState(false)

  const page = parseInt(params.get('page') ?? '1', 10)
  const search = params.get('search') ?? ''
  const categoryId = params.get('categoryId') ?? ''
  const sortBy = params.get('sortBy') ?? 'createdAt'
  const sortDir = params.get('sortDir') ?? 'desc'

  function setParam(key: string, value: string) {
    setParams((prev: URLSearchParams) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      if (key !== 'page') next.set('page', '1')
      return next
    })
  }

  const queryString = new URLSearchParams({
    page: String(page), pageSize: '20',
    ...(search && { search }),
    ...(categoryId && { categoryId }),
    sortBy, sortDir,
  }).toString()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['products', queryString],
    queryFn: () => api.get<ProductListResponse>(`/products?${queryString}`),
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<Category[]>('/products/categories'),
    staleTime: Infinity,
  })

  const hasFilters = !!(search || categoryId)

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-lg font-heading font-bold text-ink">
          Catalogue
          {data && <span className="text-mute font-body font-normal text-xs ml-2">({data.total} produits)</span>}
        </h1>

        <div className="flex gap-2">
          {/* Search */}
          <div className="relative flex-1 sm:flex-none">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
            <input
              type="search"
              placeholder="Rechercher..."
              defaultValue={search}
              onChange={(e) => setParam('search', e.target.value)}
              className="pl-9 pr-3 py-2 text-xs bg-surface border border-line rounded-input text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-bulb w-full sm:w-64"
            />
          </div>

          {/* Sort */}
          <select
            value={`${sortBy}:${sortDir}`}
            onChange={(e) => {
              const [by, dir] = e.target.value.split(':')
              if (by) setParam('sortBy', by)
              if (dir) setParam('sortDir', dir)
            }}
            className="px-3 py-2 text-xs bg-surface border border-line rounded-input text-ink focus:outline-none focus:ring-2 focus:ring-bulb"
          >
            <option value="createdAt:desc">Nouveautés</option>
            <option value="priceMillimes:asc">Prix croissant</option>
            <option value="priceMillimes:desc">Prix décroissant</option>
            <option value="name:asc">Nom A-Z</option>
          </select>

          {/* Filter toggle mobile */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setFilterOpen(!filterOpen)}
            className="sm:hidden"
          >
            <SlidersHorizontal size={16} />
          </Button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters */}
        <aside className={`${filterOpen ? 'block' : 'hidden'} sm:block w-48 flex-shrink-0`}>
          <div className="sticky top-20 space-y-6">
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setParams({}); setFilterOpen(false) }}
                className="text-danger gap-1"
              >
                <X size={14} /> Clear filters
              </Button>
            )}
            <div>
              <h3 className="text-xs font-bold text-ink mb-3">Catégorie</h3>
              <ul className="space-y-1">
                {[{ id: '', name: 'Tous' }, ...(categories ?? [])].map((c) => (
                  <li key={c.id}>
                    <button
                      onClick={() => setParam('categoryId', c.id)}
                      className={`text-xs w-full text-left py-1 px-2 rounded transition-colors ${
                        categoryId === c.id ? 'bg-teal/10 text-teal font-medium' : 'text-mute hover:text-ink'
                      }`}
                    >
                      {c.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {isError ? (
            <div className="text-center py-20">
              <p className="text-sm text-danger mb-4">Failed to load products</p>
              <Button variant="secondary" size="md" onClick={() => void refetch()}>Try again</Button>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : data?.data.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-sm text-mute mb-4">No products found</p>
              <Button variant="secondary" size="md" onClick={() => setParams({})}>Clear filters</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {data?.data.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
              {data && (
                <div className="flex justify-center">
                  <Pagination
                    page={page}
                    totalPages={data.totalPages}
                    onPageChange={(p) => setParam('page', String(p))}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
