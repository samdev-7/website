<script lang="ts">
	import { greetings } from '../lib/random-greeting';
	import Typewriter from 'svelte-typewriter';
	import { scrollToAnchor } from '$lib/scroll';
</script>

<div id="landing" class="flex flex-col h-screen">
	<div class="m-auto text-center">
		<div class="space-y-6">
			<div class="space-y-2">
				<div
					style="--cursor-color: #2563eb; --cursor-width: 0.20ch"
					class="text-blue-600 text-2xl tracking-wider font-mono min-h-[1.5em]"
				>
					<Typewriter mode="loopRandom" interval={75} unwriteInterval={20} wordInterval={5000}>
						{#each greetings as greeting}
							<h2>{greeting}</h2>
						{/each}
					</Typewriter>
				</div>
				<div class="font-medium text-7xl">
					<h1>I'm Sam</h1>
				</div>
			</div>
			<div class="space-y-2 tracking-wide text-slate-600">
				<div class="text-lg">
					<h3>Student learning, building, and striving to create impact.</h3>
				</div>
				<div class="text-md">
					<p>One line of code at a time...</p>
				</div>
			</div>
		</div>
	</div>
	<div class="absolute bottom-0 flex flex-col items-center w-full animate-bounce-slow" aria-hidden="true">
		<a href="#about" on:click={(event) => scrollToAnchor(event, 'about')}>
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

