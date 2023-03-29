/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
			fontFamily: {
				poppins: ["'Poppins'", 'sans-serif']
			},
			screens: {
				'xs': { min: '512px' },
				'2xs': { min: '384px' },
				'-2xs': { max: '384px' },
				'-xs': { max: '512px' },
				'-sm': { max: '640px' },
				'-md': { max: '768px' },
				'-lg': { max: '1024px' },
				'-xl': { max: '1280px' },
				'-2xl': { max: '1536px' }
			},
			animation: {
				'bounce-slow': 'bounce 2s infinite'
			}
		}
  },
  plugins: [],
}

