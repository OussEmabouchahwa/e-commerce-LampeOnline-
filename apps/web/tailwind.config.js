/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        ink: 'var(--ink)',
        mute: 'var(--mute)',
        line: 'var(--line)',
        teal: 'var(--teal)',
        bulb: 'var(--bulb)',
        danger: 'var(--danger)',
        ok: 'var(--ok)',
      },
      fontFamily: {
        heading: ['"Bricolage Grotesque"', 'sans-serif'],
        body: ['Figtree', 'sans-serif'],
      },
      fontSize: {
        xs: '0.875rem',
        sm: '1rem',
        base: '1.125rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4.5rem',
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        6: '24px',
        8: '32px',
        12: '48px',
        20: '80px',
      },
      borderRadius: {
        input: '8px',
        card: '14px',
        modal: '20px',
        pill: '999px',
      },
      maxWidth: {
        content: '1200px',
      },
      boxShadow: {
        low: '0 1px 4px 0 color-mix(in srgb, var(--ink) 8%, transparent)',
        mid: '0 4px 16px 0 color-mix(in srgb, var(--ink) 12%, transparent)',
      },
    },
  },
  plugins: [],
}
