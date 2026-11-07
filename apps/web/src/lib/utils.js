import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
export function formatPrice(millimes) {
    return new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(millimes / 1000);
}
export function formatDate(iso) {
    return new Intl.DateTimeFormat('fr-TN', { dateStyle: 'medium' }).format(new Date(iso));
}
export function pctChange(current, previous) {
    if (previous === 0)
        return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
}
export function slugify(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}
//# sourceMappingURL=utils.js.map