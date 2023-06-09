<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';

	import { scroll } from '$lib/scroll';

	function scrollHandler() {
		scroll.set(window.scrollY);
	}

	onMount(() => {
		scrollHandler();
	});
</script>

<noscript>
	<style>
		.nojs\:hidden {
			display: none;
		}
	</style>
</noscript>

<svelte:window on:scroll={scrollHandler} />

<slot />
