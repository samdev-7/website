<script>
	import { scrollToAnchor } from '$lib/scroll';
</script>

<svelte:head>
	<title>Sam Liu</title>
	<meta name="description" content="Hello! This is my personal website." />
</svelte:head>

<!-- Main Title -->
<div class="flex flex-col h-screen">
	<div class="m-auto text-center">
		<div class="mx-16 -xs:mx-8">
			<p class="text-2xl tracking-wider text-blue-600 dark:text-blue-400">Hello There</p>
			<h1 class="mt-2 text-6xl font-medium dark:text-white">I'm Sam</h1>
			<h2 class="mt-8 text-lg text-slate-600 dark:text-slate-300">
				I make random things and hope they work first try.
			</h2>
			<p class="text-slate-500 text-md dark:text-slate-400">They don't 95% of the time...</p>
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
<a id="about" class="h-0"> </a>

<div class="py-16">
	<p class="text-lg text-center">I'm upgrading this site!</p>
	<p class="text-center">It'll be back soon™️</p>
</div>
