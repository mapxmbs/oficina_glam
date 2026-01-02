/** @type {import('tailwindcss').Config} */
module.exports = {
  // Aqui dizemos para o sistema: "aplique estilo em todos os arquivos dentro da pasta app"
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        glam: {
          primary: '#E91E63', // Rosa Forte (Logo/Botões)
          light: '#FCE4EC',   // Rosa Bem Claro (Fundo suave)
          dark: '#880E4F',    // Vinho (Textos importantes)
          text: '#4A4A4A',    // Cinza Escuro (Leitura fácil)
        }
      },
    },
  },
  plugins: [],
}