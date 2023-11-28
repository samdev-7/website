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

<div id="about" class="scroll-m-16 flex justify-center items-center">
	<div
		class="grid max-w-[1536px] py-16 sm:mx-10 lg:mx-20 xl:grid-cols-5 lg:grid-cols-2 mx-0 -lg:space-y-12 gap-x-12"
	>
		<!-- About Text -->
		<div class="space-y-12 xl:col-span-3 mx-6 sm:mr-12 xl:mr-24 2xl:mr-48">
			<div>
				<h4
					class="text-5xl font-medium tracking-wide text-center text-blue-600 -2xs:text-4xl lg:text-6xl"
				>
					About
				</h4>
			</div>
			<div class="space-y-[1em] text-justify tracking-wide leading-relaxed indent-10 text-lg">
				<p>
					Hey there! I'm Sam, a high-schooler, self-taught developer, and maker of things. I'm
					always learning, building, and sharing my journeys and products, hoping to create an
					impact on this world, no matter the size.
				</p>
				<p>
					I started to code in elementary school. Looking back, I have conducted many projects
					ranging from tile-based games to Arduino robotic arms to hosting in-person events and
					workshops. I am proud of my work, but a ton still lies ahead in my journey. I always seek
					new learning opportunities and challenges to push my comfort zone.
				</p>
				<p>
					The web is an amazing space full of knowledge and creativity. This website was built by
					hand, and is open source as usual. Making a website is not only a great learning
					experience, but allows me to share what I do and love with the world. Welcome to my space
					on the interwebs!
				</p>
			</div>
		</div>

		<!-- Stats -->
		<div
			class="flex items-center justify-center xl:col-span-2 border-t-2 border-b-2 sm:border-none"
		>
			<div class="space-y-8 p-4 py-8 sm:border-2 border-slate-300 xl:p-12 sm:p-8 sm:rounded-xl">
				<div class="flex flex-col items-center mx-auto space-y-2">
					<div class="flex flex-row items-center mx-auto space-x-4">
						<span class="relative flex w-4 h-4">
							<span
								class="absolute inline-flex w-full h-full bg-green-500 rounded-full opacity-75 motion-safe:animate-ping"
							/>
							<span class="relative inline-flex w-4 h-4 bg-green-500 rounded-full" />
						</span>
						<p class="text-2xl font-medium text-center -2xs:text-base lg:text-3xl">
							Live Statistics
						</p>
					</div>
					<p class="text-sm text-center text-slate-600 nojs:hidden">
						Refreshes every minute.<br />Hover over a field for more detail.
					</p>
					<noscript>
						<p class="text-sm text-center text-slate-600">Enable JavaScript for live updates</p>
					</noscript>
				</div>
				<div>
					<div class="flex flex-col mx-6 space-y-3">
						<div>
							<div class="flex flex-row text-lg -2xs:text-base">
								<p
									class="mr-auto"
									title="Includes private repositories that I have created and contributed to."
								>
									GitHub repository count:
								</p>
								<p class="font-medium text-blue-600">
									{stats ? stats.total_repos : 'Loading'}
								</p>
							</div>
							<div class="mx-10 text-sm italic text-slate-700 -2xs:hidden">
								<p class="lg:truncate" title="Please star it. 🥺">
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
								<p
									class="mr-auto"
									title="An addition is adding or modifying one line of code. Some additions are not included due to history limitations in the GitHub API."
								>
									Approximate GitHub additions:
								</p>
								<p class="font-medium text-blue-600">{stats ? stats.total_additions : 'Loading'}</p>
							</div>
							<div class="mx-10 text-sm italic text-slate-700 -2xs:hidden">
								<p
									class="lg:truncate"
									title="Only includes commits on the default branch due to GitHub API limitations."
								>
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
								<p class="mr-auto" title="Includes private messages. 👀">
									<span
										><a href="https://hackclub.com/slack" target="_blank" rel="noopener noreferrer"
											>Hack Club</a
										></span
									> messages sent:
								</p>
								<p class="font-medium text-blue-600">{stats ? stats.total_messages : 'Loading'}</p>
							</div>
							<div class="mx-10 text-sm italic text-slate-700 -2xs:hidden">
								<p class="lg:truncate" title="Wow I'm so active!">
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
								<p
									class="mr-auto"
									title="Unique website visits in the past year, calculated by Cloudflare based off requests. I do not use trackers on this website."
								>
									Yearly unique website visits:
								</p>
								<p class="font-medium text-blue-600">
									{stats ? stats.total_unique_visitors : 'Loading'}
								</p>
							</div>
							<div class="mx-10 text-sm italic text-slate-700 -2xs:hidden">
								<p
									class="lg:truncate"
									title="A unique visit can have multiple requests. Cloudflare's API does not provide unique visit counts per country."
								>
									Most requests are from <span
										>{stats ? stats.most_visitor_location : 'Loading'}</span
									>.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
