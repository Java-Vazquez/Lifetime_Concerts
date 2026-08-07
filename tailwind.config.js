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
      // Ni negro ni blanco puros: carbón cálido y beige, que cansan menos la
      // vista y le dan temperatura a las fotos.
      colors: {
        night: '#17161a',
        surface: '#211f25',
        edge: '#332f38',
        chalk: '#ece7de',
        dim: '#9c958d',
        ember: '#f2603a',
        // Barras de los gráficos: mismo naranja pero dentro de la banda de
        // luminosidad OKLCH 0.48–0.67 que pide fondo oscuro (validado).
        // No usar el nombre "data": choca con las variantes data-* de Tailwind.
        chart: '#e85832',
      },
    },
  },
  plugins: [],
}
