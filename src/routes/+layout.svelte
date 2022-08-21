<script>
	import Navbar from '$lib/header/Navbar.svelte';
	import '../app.css';

	import theme from '$lib/stores/theme'; 
	$: currentTheme = $theme === 'dark' ? 'dark' : '';
	console.log($theme)

</script>

<header class="{currentTheme}">
	<Navbar />
</header>

<main>
	<slot />
</main>
