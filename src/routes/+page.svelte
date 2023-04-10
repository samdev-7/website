<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';

	import { greetings } from '../lib/random-greeting';
	import Typewriter from 'svelte-typewriter';
	import { scrollToAnchor } from '$lib/scroll';
	import Navbar from '../components/Navbar.svelte';

	var email = 'Enable JavaScript to view';

	onMount(() => {
		email = window.atob('aGVsbG9Ac2FtbGl1LmRldg==');
	});

	export let data: PageData;
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
	<div class="grid grid-cols-5 py-24 mx-6">
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
		<div class="flex flex-col col-span-2 mx-6 space-y-6">
			<div
				class="flex items-center px-6 py-2 mx-auto my-4 space-x-4 border-2 rounded-full border-slate-300"
			>
				<span class="relative flex w-4 h-4">
					<span
						class="absolute inline-flex w-full h-full bg-green-500 rounded-full opacity-75 motion-safe:animate-ping"
					/>
					<span class="relative inline-flex w-4 h-4 bg-green-500 rounded-full" />
				</span>
				<p class="text-2xl font-medium text-center">Live Statistics</p>
			</div>
			<div>
				<div class="flex flex-row px-10 pt-6 pb-4 space-x-16 border-2 rounded-xl border-slate-300">
					<div class="space-y-1 text-slate-800">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 16 16"
							width="64px"
							height="64px"
							fill="currentColor"
							aria-label="GitHub Icon"
							class="w-16 h-16"
						>
							<path
								d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
							/>
						</svg>
						<p class="mr-0.5 text-center">GitHub</p>
					</div>
					<div class="w-full space-y-1">
						<div class="flex flex-row w-full text-lg">
							<p class="mr-auto">Total GitHub commits:</p>
							<p class="font-medium text-blue-600">{data ? data.total_commits : 'Loading'}</p>
						</div>
						<div class="flex flex-row w-full text-lg">
							<p class="mr-auto">Total files on Github:</p>
							<p class="font-medium text-blue-600">{data ? data.total_files : 'Loading'}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
