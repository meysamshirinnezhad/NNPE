
/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: '#0277BD',
          secondary: '#F57C00',
          success: '#388E3C',
          warning: '#FBC02D',
          error: '#D32F2F',
          neutral: '#757575',
          surface: '#FFFFFF',
          background: '#F5F5F5'
        },
        fontFamily: {
          'inter': ['Inter', 'sans-serif'],
        },
        fontSize: {
          'h1': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
          'h2': ['24px', { lineHeight: '1.3', fontWeight: '700' }],
          'h3': ['18px', { lineHeight: '1.4', fontWeight: '700' }],
          'body': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
          'small': ['14px', { lineHeight: '1.4', fontWeight: '400' }],
          'button': ['16px', { lineHeight: '1', fontWeight: '500', textTransform: 'uppercase' }],
        },
        animation: {
          'fade-in-up': 'fadeInUp 300ms ease-out',
          'count-up': 'countUp 1500ms ease-out',
          'progress-fill': 'progressFill 1000ms ease-in-out',
          'pulse-gentle': 'pulse 2s ease-in-out infinite',
          'shimmer': 'shimmer 1.5s infinite',
          'draw-progress': 'drawProgress 800ms ease-out',
          'ripple': 'ripple 400ms ease-out',
          'checkmark': 'checkmark 300ms ease-out forwards',
          'slide-down': 'slideDown 500ms ease-out',
          'expand-circle': 'expandCircle 600ms ease-out',
        },
        scale: {
          '102': '1.02',
        },
        transitionDuration: {
          '200': '200ms',
          '300': '300ms',
          '400': '400ms',
          '500': '500ms',
          '600': '600ms',
          '800': '800ms',
          '1000': '1000ms',
          '1500': '1500ms',
        }
      },
    },
    plugins: [],
  }
