/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        navy: {
          DEFAULT: '#0A0F1E',
          2: '#111827',
          3: '#1E2A45',
          4: '#162035',
        },
        brand: {
          blue: '#3B82F6',
          'blue-dark': '#1D4ED8',
          cyan: '#06B6D4',
          purple: '#6366F1',
        },
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-up': 'slideUp 0.5s ease forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #3B82F6, #06B6D4)',
        'gradient-card': 'linear-gradient(135deg, #1E3A8A 0%, #1E2A5E 50%, #312E81 100%)',
      },
    },
  },
  plugins: [],
}
