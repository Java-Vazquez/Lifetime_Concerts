/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        anton: ['Anton', 'Impact', 'sans-serif'],
        archivo: ['Archivo', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        night: '#0a0a0c',
        surface: '#151518',
        edge: '#26262b',
        chalk: '#f4f3f1',
        dim: '#8c8c96',
        ember: '#ff4d2e',
      },
    },
  },
  plugins: [],
}
