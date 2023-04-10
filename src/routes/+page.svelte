<script lang="ts">
	import { onMount } from 'svelte';

	import { greetings } from '../lib/random-greeting';
	import Typewriter from 'svelte-typewriter';
	import { scrollToAnchor } from '$lib/scroll';
	import Navbar from '../components/Navbar.svelte';

	var email = 'Enable JavaScript to view';

	onMount(() => {
		email = window.atob('aGVsbG9Ac2FtbGl1LmRldg==');
	});
</script>

<svelte:head>
	<title>Sam Liu</title>
</svelte:head>

<Navbar />

<div id="landing" class="flex flex-col h-screen">
	<div class="m-auto text-center">
		<div class="space-y-6">
			<div class="space-y-2">
				<div
					class="text-blue-600 text-2xl tracking-wider font-mono min-h-[1.5em] typewriter-cursor"
				>
					<div class="nojs:hidden motion-reduce:hidden">
						<Typewriter mode="loopRandom" interval={75} unwriteInterval={20} wordInterval={5000}>
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
				<div class="font-medium tracking-wide text-7xl">
					<h1>I'm Sam</h1>
				</div>
			</div>
			<div class="space-y-1 tracking-wide text-slate-700">
				<div class="text-lg">
					<h2>Student, developer, and maker of things.</h2>
				</div>
				<div class="text-md text-slate-600">
					<h3>Learning, building, and striving to create impact.</h3>
				</div>
			</div>
			<div class="text-blue-500">
				<ul class="space-x-6">
					<li class="inline hover:underline">
						<a href="mailto:{email}" target="_blank" rel="noopener noreferrer">
							Email<noscript>&nbsp;(Enable Javascript to view)</noscript>
						</a>
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

<div id="about" class="scroll-m-16">
	<div class="grid grid-cols-5 py-24 mx-12">
		<div class="col-span-3 space-y-12">
			<div>
				<h4 class="text-5xl font-medium tracking-wide text-center text-blue-600">About me</h4>
			</div>
			<div class="space-y-[1em] text-justify tracking-wide leading-relaxed indent-6 text-lg mx-12">
				<p>
					👋 Hi! I am Sam, a student with a passion for programming, learning, and creating. My
					coding journey began in grade 4 with Scratch, and since then I have acquired many skills
					and languages. I can now create various projects ranging from games to robots and
					websites. I always seek new learning opportunities and challenges to grow.
				</p>
				<p>
					The web offers great opportunities for me to learn, create, and share what I have done. I
					decided to build my website, line by line, from the ground up, not with some website
					builder. This has been a great learning experience for me. Continue scrolling to see more
					of what I do!
				</p>
			</div>
		</div>
		<div class="col-span-2 bg-green-100">
			<p class="text-center">Some stats here</p>
		</div>
	</div>
</div>
