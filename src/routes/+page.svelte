<script>
	import { browser } from '$app/env';

	import LangCard from '$lib/page/LangCard.svelte';
	import ProjectCard from '$lib/page/ProjectCard.svelte';

	import langs from '$lib/page/langs';
	import projects from '$lib/page/projects';

	import getEntries from '$lib/page/scrapbook';

	import { scrollToAnchor, scrollToHome } from '$lib/utils/scroll';
	import ScrapbookPost from '$lib/page/ScrapbookPost.svelte';

	let show_all_lang = false;
	let shown_langs = langs;

	let show_all_projects = false;
	let shown_projects = projects;

	let width;

	$: if (!show_all_lang) {
		if (width > 1024) {
			// lg breakpoint
			shown_langs = langs.slice(0, 9);
		} else if (width > 768) {
			// md breakpoint
			shown_langs = langs.slice(0, 6);
		} else {
			// sm breakpoint
			shown_langs = langs.slice(0, 4);
		}
	} else {
		shown_langs = langs;
	}

	$: if (!show_all_projects) {
		if (width > 1024) {
			// lg breakpoint
			shown_projects = projects.slice(0, 6);
		} else if (width > 768) {
			// md breakpoint
			shown_projects = projects.slice(0, 6);
		} else {
			// sm breakpoint
			shown_projects = projects.slice(0, 4);
		}
	} else {
		shown_projects = projects;
	}

	let promise = getEntries();

	let email;

	if (browser) {
		email = window.atob('aGVsbG9Ac2FtbC5pcy1hLmRldg==');
	}

</script>

<svelte:window bind:innerWidth={width}/>

<svelte:head>
	<title>Sam Liu</title>
</svelte:head>

<!-- Main Title -->
<div class="flex flex-col h-screen relative">
	<div class="m-auto text-center">
		<div class="mx-16 -xs:mx-8">
			<p class="text-2xl tracking-wider text-blue-600 dark:text-blue-400">Hello, World!</p>
			<h1 class="mt-2 text-7xl font-medium dark:text-white">I'm Sam</h1>
			<h2 class="mt-6 text-lg text-slate-600 dark:text-slate-300">Developing software as a hobby.</h2>
			<p class="text-slate-500 text-md dark:text-slate-400">I hope to build impactful and practical products.</p>
			<ul class="space-x-4 mt-4">
				<li class="inline text-blue-500 dark:text-blue-400 hover:underline"><a rel="noopener" href="mailto:{email}" target="_blank">Email</a></li>
				<li class="inline text-blue-500 dark:text-blue-400 hover:underline"><a rel="noopener" href="https://github.com/SamDev-7" target="_blank">Github</a></li>
			</ul> 
		</div>
	</div>

	<div class="absolute bottom-0 flex flex-col w-full">
		<!-- Next Section Arrow-->
		<div class="mx-auto mb-1 motion-safe:animate-bounce-slow">
			<a rel="noopener" href="#about" on:click={(event) => scrollToAnchor(event, 'about')} aria-label="Scroll down to read more">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					xmlns:xlink="http://www.w3.org/1999/xlink"
					aria-hidden="true"
					role="img"
					class="text-slate-300 dark:text-slate-500"
					width="60"
					height="60"
					preserveAspectRatio="xMidYMid meet"
					viewBox="0 0 24 24"
					fill="currentColor"
					stroke="currentColor"
					>>
					<path
						d="M17 13l-5 5m0 0l-5-5m5 5V6"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</a>
		</div>
	</div>
</div>

<!-- About Section -->
<div id="about" class="py-16 text-center">

	<!-- Introduction -->
	<div class="px-16 py-12 -lg:px-8 lg:-xl:px-10 text-center text-slate-600 dark:text-slate-200">
		<h2 class="text-4xl font-medium text-slate-800 dark:text-white">About Me</h2>
		<p class="mt-12">Hi! I am Sam, a student passionate about computer science, engineering, and creating.<br>I am always looking for learning opportunities to reach my ambitious goal of contributing to society through the power of technology.</p>
		<p class="mt-4">I created this site to share my experiences, show you what I have done, and post what I have been working on.</p>
	</div>

	<!-- Languages & Frameworks -->
	<div id="skills" class="text-center text-slate-600 dark:text-slate-200 py-6 scroll-mt-16">
		<div class="px-16 -lg:px-8 lg:-xl:px-10">
			<h3 class="text-blue-600 dark:text-blue-400 text-2xl font-medium">Here are some languages, frameworks, and tools I know</h3>
			<p class="mt-4">My programming journey started in grade 4. Since then, I have picked up many valuable skills.<br>This list will expand as I continue my journey looking for opportunities.</p>
			<p class="text-sm text-slate-500 mt-6 dark:text-slate-400">* Technically not programming languages, but I am putting them in anyways.</p>
		</div>

		<div style="overflow-anchor: none;">
			<div class="mt-16 px-64 grid grid-cols-3 gap-12 xl:-2xl:px-32 xs:-xl:px-16 md:-lg:grid-cols-2 -md:grid-cols-1 2xs:-xs:px-8 -2xs:px-0 -2xs:gap-6 -2xs:divide-y-2 dark:divide-slate-700">
			{#each shown_langs as lang}
				<LangCard {...lang}/>
			{/each}
			</div>

			{#if !show_all_lang}
				<div class="relative">
					<div class="absolute bg-gradient-to-t from-white dark:from-slate-900 w-full h-48 -top-48" aria-hidden="true">
						
					</div>
					<div class="absolute w-full text-center">
						<input class="hidden" type="checkbox" id="show_all_lang" bind:checked={show_all_lang} />
						<label for="show_all_lang"><p class=" text-slate-500 dark:text-slate-300 px-4 py-2 hover:text-black dark:hover:text-white cursor-pointer">Show All</p></label>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Projects Section -->
<div id="projects" class="py-16 text-center">

	<!-- Introduction -->
	<div class="px-16 py-12 -lg:px-8 lg:-xl:px-10 text-center text-slate-600 dark:text-slate-200">
		<h2 class="text-4xl font-medium text-slate-800 dark:text-white">My Projects</h2>
		<p class="mt-12">I like to build things by tinkering and improving it as I learn more things.<br>Experimentation allows me to learn new concepts and skills and to reinforce older ones I might have forgotten.<br></p>
		<p class="mt-4">I want to use my skills to create impactful and useful things.</p>
	</div>

	<!-- Projects -->
	<div class="text-center text-slate-600 dark:text-slate-200 py-6">
		<div class="px-16 -lg:px-8 lg:-xl:px-10">
			<h3 class="text-blue-600 dark:text-blue-400 text-2xl font-medium">Here are some things I have built</h3>
			<p class="mt-4">Although it may not look impressive, all are small steps towards a big goal.<br>This list will expand as I sift though all my projects.</p>
		</div>

		<div style="overflow-anchor: none;">
			<div class="mt-16 px-64 grid grid-cols-3 gap-12 xl:-2xl:px-32 xs:-xl:px-16 md:-lg:grid-cols-2 -md:grid-cols-1 2xs:-xs:px-8 -2xs:px-0 -2xs:gap-6 -2xs:divide-y-2 dark:divide-slate-700">
			{#each shown_projects as project}
				<ProjectCard {...project}/>
			{/each}
			</div>

			{#if !show_all_projects}
				<div class="relative">
					<div class="absolute bg-gradient-to-t from-white dark:from-slate-900 w-full h-48 -top-48" aria-hidden="true">
						
					</div>
					<div class="absolute w-full text-center">
						<input class="hidden" type="checkbox" id="show_all_projects" bind:checked={show_all_projects} />
						<label for="show_all_projects"><p class=" text-slate-500 dark:text-slate-300 px-4 py-2 hover:text-black dark:hover:text-white cursor-pointer">Show All</p></label>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Scrapbook Section -->
<div id="scrapbook" class="pt-16 pb-8 text-center">

	<!-- Introduction -->
	<div class="px-16 py-12 -lg:px-8 lg:-xl:px-10 text-center text-slate-600 dark:text-slate-200">
		<h2 class="text-4xl font-medium text-slate-800 dark:text-white">My Scrapbook</h2>
		<p class="mt-12">The scrapbook is where I document my progress and learning.<br><a  rel="noopener" href="https://scrapbook.hackclub.com/Sam" target="_blank" class="inline-url">Click here to see my full Scrapbook.</a></p>
		<p class="mt-4">Scrapbook is built by <a rel="noopener" href="https://hackclub.com" target="_blank" class="inline-url">Hack Club</a>. <a rel="noopener" href="https://scrapbook.hackclub.com/" target="_blank" class="secondary-inline-url"><br>See what other Hack Clubbers are doing.</a></p>
	</div>

	<!-- Scrapbook Content -->
	<div class="text-center text-slate-600 dark:text-slate-200 py-6">
		<div class="mx-16 -lg:mx-8 lg:-xl:mx-10">
			<h3 class="text-blue-600 dark:text-blue-400 text-2xl font-medium">Here is what I have been up to</h3>
			<p class="mt-4">Interested in something you see? Come chat with me on the <a rel="noopener" href="https://hackclub.com/slack" target="_blank" class="inline-url">Hack Club Slack</a>, or <a rel="noopener" href="/" on:click={(event) => scrollToHome(event)} class="inline-url">contact me</a>.</p>
		</div>

		<div class="text-left mx-64 md:-xl:mx-32 xs:-md:mx-16 -xs:mx-2 -xs:text-center" style="overflow-anchor: none;">
			<div class="mt-16 divide-y-2 divide-slate-100 dark:divide-slate-700">
			{#await promise}
				<p class="text-center">Loading Scrapbook...</p>
			{:then posts}
				{#each posts as post}
				<div>
					<ScrapbookPost {...post}/>
				</div>
				{/each}
			{/await}
			</div>
			<div class="pt-10 text-center">
				<a rel="noopener" href="https://scrapbook.hackclub.com/Sam" target="_blank" class="text-blue-500 dark:text-blue-400 hover:underline">Click here to see all my Scrapbook Posts</a>
			</div>
		</div>
	</div>
</div>