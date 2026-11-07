import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import { ProductCard } from '@/components/products/ProductCard';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
export default function CatalogPage() {
    const [params, setParams] = useSearchParams();
    const [filterOpen, setFilterOpen] = useState(false);
    const page = parseInt(params.get('page') ?? '1', 10);
    const search = params.get('search') ?? '';
    const categoryId = params.get('categoryId') ?? '';
    const sortBy = params.get('sortBy') ?? 'createdAt';
    const sortDir = params.get('sortDir') ?? 'desc';
    function setParam(key, value) {
        setParams((prev) => {
            const next = new URLSearchParams(prev);
            if (value)
                next.set(key, value);
            else
                next.delete(key);
            if (key !== 'page')
                next.set('page', '1');
            return next;
        });
    }
    const queryString = new URLSearchParams({
        page: String(page), pageSize: '20',
        ...(search && { search }),
        ...(categoryId && { categoryId }),
        sortBy, sortDir,
    }).toString();
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['products', queryString],
        queryFn: () => api.get(`/products?${queryString}`),
    });
    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: () => api.get('/products/categories'),
        staleTime: Infinity,
    });
    const hasFilters = !!(search || categoryId);
    return (_jsxs("div", { className: "max-w-content mx-auto px-4 sm:px-6 py-8", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8", children: [_jsxs("h1", { className: "text-lg font-heading font-bold text-ink", children: ["Catalogue", data && _jsxs("span", { className: "text-mute font-body font-normal text-xs ml-2", children: ["(", data.total, " produits)"] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("div", { className: "relative flex-1 sm:flex-none", children: [_jsx(Search, { size: 16, className: "absolute left-3 top-1/2 -translate-y-1/2 text-mute" }), _jsx("input", { type: "search", placeholder: "Rechercher...", defaultValue: search, onChange: (e) => setParam('search', e.target.value), className: "pl-9 pr-3 py-2 text-xs bg-surface border border-line rounded-input text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-bulb w-full sm:w-64" })] }), _jsxs("select", { value: `${sortBy}:${sortDir}`, onChange: (e) => {
                                    const [by, dir] = e.target.value.split(':');
                                    if (by)
                                        setParam('sortBy', by);
                                    if (dir)
                                        setParam('sortDir', dir);
                                }, className: "px-3 py-2 text-xs bg-surface border border-line rounded-input text-ink focus:outline-none focus:ring-2 focus:ring-bulb", children: [_jsx("option", { value: "createdAt:desc", children: "Nouveaut\u00E9s" }), _jsx("option", { value: "priceMillimes:asc", children: "Prix croissant" }), _jsx("option", { value: "priceMillimes:desc", children: "Prix d\u00E9croissant" }), _jsx("option", { value: "name:asc", children: "Nom A-Z" })] }), _jsx(Button, { variant: "secondary", size: "sm", onClick: () => setFilterOpen(!filterOpen), className: "sm:hidden", children: _jsx(SlidersHorizontal, { size: 16 }) })] })] }), _jsxs("div", { className: "flex gap-8", children: [_jsx("aside", { className: `${filterOpen ? 'block' : 'hidden'} sm:block w-48 flex-shrink-0`, children: _jsxs("div", { className: "sticky top-20 space-y-6", children: [hasFilters && (_jsxs(Button, { variant: "ghost", size: "sm", onClick: () => { setParams({}); setFilterOpen(false); }, className: "text-danger gap-1", children: [_jsx(X, { size: 14 }), " Clear filters"] })), _jsxs("div", { children: [_jsx("h3", { className: "text-xs font-bold text-ink mb-3", children: "Cat\u00E9gorie" }), _jsx("ul", { className: "space-y-1", children: [{ id: '', name: 'Tous' }, ...(categories ?? [])].map((c) => (_jsx("li", { children: _jsx("button", { onClick: () => setParam('categoryId', c.id), className: `text-xs w-full text-left py-1 px-2 rounded transition-colors ${categoryId === c.id ? 'bg-teal/10 text-teal font-medium' : 'text-mute hover:text-ink'}`, children: c.name }) }, c.id))) })] })] }) }), _jsx("div", { className: "flex-1 min-w-0", children: isError ? (_jsxs("div", { className: "text-center py-20", children: [_jsx("p", { className: "text-sm text-danger mb-4", children: "Failed to load products" }), _jsx(Button, { variant: "secondary", size: "md", onClick: () => void refetch(), children: "Try again" })] })) : isLoading ? (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6", children: Array.from({ length: 9 }).map((_, i) => _jsx(SkeletonCard, {}, i)) })) : data?.data.length === 0 ? (_jsxs("div", { className: "text-center py-20", children: [_jsx("p", { className: "text-sm text-mute mb-4", children: "No products found" }), _jsx(Button, { variant: "secondary", size: "md", onClick: () => setParams({}), children: "Clear filters" })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8", children: data?.data.map((p) => _jsx(ProductCard, { product: p }, p.id)) }), data && (_jsx("div", { className: "flex justify-center", children: _jsx(Pagination, { page: page, totalPages: data.totalPages, onPageChange: (p) => setParam('page', String(p)) }) }))] })) })] })] }));
}
//# sourceMappingURL=CatalogPage.js.map