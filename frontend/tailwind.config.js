/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#12181B",
        signal: "#1D7A73",
        paper: "#F6F5F1",
      },
    },
  },
  plugins: [],
};
