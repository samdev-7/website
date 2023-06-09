<script lang="ts">
	import { scrollToAnchor } from '$lib/scroll';
</script>

<div id="projects" class="scroll-m-16 flex justify-center">
	<div class="sm:mx-10 lg:mx-20 mx-0 max-w-7xl space-y-16 py-16">
		<!-- Section -->
		<div class="text-center space-y-6 mx-4">
			<h4 class="text-5xl font-medium tracking-wide text-center text-blue-600 -2xs:text-4xl">
				Projects
			</h4>
			<div class="space-y-2">
				<p class="text-lg text-slate-800">
					These are things that I am working on, contributing to, or stuff that I have done in the
					past.
				</p>
				<p class="text-slate-700">
					Interested in something you see? Questions?
					<a
						href="#contact"
						on:click={(event) => scrollToAnchor(event, 'contact')}
						class="underline hover:text-blue-600"
					>
						Let's connect</a
					>!
				</p>
			</div>
		</div>

		<!-- Project List-->
		<div class="grid grid-cols-1 sm:space-y-16">
			<!-- AngelHacks Toronto-->
			<div
				class="relative w-full grid xl:grid-cols-2 bg-[#8EDDFD] p-6 py-10 lg:p-12 sm:rounded-xl gap-x-12 bg-bottom bg-no-repeat"
				style="background-image: url(/projects/angelhacks-toronto/clouds.svg);"
			>
				<div class="flex flex-col z-10">
					<div class="space-y-8">
						<!-- Branding -->
						<div class="flex flex-row space-x-6">
							<!-- Icon -->
							<div>
								<svg
									width="75"
									height="75"
									viewBox="0 0 125 106"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
									class=""
								>
									<path
										fill-rule="evenodd"
										clip-rule="evenodd"
										d="M88.0468 18.6666C87.395 18.8221 86.7035 18.9732 85.9746 19.1195C78.0173 20.7164 65.5969 21.7436 51.641 21.7436C37.6851 21.7436 25.2647 20.7164 17.3075 19.1195C16.5785 18.9732 15.8871 18.8221 15.2353 18.6666C10.7576 17.5984 8.15385 16.3211 8.15385 14.9487C8.15385 13.5764 10.7576 12.2991 15.2353 11.2308C15.8871 11.0753 16.5785 10.9242 17.3075 10.7779C25.2647 9.18103 37.6851 8.15385 51.641 8.15385C65.5969 8.15385 78.0173 9.18103 85.9746 10.7779C86.7035 10.9242 87.395 11.0753 88.0468 11.2308C92.5245 12.2991 95.1282 13.5764 95.1282 14.9487C95.1282 16.3211 92.5245 17.5984 88.0468 18.6666ZM83.6499 27.8095C75.249 29.1221 63.9364 29.8974 51.641 29.8974C39.3456 29.8974 28.033 29.1221 19.6322 27.8095C15.4958 27.1632 11.6941 26.3314 8.74575 25.2422C7.31807 24.7148 5.60021 23.9527 4.08892 22.7987C2.74819 21.775 0 19.2078 0 14.9487C0 10.6896 2.74819 8.12246 4.08892 7.09871C5.60021 5.94473 7.31807 5.18263 8.74575 4.65521C11.6941 3.56604 15.4958 2.73423 19.6322 2.08792C28.033 0.775288 39.3456 0 51.641 0C63.9364 0 75.249 0.775288 83.6499 2.08792C87.7863 2.73423 91.5879 3.56604 94.5363 4.65521C95.964 5.18263 97.6818 5.94473 99.1931 7.09871C100.534 8.12246 103.282 10.6896 103.282 14.9487C103.282 19.2078 100.534 21.775 99.1931 22.7987C97.6818 23.9527 95.964 24.7148 94.5363 25.2422C91.5879 26.3314 87.7863 27.1632 83.6499 27.8095Z"
										fill="#FFB400"
									/>
									<path
										d="M21.4786 62.5112C9.59205 62.3693 0 52.6894 0 40.7692H72.7051C90.7181 40.7692 105.321 55.3716 105.321 73.3846C105.321 84.5948 99.6649 94.4841 91.0513 100.355V106H69.9872C58.2059 106 48.613 96.6301 48.254 84.9359H48.2436C34.8548 84.9359 23.7272 75.255 21.4786 62.5112Z"
										fill="#004F58"
									/>
									<path
										d="M19.0256 40.7692C19.0256 52.6894 28.6177 62.3693 40.5042 62.5112C42.7528 75.255 53.8805 84.9359 67.2692 84.9359C67.2727 84.9359 67.2762 84.9359 67.2796 84.9359C67.6386 96.6301 77.2315 106 89.0128 106H91.7308C109.744 106 124.346 91.3976 124.346 73.3846C124.346 55.3716 109.744 40.7692 91.7308 40.7692H19.0256Z"
										fill="#009AAB"
									/>
								</svg>
							</div>
							<!-- Project headings -->
							<div class="space-y-1">
								<p class="text-4xl font-medium tracking-wide">AngelHacks Toronto</p>
								<p class="text-xl text-slate-800">Organizer</p>
							</div>
						</div>
						<!-- Description -->
						<div>
							<p class="text-lg">
								On May 27, 2023, 50 teenagers across Eastern Canada gathered in downtown Toronto for
								a coding event for students, by students. AngelHacks Toronto was a 12 hour
								hackathon/game-jam running alongside 2 other AngelHacks events with over 200
								participants across North America. All organization for AngelHacks Toronto was done
								by a student team of 4, which I was a major contributor of. This event was presented
								by Hack Club, a global network of high school programmers and clubs.
							</p>
						</div>
					</div>

					<!-- Links -->
					<div
						class="text-lg font-medium mt-auto pt-10 w-full grid grid-flow-col text-center gap-x-8"
					>
						<a
							href="https://angelhacksto.hackclub.com/"
							target="_blank"
							class="bg-[#FDB32B] py-4 rounded-xl hover:scale-105 motion-safe:transition-transform"
							>Visit Website</a
						>
						<a
							href="https://bank.hackclub.com/angelhacks-toronto"
							target="_blank"
							class="bg-[#FDB32B] py-4 rounded-xl hover:scale-105 motion-safe:transition-transform"
							>See Finances</a
						>
					</div>
				</div>

				<!-- Media -->
				<div class="grid-cols-2 hidden xl:grid">
					<img
						height="225"
						width="300"
						src="/projects/angelhacks-toronto/1.webp"
						alt="Participants coding in the the main room."
						class="rounded-xl ml-8 overflow-hidden -rotate-1"
						loading="lazy"
					/>
					<div />
					<div />
					<img
						height="225"
						width="300"
						src="/projects/angelhacks-toronto/2.webp"
						alt="A whiteboard showing brainstorming and planning for a game."
						class="-mt-20 -ml-8 rounded-xl overflow-hidden rotate-1"
						loading="lazy"
					/>
					<img
						height="225"
						width="300"
						src="/projects/angelhacks-toronto/3.webp"
						alt="All participants at the end of the event."
						class="-mt-20 ml-8 rounded-xl overflow-hidden rotate-1"
						loading="lazy"
					/>
				</div>
			</div>

			<!-- Sprig -->
			<div
				class="w-full grid xl:grid-cols-2 bg-[#1A3C14] p-6 py-10 lg:p-12 sm:rounded-xl gap-x-12 text-white bg-cover"
				style="background-image: url(/projects/sprig/pcb.svg);"
			>
				<div class="flex flex-col">
					<div class="space-y-8">
						<!-- Branding -->
						<div class="flex flex-row space-x-6">
							<!-- Icon -->
							<div>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="75"
									height="75"
									viewBox="0 0 66.39 97.06"
								>
									<defs
										><style>
											.cls-1 {
												fill: #fff;
											}
											.cls-2 {
												fill: #add366;
											}
										</style>
									</defs>
									<g id="Layer_2"
										><path
											class="cls-2"
											d="M7.14,10.41c3.74-6.71,11.96-7.78,13.19-7.94,2.07-.27,3.72-.11,4.77,0,3.24,.34,6.66,.7,8.58,3.34,1.2,1.65,1.26,3.44,1.27,3.97,.01,.63-.02,3.01-2.54,6.04-1.48,1.77-2.73,2.47-12.07,6.99-6.19,2.99-6.89,3.29-8.26,4.45-2.04,1.73-2.91,3.12-3.97,2.86-1.76-.43-2.06-4.96-2.22-7.47-.39-5.91-.58-8.91,1.27-12.23Z"
										/></g
									><g id="Layer_3"
										><path
											class="cls-1"
											d="M22.07,97.06H61.4s3.78-16.82,3.78-20.23,.13-24.23-1.47-26.91-1.93-16.56-15.98-19.74c-14.05-3.18-22.82-2.11-28.48,1.72-5.66,3.83-14.03,16.01-13.62,16.95s-.01,7.12-.01,7.12L.78,62.68l3.53,8.36s9.97,4.87,11.92,4.44,13.49,1.98,13.49,1.98l-3.43,11.93-4.23,7.67Z"
										/></g
									><g id="Layer_1"
										><ellipse class="cls-1" cx="12.93" cy="51.57" rx="6.31" ry="5.6" /><ellipse
											class="cls-1"
											cx="40.08"
											cy="53.38"
											rx="9.5"
											ry="6.31"
										/><path
											d="M33.77,77.01c-2.32,.67-2.9,1.16-3.88,5.44-.71,3.14-1.82,6.58-3.49,9.65-.85,1.56-2.05,3.04-2.13,4.96h-4c2.26-4.91,5.02-9.6,6.38-14.92,.97-3.81,.97-4.12-2.79-4.05-5.15,.09-10.13-.58-15.13-1.95C-.38,73.65-2.38,61.49,2.83,56.08c1.15-1.2,1.4-2.46,1.49-4.02,.45-7.8,3.37-14.6,9.72-19.23,4.81-3.5,10.53-5.33,16.56-5.77,.66-.05,1.33,0,2,0,4.14-.11,4.69-.55,5.69-4.63,.71-2.9,1.84-5.62,3.35-8.2,.55-.94,2.63-1.64,.61-3.06-2.39-1.68-4.05-1.47-5.25,.78-1.25,2.35-2.59,4.55-4.51,6.47-2.17,2.17-4.63,3.67-7.5,4.64-4.86,1.63-9.57,3.43-13.46,7.07-2.54,2.38-7.07,.67-7.14-2.68-.12-5.62,.02-9.19,1.42-13.5C8.2,6.62,15.71,.25,23.83,0c3.03-.09,5.49,.69,9.54,1.98,6.76,2.15,8.81,3.77,12.23,4.94,1.26,.43,2.51,.88,3.62,1.55,1.16,.7,1.42,1.82,.34,2.92-.46,.48-.95,.93-1.47,1.35-3.5,2.8-4.17,6.58-3.81,10.76,.22,2.51,1.01,4.29,3.85,4.91,4.87,1.06,8.61,4.02,11.86,7.7,4.11,4.65,6.07,10.15,6.26,16.24,.18,5.83,.18,11.11,.09,17.5-.12,9.38-.98,18.39-4.05,27.2h-3c-.42-2.09,.8-3.84,1.29-5.72,1.46-5.57,2.9-11.09,2.75-16.95-.18-6.65,.12-13.31-.09-19.96-.18-5.85-1.81-11.34-5.36-16.11-4.21-5.65-10.58-7.31-16.92-8.11-8.48-1.07-16.73,.32-24.34,4.77-3.56,2.08-5.39,5.23-7,8.7-.37,.81,.09,1.26,.87,1.31,1.33,.07,2.67-.04,3.99,.09,3.95,.4,5.82,2.54,5.82,6.51,0,3.94-1.92,6.11-5.88,6.43-1.81,.14-4.42,.5-6.05-.31-1.06-.53-.87-1.78-2.33-.77-1.17,.81-1.67,2.06-2.17,3.26-2.16,5.19,.08,10.95,5.27,12.63,7.96,2.58,16.12,3.03,24.4,1.55,6.01-1.07,11.03-4.36,16.07-8.16,.44-.33,2.37,1.31,2.25,2.21-.26,2.02,.1-.43,0,0-.48,2.08-3.96,3.25-6,4.07M10.29,27.59c3.65-3.47,8.1-5.51,12.82-6.99,.95-.3,1.83-.71,2.76-1,4.4-1.36,6.51-4.84,8.08-8.73,1.05-2.59,.2-4.03-2.34-5.63C20.91-1.49,10.43,6.89,7.91,13.77c-1.89,5.15-2.86,14.67,.35,13.81,.67,1.14,1.35,1.14,2.02,0Zm7.95,22.98c0,.79,.02,.46,0,.13-.04-.73-.43-1.25-1.04-1.59-.41-.23-.42-.2-.92,1.56-1.18,4.2-4.61,5.27-7.83,2.44-.32-.28,0-1.5-1-.72-.18,.14-.19,.66-.1,.95,.76,2.52,3.15,3.67,6.43,3.14,3.21-.52,4.58-1.98,4.46-5.91Z"
										/><path
											d="M39.86,59.65c-1.16,0-2.32,.1-3.47-.02-3.92-.41-5.81-2.64-5.81-6.73,0-4.13,1.85-6.44,5.75-6.78,2.46-.21,4.97-.2,7.43,0,3.92,.32,5.81,2.62,5.82,6.72,0,4.13-1.86,6.38-5.75,6.79-1.31,.14-2.64,.02-3.96,.02Zm-.07-1.97c1.47-.14,3-.04,4.39-.46,3.14-.95,4.15-3.09,3.19-6.32-.13-.43-.56-.96-.96-1.08-1.15-.37-.77,.77-.79,1.19-.13,2.64-1.41,4.3-3.89,4.39-2.85,.11-6.07,1-7.94-2.5-.36-.67,.1-1.72-.9-2.08-.1,.84-.23,1.68-.3,2.53-.13,1.59,.7,2.41,1.96,3.21,1.68,1.07,3.43,.99,5.23,1.11Z"
										/><path
											d="M6.18,28.34c-.1,.65,.75-5.49,3.4-8.09,1.72-1.69,3.56-3.31,5.24-5.06,2.23-2.32,5.17-4.09,5.55-7.8,.16-1.51,1.82-1.95,3.36-1.77,1.36,.16,2.26,.91,2.5,2.26,.26,1.46-.1,2.76-1.58,3.41-6.47,2.85-11.48,6.54-14.76,11.86-1.43,2.32-1.6,3.3-1.55,5.2-.72,1.18-1.43,1.18-2.15,0Z"
										/><circle class="cls-2" cx="23.32" cy="8.37" r="1.25" /></g
									></svg
								>
							</div>
							<!-- Project headings -->
							<div class="space-y-1">
								<p class="text-4xl font-medium tracking-wide">Sprig</p>
								<p class="text-xl text-slate-200">Contributor, Workshops, Reviewer</p>
							</div>
						</div>
						<!-- Description -->
						<div>
							<p class="text-lg">
								Sprig is a tool developed by Hack Club for anyone to create tile-based games with
								JavaScript. It's designed to be easy to use and learn so people can quickly get
								started. High/middle school students who submit a game to the gallary can get a free
								console to run their games! I have been involved with Sprig early after release. I
								have contributed to the codebase and currently is a reviewer for game submissions to
								the gallary. I have written and hosted workshops relating to Sprig to spread my
								knowledge.
							</p>
						</div>
					</div>

					<!-- Links -->
					<div
						class="text-lg font-medium mt-auto pt-10 w-full grid grid-flow-col text-center gap-x-8"
					>
						<a
							href="https://sprig.hackclub.com/"
							target="_blank"
							class="bg-[#427A43] py-4 rounded-xl hover:scale-105 motion-safe:transition-transform"
							>Visit Website</a
						>
						<a
							href="https://workshops.hackclub.com/#sprig"
							target="_blank"
							class="bg-[#427A43] py-4 rounded-xl hover:scale-105 motion-safe:transition-transform"
							>View Workshops</a
						>
					</div>
				</div>

				<!-- Media -->
				<div class="grid-cols-2 hidden xl:grid">
					<img
						height="225"
						width="300"
						src="/projects/sprig/1.webp"
						alt="Participants coding in the the main room."
						class="rounded-xl ml-8 overflow-hidden -rotate-1"
						loading="lazy"
					/>
					<div />
					<div />
					<img
						height="225"
						width="300"
						src="/projects/sprig/2.webp"
						alt="A whiteboard showing brainstorming and planning for a game."
						class="-mt-20 -ml-8 rounded-xl overflow-hidden rotate-1"
						loading="lazy"
					/>
					<img
						height="225"
						width="300"
						src="/projects/sprig/3.webp"
						alt="All participants at the end of the event."
						class="-mt-20 ml-8 rounded-xl overflow-hidden rotate-1"
						loading="lazy"
					/>
				</div>
			</div>
		</div>

		<div class="text-center">
			<p>This section is not complete yet. Check back later!</p>
			<a class="text-slate-800 underline hover:text-blue-600" href="/projects"
				>Go to the work in progress projects page.</a
			>
		</div>
	</div>
</div>
