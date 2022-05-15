module.exports = {
  mode: 'jit',
  content: ["./**/*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        'poppins': ["'Poppins'", 'sans-serif']
      },
      screens: {
        '-sm': {'max': '640px'},
        '-md': {'max': '768px'},
        '-lg': {'max': '1024px'},
        '-xl': {'max': '1280px'},
        '-2xl': {'max': '1536px'},
      }
    }
  },
  variants: {},
  plugins: [],
}

// https://play.tailwindcss.com/4giqp0pOAB?layout=horizontal
// npx tailwindcss -i ./tailwind.css -o ./main.css
// npx postcss ./tailwind.css -o ./main.css
