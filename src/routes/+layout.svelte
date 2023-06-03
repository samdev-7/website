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
			const anchors = ['landing', 'about', 'projects'];

			let nearest = nearestAnchor(anchors, $scroll);

			if (nearest != null) {
				if (nearest == 'landing') {
					if (location.hash != '') {
						window.history.pushState('', '', window.location.pathname.replace(/#/, ''));
					}
				} else {
					if (location.hash != '#' + nearest) {
						window.history.pushState('', '', window.location.pathname + '#' + nearest);
					}
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
