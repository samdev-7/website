<script>
	import '../app.css';

	import Navbar from '$lib/Navbar.svelte';
	import Footer from '$lib/Footer.svelte';

	import { onMount } from 'svelte';
	import { scroll } from '$lib/scroll';

	function scrollHandler() {
		scroll.set(window.scrollY);
	}

	onMount(scrollHandler);
</script>

<svelte:window on:scroll={scrollHandler} />

<Navbar />

<main class="bg-white dark:bg-slate-900">
	<slot />

	<div class="py-16 text-center">
		<p class="text-lg">I'm upgrading this site!</p>
		<p>It'll be back soon™️</p>
	</div>
</main>

<footer class="bg-white dark:bg-slate-900">
	<Footer />
</footer>
