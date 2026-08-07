/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm "ledger paper" canvas — replaces the slate-50 admin-template default.
        paper: '#F6F3EC',
        ink: {
          DEFAULT: '#1C1B18',
          900: '#1C1B18',
          700: '#3A3830',
          600: '#4A473E',
          500: '#6B6558',
          400: '#8B8575',
          100: '#EFEAE0',
          50: '#F6F3EC',
        },
        line: '#E2DACB',
        // Spend / budget figures — the "cost" half of the spend-vs-social-value pair.
        copper: {
          50: '#F7EEE2',
          100: '#F1E4D3',
          600: '#A6672E',
          700: '#8A5424',
        },
        // Social value figures — the "impact" half of the pair.
        teal: {
          50: '#E9F3F0',
          100: '#DCEEE9',
          300: '#6FBFB2',
          600: '#147D6F',
          700: '#0F6259',
        },
        danger: {
          DEFAULT: '#B4432E',
          50: '#F7E9E5',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
