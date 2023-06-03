<script lang="ts">
	import type { statsType } from '../../routes/api/stats/+server';
	import moment from 'moment';
	import { onMount } from 'svelte';
	import { refreshStats } from '$lib/stats-refresher';

	export let stats: statsType;

	onMount(() => {
		setInterval(async () => {
			stats = await refreshStats();
		}, 60000);
	});
</script>

<div id="about" class="scroll-m-16">
	<div class="grid py-16 sm:mx-10 lg:mx-20 xl:grid-cols-5 lg:grid-cols-2 mx-0 -lg:space-y-12">
		<!-- About Text -->
		<div class="space-y-12 xl:col-span-3 mx-6 sm:mr-12 xl:mr-24 3xl:mr-48">
			<div>
				<h4 class="text-5xl font-medium tracking-wide text-center text-blue-600 -2xs:text-4xl">
					About me
				</h4>
			</div>
			<div class="space-y-[1em] text-justify tracking-wide leading-relaxed indent-10 text-lg">
				<p>
					👋 Hey there! I am a student with a passion for programming, learning, and creating. My
					coding journey began in grade 4, with Scratch. Since then, I have acquired many new skills
					and opportunities. Now, I have various projects ranging from tile-based games, to robotic
					arms, and to hosting in-person events. I always seek new learning opportunities and
					challenges to push my comfort zone.
				</p>
				<p>
					The web offers great opportunities for me to learn, create, and share what I love. This
					website was built from scratch using SvelteKit and libaries, not website generators or
					builders and is open source. Making a website has been a great learning experience. Thanks
					for stopping by! Continue scrolling to see more of what I do.
				</p>
			</div>
		</div>

		<!-- Stats -->
		<div
			class="flex flex-col justify-center p-4 py-8 space-y-6 sm:border-2 border-t-2 border-b-2 xl:col-span-2 border-slate-300 sm:p-8 sm:rounded-xl"
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
								{stats ? stats.total_repos : 'Loading'}
							</p>
						</div>
						<div class="mx-10 text-sm italic text-slate-700 -2xs:hidden">
							<p class="lg:truncate">
								Repository <span class="underline hover:text-blue-600"
									><a
										href={stats ? stats.most_stars_link : undefined}
										target="_blank"
										rel="noopener noreferrer">{stats ? stats.most_stars_name : 'Loading'}</a
									></span
								> has the most stars.
							</p>
						</div>
					</div>
					<div>
						<div class="flex flex-row text-lg -2xs:text-base">
							<p class="mr-auto">Total GitHub commits:</p>
							<p class="font-medium text-blue-600">{stats ? stats.total_commits : 'Loading'}</p>
						</div>
						<div class="mx-10 text-sm italic text-slate-700 -2xs:hidden">
							<p class="lg:truncate">
								Latest commit: <span class="underline hover:text-blue-600"
									><a
										href={stats ? stats.latest_commit_link : undefined}
										target="_blank"
										rel="noopener noreferrer">{stats ? stats.latest_commit_message : 'Loading'}</a
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
							<p class="font-medium text-blue-600">{stats ? stats.total_messages : 'Loading'}</p>
						</div>
						<div class="mx-10 text-sm italic text-slate-700 -2xs:hidden">
							<p class="lg:truncate">
								Latest message was sent <span class="underline hover:text-blue-600">
									<a
										href={stats ? stats.latest_message_link : undefined}
										target="_blank"
										rel="noopener noreferrer"
										>{stats ? moment(stats.latest_message_time).fromNow() : 'Loading'}</a
									></span
								>.
							</p>
						</div>
					</div>
					<div>
						<div class="flex flex-row text-lg -2xs:text-base">
							<p class="mr-auto">Unique website visits (past year):</p>
							<p class="font-medium text-blue-600">
								{stats ? stats.total_unique_visitors : 'Loading'}
							</p>
						</div>
						<div class="mx-10 text-sm italic text-slate-700 -2xs:hidden">
							<p class="lg:truncate">
								Most requests are from <span>{stats ? stats.most_visitor_location : 'Loading'}</span
								>.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
