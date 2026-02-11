/** @type {import('tailwindcss').Config} */
module.exports = {
  // Aqui dizemos para o sistema: "aplique estilo em todos os arquivos dentro da pasta app"
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        glam: {
          primary: '#8B2942',
          light: '#FDF2F6',
          dark: '#0F0F0F',
          text: '#5C5C5C',
        }
      },
    },
  },
  plugins: [],
}