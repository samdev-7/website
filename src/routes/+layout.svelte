<script>
	import '../app.css';

	import Navbar from '$lib/Navbar.svelte';

	import { scroll } from '$lib/scroll';

	function scrollHandler(event) {
		scroll.set(window.scrollY);
	}

</script>

<svelte:window on:scroll={scrollHandler}/>

<Navbar />

<main class="bg-white dark:bg-slate-900">
	<slot />
</main>

<footer class="bg-white dark:bg-slate-900">
	<!--<Footer />-->
</footer>
