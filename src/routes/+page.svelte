<script lang="ts">
	import { greetings } from '../lib/random-greeting';
	import Typewriter from 'svelte-typewriter';
	import { scrollToAnchor } from '$lib/scroll';
</script>

<svelte:head>
	<title>Sam Liu</title>
</svelte:head>

<div id="landing" class="flex flex-col h-screen">
	<div class="m-auto text-center">
		<div class="space-y-6">
			<div class="space-y-2">
				<div class="text-blue-600 text-2xl tracking-wider font-mono typewriter-cursor">
					<div class="nojs-hidden">
						<Typewriter mode="loopRandom" interval={75} unwriteInterval={20} wordInterval={5000}>
							{#each greetings as greeting}
								<h2>{greeting}</h2>
							{/each}
						</Typewriter>
					</div>
					<noscript>
						<h2>{greetings[0]}</h2>
					</noscript>
				</div>
				<div class="font-medium tracking-wide text-7xl">
					<h1>I'm Sam</h1>
				</div>
			</div>
			<div class="space-y-2 tracking-wide text-slate-700">
				<div class="text-xl">
					<h3>Student developer and maker of things.</h3>
				</div>
				<div class="text-md">
					<p>Learning, building, and striving to create impact.</p>
				</div>
			</div>
		</div>
	</div>
	<div class="absolute bottom-0 flex flex-col items-center w-full animate-bounce-slow">
		<a href="#about" on:click={(event) => scrollToAnchor(event, 'about')} aria-label="Next section">
			<div class="mx-auto text-slate-300">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					stroke-width="0.25px"
					stroke="currentColor"
					fill="currentColor"
					width="4rem"
					height="4rem"
				>
					<path
						d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
					/>
				</svg>
			</div>
		</a>
	</div>
</div>
