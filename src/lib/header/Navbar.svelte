<script>
	import { scroll, scrollToAnchor, scrollToHome } from '$lib/utils/scroll';
	import { browser } from '$app/env';

	export let snowEnabled = true;

	function toggleTheme() {
		let theme = localStorage.theme || 'light';
		if (theme === 'light') {
			document.body.classList.add('dark');
			localStorage.theme = 'dark';
		} else {
			document.body.classList.remove('dark');
			localStorage.theme = 'light';
		}
	}

	function toggleSnow() {
		let theme = localStorage.snow || 'on';
		if (theme === 'on') {
			localStorage.snow = 'off';
			snowEnabled = false;
		} else {
			localStorage.snow = 'on';
			snowEnabled = true;
		}
	}

	if (browser) {
		let snow = localStorage.snow || 'on';
		if (snow === 'off') {
			snowEnabled = false;
		}
	}
</script>

<!-- Navbar -->
<nav
	class="sticky top-0 z-30 flex h-16 transition-shadow sm:px-16 2xs:-sm:px-8 -2xs:px-0 bg-white dark:bg-slate-900 {$scroll >
	5
		? 'shadow'
		: ''}"
>
	<!-- Navbar Brand -->
	<div class="flex my-auto text-blue-600 dark:text-blue-400 -2xs:hidden">
		<a rel="noopener" class="flex" href="/" on:click={(event) => scrollToHome(event)}>
			<svg
				class="-mt-0.5"
				xmlns="http://www.w3.org/2000/svg"
				xmlns:xlink="http://www.w3.org/1999/xlink"
				aria-hidden="true"
				role="img"
				width="32"
				height="32"
				preserveAspectRatio="xMidYMid meet"
				viewBox="0 0 20 20"
				fill="currentColor"
			>
				<path
					fill-rule="evenodd"
					d="M12.316 3.051a1 1 0 0 1 .633 1.265l-4 12a1 1 0 1 1-1.898-.632l4-12a1 1 0 0 1 1.265-.633ZM5.707 6.293a1 1 0 0 1 0 1.414L3.414 10l2.293 2.293a1 1 0 1 1-1.414 1.414l-3-3a1 1 0 0 1 0-1.414l3-3a1 1 0 0 1 1.414 0Zm8.586 0a1 1 0 0 1 1.414 0l3 3a1 1 0 0 1 0 1.414l-3 3a1 1 0 1 1-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 0 1 0-1.414Z"
					clip-rule="evenodd"
				/>
			</svg>
			<h2 class="mx-3 text-xl hover:underline -xs:hidden">Sam Liu</h2>
		</a>
	</div>

	<!-- Navbar Content -->
	<div class="flex my-auto 2xs:ml-auto -2xs:mx-auto">
		<!-- Navbar Menu -->
		<ul
			class="space-x-8 font-medium 2xs:-xs:space-x-4 -2xs:space-x-2 -2xs:text-sm text-slate-800 dark:text-slate-200"
		>
			<li class="inline">
				<a
					class="hover:text-blue-600 dark:hover:text-blue-400"
					href="/#about"
					on:click={(event) => scrollToAnchor(event, 'about')}>About</a
				>
			</li>
			<li class="inline">
				<a
					class="hover:text-blue-600 dark:hover:text-blue-400"
					href="/#projects"
					on:click={(event) => scrollToAnchor(event, 'skills')}>Skills</a
				>
			</li>
			<li class="inline">
				<a
					class="hover:text-blue-600 dark:hover:text-blue-400"
					href="/#scrapbook"
					on:click={(event) => scrollToAnchor(event, 'projects')}>Projects</a
				>
			</li>
			<li class="inline">
				<a
					class="hover:text-blue-600 dark:hover:text-blue-400"
					href="/#scrapbook"
					on:click={(event) => scrollToAnchor(event, 'scrapbook')}>Scrapbook</a
				>
			</li>
		</ul>

		<div class="ml-8 mr-6 border-l border-slate-300 dark:border-slate-500 -md:hidden" />

		<!-- Navbar Utils -->
		<div class="flex space-x-3 text-slate-500 dark:text-slate-400 -md:hidden">
			<button
				class="hover:text-slate-800 dark:hover:text-slate-200"
				title="Toggle Snow"
				on:click={toggleSnow}
			>
				{#if snowEnabled}
					<svg width="24" height="24" viewBox="0 0 24 24"
						><path
							fill="currentColor"
							d="m20.79 13.95l-2.33.62l-2-1.13v-2.88l2-1.13l2.33.62l.52-1.93l-1.77-.47l.46-1.77l-1.93-.52l-.62 2.33l-2 1.13L13 7.38V5.12l1.71-1.71L13.29 2L12 3.29L10.71 2L9.29 3.41L11 5.12v2.26L8.5 8.82l-2-1.13l-.58-2.33L4 5.88l.47 1.77l-1.77.47l.52 1.93l2.33-.62l2 1.13v2.89l-2 1.13l-2.33-.62l-.52 1.93l1.77.47L4 18.12l1.93.52l.62-2.33l2-1.13L11 16.62v2.26l-1.71 1.71L10.71 22L12 20.71L13.29 22l1.41-1.41l-1.7-1.71v-2.26l2.5-1.45l2 1.13l.62 2.33l1.88-.51l-.47-1.77l1.77-.47l-.51-1.93M9.5 10.56L12 9.11l2.5 1.45v2.88L12 14.89l-2.5-1.45v-2.88Z"
						/></svg
					>
				{:else}
					<svg width="24" height="24" viewBox="0 0 24 24"
						><path
							fill="currentColor"
							d="M11 5.12L9.29 3.41L10.71 2L12 3.29L13.29 2l1.42 1.41L13 5.12v2.26l2.45 1.44l2-1.13l.62-2.33l1.93.52l-.46 1.77l1.77.47l-.52 1.93l-2.33-.62l-2 1.13v2.7L14.5 11.3v-.74l-1.76-1.02l-2.01-2.01l.27-.15V5.12m7.46 9.45l-1.59-.9l2.68 2.68l1.75-.47l-.51-1.93l-2.33.62M13 16.62v2.26l1.7 1.71L13.29 22L12 20.71L10.71 22l-1.42-1.41L11 18.88v-2.26l-2.45-1.44l-2 1.13l-.62 2.33L4 18.12l.47-1.76l-1.77-.47l.52-1.93l2.33.62l2-1.13v-2.89l-2-1.13l-2.33.62l-.52-1.93l1.77-.47L4 5.89L1.11 3l1.28-1.27l19.72 19.73l-1.27 1.27L14.1 16l-1.1.62m-1-1.73l.63-.39l-3.13-3.11v2.05l2.5 1.45Z"
						/></svg
					>
				{/if}
			</button>
			<button
				class="hover:text-slate-800 dark:hover:text-slate-200"
				title="Toggle Themes"
				on:click={toggleTheme}
			>
				<svg
					class="dark:hidden"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					width="24px"
					height="24px"
					stroke="currentColor"
					stroke-width="2"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
					/>
				</svg>
				<svg
					class="hidden dark:block"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					width="24px"
					height="24px"
					stroke="currentColor"
					stroke-width="2"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
					/>
				</svg>
			</button>
			<a
				class="hover:text-slate-800 mt-0.5 dark:hover:text-slate-200"
				href="https://github.com/SamDev-7/"
				target="_blank"
				title="GitHub"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					width="20px"
					height="20px"
					fill="currentColor"
					aria-hidden="true"
				>
					<path
						d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
					/>
				</svg>
			</a>
		</div>
	</div>
</nav>

<div class="h-0 -mt-16" />
