<script>
	import '../app.css';

	import { cubicOut, backIn } from 'svelte/easing'
	import { fade } from 'svelte/transition'
	import { onMount } from 'svelte'

	import Navbar from '$lib/header/Navbar.svelte';
	import Footer from '$lib/footer/Footer.svelte';
	
	import { scroll } from '$lib/utils/scroll';

	function scrollHandler() {
		scroll.set(window.scrollY);
	}

	let snowEnabled = true; 

	// Snowfall from https://mannes.tech/svelte-snowfall/
	// a bunch of variables defining the snow and how it falls
	const SNOWFLAKES_COUNT = 50
	const SNOWFLAKE_MIN_SCALE = 0.4
	const MAX_FALL_DURATION = 10000
	const MELTING_WAIT = 0
	const MELTING_DURATION = 2000
	const WIND_FORCE = 0.1
	const SNOW_ICONS = ['❆', '❅', '❄']
	const MAX_TOTAL_TIME = MAX_FALL_DURATION + MELTING_WAIT + MELTING_DURATION
	// this function generates the random configuration with all necessary values
	function randomSnowflakeConfig(i) {
		const scale = SNOWFLAKE_MIN_SCALE + Math.random() * (1 - SNOWFLAKE_MIN_SCALE)
		const xStart = Math.random() * (1 + WIND_FORCE) - WIND_FORCE
		return {
		visible: false,
		scale,
		inDelay: Math.random() * MAX_TOTAL_TIME,
		inDuration: (1 + SNOWFLAKE_MIN_SCALE - scale) * MAX_FALL_DURATION,
		xStart,
		xEnd: xStart + scale * WIND_FORCE,
		snowIcon: SNOW_ICONS[i % SNOW_ICONS.length],
		}
	}
	// actially generating the snowflakes
	let snowflakes = new Array(SNOWFLAKES_COUNT)
		// @ts-ignore
		.fill()
		.map((_, i) => randomSnowflakeConfig(i))
		.sort((a, b) => a.scale - b.scale)
	// the custom fall transition.
	// See docs for how to create custom Svelte transitions: https://svelte.dev/docs#transition_fn
	function fall(_node, { delay = 0, duration, xStart = 0.1, xEnd = 0.5, scale = 1.0 }) {
		return {
		duration,
		delay,
		css: t => {
			const x_t = backIn(t)
			const y_t = t

			const x_coord = (xEnd - xStart) * x_t + xStart
			return `
			transform: scale(${scale}) rotate(${x_t * 720}deg);
			left: ${x_coord * 100}%;
			bottom: ${100 - y_t * 100}%;
			`
		},
		}
	}
	// start everything on mount. starting means setting the snowflakes visible.
	// this "hack" is not needed when you configure your svelte to display transitions on first render:
	// https://svelte.dev/docs#Client-side_component_API - set `intro: true`
	onMount(async () => {
		setTimeout(() => {
		snowflakes = snowflakes.map(sf => ({ ...sf, visible: true }))
		}, 50)
	})
</script>

<svelte:window on:scroll={scrollHandler} />

<!-- Snowfall from https://mannes.tech/svelte-snowfall/ -->
<style>
	.snowframe {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    overflow: hidden;
	width: 100%;
	height: 100%;
  }

  .snowflake {
    color: #fff;
    font-size: 1.2rem;
    line-height: 1.2rem;
    font-family: Arial, sans-serif;
    text-shadow: 0 0 5px #000;
    position: absolute;
    z-index: 1000;
    overflow: hidden;
  }
</style>

{#if snowEnabled}
<div class="snowframe x-40" aria-hidden="true">
	{#each snowflakes as flake}
	  {#if flake.visible}
		<div
		  class="snowflake"
		  style={`transform: scale(${flake.scale}); left: ${flake.xEnd * 100}%`}
		  in:fall={{ delay: flake.inDelay, duration: flake.inDuration, scale: flake.scale, xStart: flake.xStart, xEnd: flake.xEnd }}
		  out:fade={{ delay: MELTING_WAIT, duration: MELTING_DURATION, easing: cubicOut }}
		  on:introend={() => (flake.visible = false)}
		  on:outroend={() => (flake.visible = true)}>
		  {flake.snowIcon}
		</div>
	  {/if}
	{/each}
</div>
{/if}

<Navbar bind:snowEnabled={snowEnabled}/>

<main class="bg-white dark:bg-slate-900">
	<slot/>
</main>

<footer class="bg-white dark:bg-slate-900">
	<Footer />
</footer>
