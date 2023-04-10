<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';

	import { scroll, nearestAnchor } from '$lib/scroll';

	function scrollHandler() {
		scroll.set(window.scrollY);

		if ($scroll == 0) {
			if (window.location.pathname == '/') {
				window.history.pushState('', '', window.location.pathname.replace(/#/, ''));
			}
		}

		if (window.location.pathname == '/') {
			const anchors = ['landing', 'about', 'abouwt'];

			let nearest = nearestAnchor(anchors, $scroll);

			console.log(nearest);

			if (nearest != null) {
				if (nearest == 'landing') {
					window.history.pushState('', '', window.location.pathname.replace(/#/, ''));
				} else {
					window.history.pushState('', '', window.location.pathname + '#' + nearest);
				}
			}
		}
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
