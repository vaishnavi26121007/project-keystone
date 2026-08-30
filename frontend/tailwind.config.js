/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          200: "#b3ccff",
          500: "#3357d6",
          600: "#2745b3",
          700: "#1f3690",
        },
      },
    },
  },
  plugins: [],
};
