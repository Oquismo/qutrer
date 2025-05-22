/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Habilitar el modo oscuro basado en clases HTML
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'twitter-blue': '#1DA1F2',
        // Colores para el modo claro (puedes ajustarlos)
        light: {
          background: '#FFFFFF',
          text: '#1F2937',
          card: '#F9FAFB',
          border: '#E5E7EB',
        },
        // Colores para el modo oscuro
        dark: {
          background: '#15202B', // Un fondo oscuro principal
          text: '#E7E9EA',       // Texto claro para contraste
          card: '#1A2A3A',       // Un color ligeramente más claro para tarjetas o secciones
          border: '#374151',     // Bordes más oscuros
          primary: '#1DA1F2',    // Color primario (azul Twitter)
          secondary: '#22303C',  // Color secundario
        },
        primary: {
          50: "#FDFDEA",
          100: "#FDF6B2",
          200: "#FCE96A",
          300: "#FACA15",
          400: "#E3A008",
          500: "#C27803",
          600: "#9F580A",
          700: "#8E4B10",
          800: "#723B13",
          900: "#633112",
        },
      },
    },
  },
  plugins: [],
}