/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Your existing CSS variables converted to Tailwind colors
        'bg-main': '#181A20',
        'bg-panel': '#23262F',
        'bg-sidebar': '#1C1E24',
        'border': '#282B33',
        'text-main': '#F4F4F4',
        'text-muted': '#A0A4AE',
        'accent': '#2563eb',
        'accent-hover': '#1e40af',
        
        // Error system colors
        'error': '#ef5350',
        'error-bg': '#2d1a1a',
        'error-text': '#ef5350',
        
        // ML Prediction colors
        'card-bg': '#23262F',
        'border-color': '#282B33',
        'text-primary': '#F4F4F4',
        'text-secondary': '#A0A4AE',
        'primary-color': '#2563eb',
        'hover-bg': 'rgba(37, 99, 235, 0.1)',
        'warning-bg': 'rgba(255, 152, 0, 0.1)',
        'warning-color': '#ff9800',
        'warning-text': '#ffb74d',
      },
      borderRadius: {
        'radius': '12px',
      },
      boxShadow: {
        'shadow': '0 4px 24px rgba(0,0,0,0.18)',
      },
      fontSize: {
        'error': '13px',
      },
      spacing: {
        'error-margin': '2px',
      },
      borderWidth: {
        'error-border': '2px',
        'error-outline': '2px',
      }
    },
  },
  plugins: [],
} 