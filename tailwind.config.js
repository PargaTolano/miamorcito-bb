module.exports = {
  content: [
    "./public/**/*.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      transitionDelay: {
        '2000': '2000ms',
        '3000': '3000ms',
        '4000': '4000ms',
        '19000': '19000ms',
      }
    },
  },
  plugins: [],
}
