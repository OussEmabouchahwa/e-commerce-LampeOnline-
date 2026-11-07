import { describe, it, expect } from 'vitest';
import { formatPrice, slugify, pctChange } from '../lib/utils';
describe('Web Utilities', () => {
    it('formatPrice: correctly formats millimes to TND currency string', () => {
        const formatted = formatPrice(189000);
        expect(formatted).toContain('189');
        expect(formatted).toContain('DT');
    });
    it('slugify: converts titles to url-safe slugs', () => {
        expect(slugify('Éclipse Suspension')).toBe('eclipse-suspension');
        expect(slugify('Marbre & Laiton')).toBe('marbre-laiton');
    });
    it('pctChange: computes percentage growth between periods', () => {
        expect(pctChange(200, 100)).toBe(100);
        expect(pctChange(50, 100)).toBe(-50);
        expect(pctChange(50, 0)).toBe(100);
    });
});
//# sourceMappingURL=utils.test.js.map