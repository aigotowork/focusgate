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
        night: "0 24px 80px rgba(2, 6, 23, 0.45)"
      }
    }
  },
  plugins: []
};
