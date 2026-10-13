import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/styles/**/*.css"
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155'
        },
        emerald: {
          600: '#059669',
          500: '#10B981',
          50: '#ECFDF5'
        },
        slate: {
          50: '#F8FAFC'
        }
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        '2xs': '0 1px rgba(0, 0, 0, 0.05)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      borderRadius: {
        'xs': '2px',
      }
    },
  },
  plugins: [
    plugin(function({ addUtilities, addBase }) {
      // Real fade-in animation (the old .fade-in-0 / .zoom-in-95 only set
      // opacity: 0 / scale(0.95) with no animation, so dropdowns and modals stayed invisible)
      addBase({
        '@keyframes ts-fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      });
      addUtilities({
        '.text-decoration-none': { 'text-decoration': 'none' },
        '.animate-in': { animation: 'ts-fade-in 150ms ease-out both' },
        '.fade-in-0': {},
        '.zoom-in-95': {},
      });
    })
  ],
};