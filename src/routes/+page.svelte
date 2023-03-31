<script lang="ts">
	import { greetings } from '../lib/random-greeting';
	import Typewriter from 'svelte-typewriter';
</script>

<div class="w-screen h-screen flex">
	<div class="m-auto text-center">
		<div class="space-y-4">
			<div class="space-y-4">
				<div style="--cursor-color: #2563eb; --cursor-width: 0.20ch" class="text-blue-600 text-2xl tracking-wider font-mono min-h-[1.5em]">
					<Typewriter mode="loopRandom" interval={75} unwriteInterval={20} wordInterval={5000}>
						{#each greetings as greeting}
							<h2>{greeting}</h2>
						{/each}
					</Typewriter>
				</div>
				<div class="text-7xl font-medium">
					<h1>I'm Sam</h1>
				</div>
			</div>
		</div>
	</div>
</div>
