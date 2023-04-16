<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';

	import { greetings } from '$lib/random-greeting';
	import { scrollToAnchor } from '$lib/scroll';
	import { refreshStats } from '$lib/stats-refresher';

	import Navbar from '../components/Navbar.svelte';

	import moment from 'moment';
	import Typewriter from 'svelte-typewriter';

	export let data: PageData;

	onMount(() => {
		setInterval(async () => {
			data = await refreshStats();
		}, 60000);
	});
</script>

<svelte:head>
	<title>Sam Liu</title>
</svelte:head>

<Navbar />

<div
	class="absolute flex justify-center p-4 mx-10 text-center bg-white border-2 mt-28 md:hidden rounded-xl border-slate-300 -xs:text-sm -sm:mx-3 -xs:mx-1 -2xs:p-2"
>
	<p>
		Hello fellow mobile user! This website is not optimized for mobile use, try accessing it on a
		desktop computer or laptop.
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

<div id="about" class="scroll-m-16">
	<div class="grid py-24 mx-10 xl:grid-cols-5 lg:grid-cols-2 -sm:mx-0 -lg:space-y-12">
		<div class="space-y-12 xl:col-span-3">
			<div>
				<h4 class="text-5xl font-medium tracking-wide text-center text-blue-600 -2xs:text-4xl">
					About me
				</h4>
			</div>
			<div
				class="space-y-[1em] text-justify tracking-wide leading-relaxed indent-10 text-lg mx-6 sm:mx-12 xl:mx-24 3xl:mx-48"
			>
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
		<div
			class="flex flex-col justify-center p-8 py-8 mx-6 space-y-6 border-2 xl:col-span-2 -sm:mx-4 border-slate-300 -sm:p-4 rounded-xl"
		>
			<div class="flex flex-col items-center mx-auto">
				<div class="flex flex-row items-center mx-auto space-x-4">
					<span class="relative flex w-4 h-4">
						<span
							class="absolute inline-flex w-full h-full bg-green-500 rounded-full opacity-75 motion-safe:animate-ping"
						/>
						<span class="relative inline-flex w-4 h-4 bg-green-500 rounded-full" />
					</span>
					<p class="text-2xl font-medium text-center -2xs:text-base">Live Statistics</p>
				</div>
				<p class="text-sm text-center text-slate-600 nojs:hidden">Refreshes every minute</p>
				<noscript>
					<p class="text-sm text-center text-slate-600">Enable JavaScript for live updates</p>
				</noscript>
			</div>
			<div>
				<div class="flex flex-col mx-6 space-y-3">
					<div>
						<div class="flex flex-row text-lg -2xs:text-base">
							<p class="mr-auto">Public GitHub repositories created:</p>

							<p class="font-medium text-blue-600">
								{data ? data.total_repos : 'Loading'}
							</p>
						</div>
						<div class="mx-10 text-sm italic text-slate-700 -2xs:hidden">
							<p class="lg:truncate">
								Repository <span class="underline"
									><a
										href={data ? data.most_stars_link : undefined}
										target="_blank"
										rel="noopener noreferrer">{data ? data.most_stars_name : 'Loading'}</a
									></span
								> has the most stars.
							</p>
						</div>
					</div>
					<div>
						<div class="flex flex-row text-lg -2xs:text-base">
							<p class="mr-auto">Total GitHub commits:</p>
							<p class="font-medium text-blue-600">{data ? data.total_commits : 'Loading'}</p>
						</div>
						<div class="mx-10 text-sm italic text-slate-700 -2xs:hidden">
							<p class="lg:truncate">
								Latest commit: <span class="underline"
									><a
										href={data ? data.latest_commit_link : undefined}
										target="_blank"
										rel="noopener noreferrer">{data ? data.latest_commit_message : 'Loading'}</a
									></span
								>.
							</p>
						</div>
					</div>
					<div>
						<div class="flex flex-row text-lg -2xs:text-base">
							<p class="mr-auto">
								<span
									><a href="https://hackclub.com/slack" target="_blank" rel="noopener noreferrer"
										>Hack Club</a
									></span
								> messages sent:
							</p>
							<p class="font-medium text-blue-600">{data ? data.total_messages : 'Loading'}</p>
						</div>
						<div class="mx-10 text-sm italic text-slate-700 -2xs:hidden">
							<p class="lg:truncate">
								Latest message was sent <span class="underline">
									<a
										href={data ? data.latest_message_link : undefined}
										target="_blank"
										rel="noopener noreferrer">{moment(data.latest_message_time).fromNow()}</a
									></span
								>.
							</p>
						</div>
					</div>
					<div>
						<div class="flex flex-row text-lg -2xs:text-base">
							<p class="mr-auto">Website visitors in the past year:</p>
							<p class="font-medium text-blue-600">
								{data ? data.total_unique_visitors : 'Loading'}
							</p>
						</div>
						<div class="mx-10 text-sm italic text-slate-700 -2xs:hidden">
							<p class="lg:truncate">
								Most visitors are from <span class="underline"
									>{data ? data.most_visitor_location : 'Loading'}</span
								>.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
