export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#020617',
        },
        emerald: {
          500: '#10b981',
        },
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
