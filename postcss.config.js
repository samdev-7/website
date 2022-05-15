const purgecss = require('@fullhuman/postcss-purgecss')

module.exports = {
  plugins: [
		require('postcss-import'),
		//purgecss({
    //	content: ["./**/*.{html,js}"],
  	//}),
		require('tailwindcss'),
    require('autoprefixer'),
    require('cssnano')({
      preset: 'default',
    })
  ],
	map: false
}