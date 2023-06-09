<script lang="ts">
	import { goto } from '$app/navigation';
	import { clickOutside } from '$lib/click-outside';
	import { scroll, scrollToAnchor } from '$lib/scroll';

	let expanded = false;

	function goHome(event: MouseEvent) {
		if (window.location.pathname == '/') {
			scrollToAnchor(event, 'landing');
			shrinkNav();
		} else {
			window.location.pathname = '/';
		}
	}

	function toAnchorInHome(event: MouseEvent, anchor: string) {
		if (window.location.pathname == '/') {
			scrollToAnchor(event, anchor);
		} else {
			goto('/#' + anchor);
		}
	}

	function toggleNav() {
		expanded = !expanded;
	}

	function shrinkNav() {
		expanded = false;
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
	class="fixed top-0 right-0 left-0 z-30 motion-safe:transition-shadow bg-white {expanded
		? 'pt-4'
		: 'py-4'} nojs:shadow flex flex-col space-y-4 {$scroll > 10 || expanded ? 'shadow' : ''}"
	use:clickOutside
	on:outclick={shrinkNav}
>
	<div class="flex w-full pl-10 md:px-10 lg:px-16 2xl:px-28">
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
		<div class="flex-row my-auto ml-auto space-x-6 hidden md:flex">
			<div class="space-x-5 font-medium text-slate-900">
				<a
					href="/#about"
					class="hover:text-blue-600"
					on:click={(event) => toAnchorInHome(event, 'about')}>About</a
				><a
					href="/#projects"
					class="hover:text-blue-600"
					on:click={(event) => toAnchorInHome(event, 'projects')}>Projects</a
				>
				<a
					href="/#skills"
					class="hover:text-blue-600"
					on:click={(event) => toAnchorInHome(event, 'skills')}>Skills</a
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
			<div class="border-[1.5px] border-slate-400 rounded-full" aria-hidden="true" />
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
		<button on:click={toggleNav} class="mx-4">
			<div class="md:hidden flex">
				<div class="my-auto mx-auto">
					<div class="space-y-2 {expanded ? 'hidden' : ''}">
						<div class="border-[1.5px] rounded-full border-slate-500 bg-slate-500 h-0.5 w-7" />
						<div class="border-[1.5px] rounded-full border-slate-500 bg-slate-500 h-0.5 w-7" />
						<div class="border-[1.5px] rounded-full border-slate-500 bg-slate-500 h-0.5 w-7" />
					</div>
					<div class={expanded ? '' : 'hidden'}>
						<div
							class="border-[1.5px] rounded-full border-slate-500 bg-slate-500 h-0.5 w-8 rotate-45"
						/>
						<div
							class="border-[1.5px] rounded-full border-slate-500 bg-slate-500 h-0.5 w-8 -rotate-45 -translate-y-[2.75px]"
						/>
					</div>
				</div>
			</div>
		</button>
	</div>

	<div class="md:hidden {expanded ? '' : 'hidden'}">
		<div class="font-medium text-slate-900 flex flex-col divide-y-2 divide-slate-100">
			<a
				href="/#about"
				class="hover:text-blue-600 px-10 py-2"
				on:click={(event) => {
					toAnchorInHome(event, 'about');
					shrinkNav();
				}}>About</a
			><a
				href="/#projects"
				class="hover:text-blue-600 px-10 flex py-2"
				on:click={(event) => {
					toAnchorInHome(event, 'projects');
					shrinkNav();
				}}><p class="my-auto">Projects</p></a
			>
			<a
				href="/#skills"
				class="hover:text-blue-600 px-10 py-2"
				on:click={(event) => {
					toAnchorInHome(event, 'skills');
					shrinkNav();
				}}>Skills</a
			>

			<a
				href="/#scrapbook"
				class="hover:text-blue-600 px-10 py-2"
				on:click={(event) => {
					toAnchorInHome(event, 'scrapbook');
					shrinkNav();
				}}>Scrapbook</a
			>
			<a
				href="/#contact"
				class="hover:text-blue-600 px-10 py-2"
				on:click={(event) => {
					toAnchorInHome(event, 'contact');
					shrinkNav();
				}}>Contact</a
			>
		</div>
	</div>
</nav>
