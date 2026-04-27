/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary:  'var(--primary)',
        secondary:'var(--secondary)',
        accent:   'var(--accent)',
        'theme-bg':     'var(--bg)',
        'theme-card':   'var(--card)',
        'theme-text':   'var(--text)',
        'theme-muted':  'var(--muted)',
        'theme-border': 'var(--border)',
        ink: '#1A1A2E',
        cobalt: '#2563EB',
        'cobalt-light': '#3B82F6',
        yellow: '#FFD600',
        coral: '#FF6B6B',
        'coral-light': '#FF8585',
        mint: '#16A34A',
        amber: '#D97706',
        crimson: '#DC2626',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body:    ['var(--font-body)',    'system-ui', 'sans-serif'],
      },
      borderRadius: {
        theme: 'var(--radius)',
        '2xl': '20px',
        '3xl': '24px',
      },
      boxShadow: {
        theme: 'var(--shadow)',
        card:  '0 8px 32px rgba(37, 99, 235, 0.12)',
        'card-hover': '0 12px 40px rgba(37, 99, 235, 0.18)',
        'coral': '0 8px 32px rgba(255, 107, 107, 0.15)',
        'yellow': '0 8px 32px rgba(255, 214, 0, 0.15)',
      },
      keyframes: {
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateY(12px) rotate(-0.5deg)' },
          '100%': { opacity: '1', transform: 'translateY(0) rotate(0deg)' },
        },
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
