<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';

	import Navbar from '../components/Navbar.svelte';
	import Landing from '../components/index/Landing.svelte';
	import About from '../components/index/About.svelte';
	import Projects from '../components/index/Projects.svelte';

	export let data: PageData;

	let stats = data.stats;

	onMount(() => {
		if (location.hostname == 'v2.samliu.dev') {
			alert(
				'This site is still under development! Everything You see is a work in progress and is subject to change.'
			);
		}
	});
</script>

<svelte:head>
	<title>Sam Liu</title>
</svelte:head>

<Navbar />

<Landing />
<div class="w-full flex flex-col">
	<div class="mx-auto max-w-[120rem] space-y-8">
		<About {stats} />
		<Projects />
	</div>
</div>
