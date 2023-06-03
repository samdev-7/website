<script lang="ts">
	import { greetings } from '$lib/random-greeting';
	import { scrollToAnchor } from '$lib/scroll';

	import Typewriter from 'svelte-typewriter';
</script>

<div
	class="absolute flex justify-center p-4 mx-10 text-center bg-white border-2 mt-28 md:hidden rounded-xl border-slate-300 -xs:text-sm -sm:mx-3 -xs:mx-1 -2xs:p-2"
>
	<p>
		This website is not yet optimized for small screens, try accessing it on a desktop computer or
		laptop.
	</p>
</div>

<div id="landing" class="flex flex-col w-full h-screen">
	<div class="m-auto text-center">
		<div class="space-y-6">
			<div class="space-y-2">
				<div
					class="text-blue-600 text-sm sm:text-base md:text-2xl 3xl:text-3xl tracking-wider font-mono min-h-[1.5em] typewriter-cursor"
				>
					<div class="nojs:hidden motion-reduce:hidden">
						<Typewriter mode="loopRandom" interval={50} unwriteInterval={20} wordInterval={5000}>
							{#each greetings as greeting}
								<h2>{greeting}</h2>
							{/each}
						</Typewriter>
					</div>
					<div class="motion-safe:hidden nojs:hidden">
						<h2>{greetings[0]}</h2>
					</div>
					<noscript>
						<h2>{greetings[0]}</h2>
					</noscript>
				</div>
				<div class="font-medium tracking-wide text-7xl 3xl:text-8xl -sm:text-6xl">
					<h1>I'm Sam</h1>
				</div>
			</div>
			<div class="space-y-1 tracking-wide text-slate-700">
				<div class="text-lg 3xl:text-2xl -sm:text-base">
					<h2>Student, developer, and maker of things.</h2>
				</div>
				<div class="text-slate-600 3xl:text-xl -sm:text-sm">
					<h3>Learning, building, and striving to create impact.</h3>
				</div>
			</div>
			<div class="text-blue-600 xl:text-lg">
				<ul class="space-x-6 -sm:space-x-4 -2xs:text-sm -2xs:space-x-2">
					<li class="inline hover:underline">
						<a href="mailto:hello@samliu.dev" target="_blank" rel="noopener noreferrer">Email</a>
					</li>
					<li class="inline hover:underline">
						<a href="https://github.com/SamDev-7/" target="_blank" rel="noopener noreferrer"
							>GitHub</a
						>
					</li>
					<li class="inline hover:underline">
						<a href="https://social.dino.icu/@sam/" target="_blank" rel="noopener noreferrer"
							>Mastodon</a
						>
					</li>
				</ul>
			</div>
		</div>
	</div>
	<div class="absolute bottom-0 flex flex-col items-center w-full motion-safe:animate-bounce-slow">
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
