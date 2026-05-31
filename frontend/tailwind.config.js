/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  // Scope Tailwind ONLY inside elements with class 'tw' to avoid
  // conflicts with existing vanilla CSS on student pages.
  // Admin pages will wrap content in <div className="tw">
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        // Admin-specific dark charcoal palette
        admin: {
          950: '#080a0f',
          900: '#0d1017',
          800: '#111520',
          700: '#161c2b',
          600: '#1c2438',
          500: '#232d47',
          border: 'rgba(239,68,68,0.2)',
          glow:   'rgba(239,68,68,0.3)',
        },
        danger: {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
        },
        ember: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
        },
      },
      boxShadow: {
        'admin-glow':    '0 0 20px rgba(239,68,68,0.25), 0 0 40px rgba(239,68,68,0.1)',
        'admin-card':    '0 1px 0 rgba(255,255,255,0.04) inset, 0 4px 24px rgba(0,0,0,0.6)',
        'input-focus':   '0 0 0 3px rgba(239,68,68,0.2)',
        'btn-danger':    '0 0 15px rgba(239,68,68,0.4)',
      },
      animation: {
        'pulse-slow':   'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan':         'scan 8s linear infinite',
        'flicker':      'flicker 4s linear infinite',
      },
      keyframes: {
        scan: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        flicker: {
          '0%, 100%': { opacity: 1 },
          '92%':      { opacity: 1 },
          '93%':      { opacity: 0.8 },
          '94%':      { opacity: 1 },
          '96%':      { opacity: 0.9 },
          '97%':      { opacity: 1 },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
