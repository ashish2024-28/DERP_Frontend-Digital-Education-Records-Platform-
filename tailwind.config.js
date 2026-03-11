/** @type {import('tailwindcss').Config} */
export default {

  darkMode: "class",   // ⭐ enable dark mode

  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {

      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },

      animation: {
        float: "float 4s ease-in-out infinite",
      },

    },

    screens: {
      custom: "400px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },

  },

  plugins: [],
};