import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--sans)', 'sans-serif'],
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
  plugins: [],
}
export default config
