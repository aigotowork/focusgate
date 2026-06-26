/** @type {import('tailwindcss').Config} */
export default {
  content: ["./*.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "PingFang SC",
          "Microsoft YaHei",
          "sans-serif"
        ]
      },
      boxShadow: {
        soft: "0 24px 70px rgba(31, 41, 55, 0.12)"
      }
    }
  },
  plugins: []
};
