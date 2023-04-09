<script lang="ts">
	import { scroll, scrollToAnchor } from '$lib/scroll';

	function goHome(event: MouseEvent) {
		if (window.location.pathname == '/') {
			scrollToAnchor(event, 'landing');
		} else {
			window.location.pathname = '/';
		}
	}

	function toAnchorInHome(event: MouseEvent, anchor: string) {
		if (window.location.pathname == '/') {
			scrollToAnchor(event, anchor);
		} else {
			window.location.pathname = '/' + anchor;
		}
	}
</script>

<noscript>
	<style>
		.nojs\:shadow {
			--tw-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
			--tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color);
			box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000),
				var(--tw-shadow);
		}
	</style>
</noscript>

<nav
	class="sticky top-0 z-30 flex w-full h-16 px-16 bg-white motion-safe:transition-shadow nojs:shadow {$scroll >
	10
		? 'shadow'
		: ''}"
>
	<div class="my-auto mr-auto">
		<a href="/" aria-label="Home" on:click={goHome}>
			<div class="space-x-3 text-blue-600 group">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					xmlns:xlink="http://www.w3.org/1999/xlink"
					role="img"
					aria-label="Logo Icon"
					width="32px"
					height="32px"
					preserveAspectRatio="xMidYMid meet"
					viewBox="0 0 20 20"
					class="inline -mt-1"
					><path
						fill="currentColor"
						fill-rule="evenodd"
						d="M12.316 3.051a1 1 0 0 1 .633 1.265l-4 12a1 1 0 1 1-1.898-.632l4-12a1 1 0 0 1 1.265-.633ZM5.707 6.293a1 1 0 0 1 0 1.414L3.414 10l2.293 2.293a1 1 0 1 1-1.414 1.414l-3-3a1 1 0 0 1 0-1.414l3-3a1 1 0 0 1 1.414 0Zm8.586 0a1 1 0 0 1 1.414 0l3 3a1 1 0 0 1 0 1.414l-3 3a1 1 0 1 1-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 0 1 0-1.414Z"
						clip-rule="evenodd"
					/></svg
				>
				<p class="inline text-xl font-medium group-hover:underline">Sam Liu</p>
			</div>
		</a>
	</div>
	<div class="flex flex-row my-auto ml-auto space-x-6">
		<div class="space-x-6 font-medium text-slate-900">
			<a
				href="/#about"
				class="hover:text-blue-600"
				on:click={(event) => toAnchorInHome(event, 'about')}>About</a
			>
			<a
				href="/#skills"
				class="hover:text-blue-600"
				on:click={(event) => toAnchorInHome(event, 'skills')}>Skills</a
			>
			<a
				href="/#projects"
				class="hover:text-blue-600"
				on:click={(event) => toAnchorInHome(event, 'projects')}>Projects</a
			>
			<a
				href="/#scrapbook"
				class="hover:text-blue-600"
				on:click={(event) => toAnchorInHome(event, 'scrapbook')}>Scrapbook</a
			>
			<a
				href="/#contact"
				class="hover:text-blue-600"
				on:click={(event) => toAnchorInHome(event, 'contact')}>Contact</a
			>
		</div>
		<div class="border-[1.5px] border-slate-400" aria-hidden="true" />
		<div class="flex flex-row my-auto space-x-4 text-slate-500">
			<a
				href="https://github.com/SamDev-7/"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="Go to my GitHub account"
				title="My GitHub Account"
				class="hover:text-black"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					width="20px"
					height="20px"
					fill="currentColor"
					aria-label="GitHub Icon"
				>
					<path
						d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
					/>
				</svg>
			</a>
		</div>
	</div>
</nav>
<div class="h-0 -mb-16" aria-hidden="true" />
