/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme colors
        dark: {
          950: '#0a0a0f',
          900: '#13131a',
          850: '#1a1a24',
          800: '#1f1f2e',
          700: '#2a2a3e',
          600: '#3a3a54',
          500: '#4a4a64',
          400: '#5a5a74',
        },
        // Accent colors
        accent: {
          primary: '#e94560',
          secondary: '#ff6b9d',
          tertiary: '#c77dff',
          gold: '#ffd700',
        },
        // Neon effects
        neon: {
          blue: '#00f0ff',
          purple: '#b794f6',
          pink: '#ff0080',
          green: '#00ff88',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(233, 69, 96, 0.5)',
        'glow': '0 0 20px rgba(233, 69, 96, 0.6)',
        'glow-lg': '0 0 30px rgba(233, 69, 96, 0.7)',
        'neon-blue': '0 0 20px rgba(0, 240, 255, 0.6)',
        'neon-purple': '0 0 20px rgba(183, 148, 246, 0.6)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(233, 69, 96, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(233, 69, 96, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}
