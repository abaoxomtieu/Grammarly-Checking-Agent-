/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#b9e6fe',
          300: '#7cd4fd',
          400: '#36bffa',
          500: '#0da2e7',
          600: '#0281c2',
          700: '#036a9e',
          800: '#065986',
          900: '#0b4a6e',
          950: '#082f49',
        },
        secondary: {
          50: '#f5f7fa',
          100: '#ebeef3',
          200: '#d2dae5',
          300: '#acbbd0',
          400: '#8097b5',
          500: '#5f7a9c',
          600: '#486283',
          700: '#3b506b',
          800: '#34455a',
          900: '#2d3a4c',
          950: '#1a222e',
        },
        accent: {
          50: '#f2f7fb',
          100: '#e7eff5',
          200: '#d3e2ee',
          300: '#b5cee0',
          400: '#8fb2cd',
          500: '#7398bb',
          600: '#5e7fa7',
          700: '#506a96',
          800: '#44587b',
          900: '#3c4b66',
          950: '#273043',
        },
      },
      spacing: {
        '128': '32rem',
      },
      boxShadow: {
        'card': '0 4px 12px rgba(0,0,0,0.05)',
        'card-hover': '0 8px 16px rgba(0,0,0,0.1)',
      },
      borderRadius: {
        'xl': '1rem',
      },
    },
  },
  plugins: [],
}