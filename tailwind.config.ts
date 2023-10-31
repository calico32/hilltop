import headlessui from '@headlessui/tailwindcss'
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        xs: '480px',
      },
      fontFamily: {
        sans: [
          'var(--sans)',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Noto Sans',
          'Ubuntu',
          'Cantarell',
          'Helvetica Neue',
          'sans-serif',
        ],
        serif: ['var(--serif)', 'serif'],
      },
      colors: {
        navyblue: {
          0: '#00395d',
        },
        emeraldgreen: {
          0: '#00b156',
          1: '#00843d',
        },
        basegray: {
          0: '#ededed',
        },
      },
    },
  },
  plugins: [headlessui as any],
}
export default config
