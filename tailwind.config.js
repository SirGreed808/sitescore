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
      },
      fontFamily: {
        heading: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
        body:    ['var(--font-inter)',   'system-ui', 'sans-serif'],
      },
      borderRadius: {
        theme: 'var(--radius)',
      },
      boxShadow: {
        theme: 'var(--shadow)',
        card:  '0 2px 16px rgba(0,0,0,0.07)',
      },
      keyframes: {
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'slide-in': 'slideIn 0.25s ease-out',
      },
    },
  },
  plugins: [],
}
