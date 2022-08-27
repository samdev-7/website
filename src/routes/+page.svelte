<script>
	import LangCard from '$lib/page/LangCard.svelte';

	import langs from '$lib/page/langs';
	import { scrollToAnchor } from '$lib/scroll';

	let show_all_lang = false;
	let sliced_langs;
	let width;

	$: if (!show_all_lang) {
		if (width > 1024) {
			// lg breakpoint
			sliced_langs = langs.slice(0, 9);
		} else if (width > 768) {
			// md breakpoint
			sliced_langs = langs.slice(0, 6);
		} else {
			// sm breakpoint
			sliced_langs = langs.slice(0, 4);
		}
	}
</script>

<svelte:window bind:innerWidth={width}/>

<svelte:head>
	<title>Sam Liu</title>
	<meta name="description" content="Hello! This is my personal website." />
</svelte:head>

<!-- Main Title -->
<div class="flex flex-col h-screen">
	<div class="m-auto text-center">
		<div class="mx-16 -xs:mx-8">
			<p class="text-2xl tracking-wider text-blue-600 dark:text-blue-400">Hello, world!</p>
			<h1 class="mt-2 text-6xl font-medium dark:text-white">I'm Sam</h1>
			<h2 class="mt-8 text-lg text-slate-600 dark:text-slate-300">Developing software as a hobby.</h2>
			<p class="text-slate-500 text-md dark:text-slate-400">I hope to build impactful and practical products.</p>
		</div>
	</div>

	<!-- Next Section Arrow-->
	<div class="mx-auto mb-1 motion-safe:animate-bounce-slow">
		<a href="#about" on:click={(event) => scrollToAnchor(event, 'about')}>
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

<!-- About Section -->
<div id="about" class="h-0" />
<div class="py-16 text-center">

	<!-- Introduction -->
	<div class="px-16 py-12 -lg:px-8 lg:-xl:px-10 text-center text-slate-600 dark:text-slate-200">
		<h2 class="text-5xl font-medium text-black dark:text-white">About Me</h2>
		<p class="mt-12">Hi! I am Sam, a student passionate about computer science, engineering, and machine learning.<br>I am always learning to reach my ambitious goal of contributing back to society through the power of technology.</p>
		<p class="mt-4">I created this site to share my experiences, to show you what I have done, and to post what I have been working on.</p>
	</div>

	<!-- Languages & Frameworks -->
	<div class="text-center text-slate-600 dark:text-slate-200 py-6">
		<div class="px-16 -lg:px-8 lg:-xl:px-10">
			<h3 class="text-blue-600 dark:text-blue-400 text-2xl font-medium">Here are some languages, frameworks, and tools I know</h3>
			<p class="mt-4">My programming journey started in grade 4. Since then, I have picked up many valuable skills.<br>This list will expand as I continue on my journey looking for opportunities.</p>
			<p class="text-sm text-slate-500 mt-6 dark:text-slate-400">* Technically not programming languages, but I am putting them in anyways.</p>
		</div>

		<div>
			<div class="mt-16 px-64 grid grid-cols-3 gap-12 xl:-2xl:px-32 xs:-xl:px-16 md:-lg:grid-cols-2 -md:grid-cols-1 2xs:-xs:px-8 -2xs:px-0 -2xs:gap-6 -2xs:divide-y-2">
			{#if !show_all_lang}
				{#each sliced_langs as lang}
					<LangCard {...lang}/>
				{/each}
			{:else}
				{#each langs as lang}
					<LangCard {...lang}/>
				{/each}
			{/if}
			</div>

			{#if !show_all_lang}
				<div class="relative">
					<div class="absolute bg-gradient-to-t from-white dark:from-slate-900 w-full h-48 z-50 -top-48" aria-hidden="true">
						
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
