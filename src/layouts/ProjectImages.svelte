<script lang="ts">
  import { onMount } from "svelte";

  let className = "";
  export { className as class };

  let container: HTMLDivElement;
  let scroll = 0;
  let clientWidth = 800;
  export let numCards = 1;

  let totalWidth = clientWidth * numCards;
  $: totalWidth = clientWidth * numCards;

  let currentCard = 0;
  $: currentCard = Math.round(scroll / clientWidth);

  let timeout: NodeJS.Timeout;

  function startAutoPlay() {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setInterval(() => {
      scrollNext();
    }, 5000);
  }

  onMount(() => {
    let reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (!reduceMotion) startAutoPlay();
  });

  function onScroll(
    e: UIEvent & {
      currentTarget: EventTarget & HTMLDivElement;
    }
  ) {
    scroll = e.currentTarget.scrollLeft;
  }

  function scrollTo(card: number) {
    if (!container) return;
    let reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) {
      container.scrollLeft = card * clientWidth;
      return;
    }
    container.scrollTo({
      left: card * clientWidth,
      behavior: "smooth",
    });
  }

  function clickTo(card: number) {
    scrollTo(card);
    startAutoPlay();
  }

  function scrollNext() {
    if (currentCard === numCards - 1) {
      scrollTo(0);
      return;
    }
    scrollTo(currentCard + 1);
  }

  function clickNext() {
    scrollNext();
    startAutoPlay();
  }

  function scrollPrev() {
    if (currentCard === 0) {
      scrollTo(numCards - 1);
      return;
    }
    scrollTo(currentCard - 1);
  }

  function clickPrev() {
    scrollPrev();
    startAutoPlay();
  }
</script>

<div class="relative overflow-hidden rounded-md {className}">
  <div
    class="embla overflow-x-scroll no-scrollbar overflow-y-hidden flex aspect-video bg-gray-100 items-center snap-x snap-mandatory"
    on:scroll={onScroll}
    bind:clientWidth
    bind:this={container}
  >
    <slot />
  </div>
  <button
    class="absolute group left-0 top-0 bottom-0 flex items-center w-[30%]"
    on:click={clickPrev}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="2"
      stroke="currentColor"
      class="size-6 sm:size-8 ml-1 sm:ml-4 text-white sm:text-transparent group-hover:text-white z-10 motion-safe:transition-colors motion-safe:duration-100"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M15.75 19.5 8.25 12l7.5-7.5"
      />
    </svg>
    <div
      class="absolute top-0 left-0 bottom-0 right-0 bg-gradient-to-r from-black/30 to-transparent to-70% -translate-x-full sm:group-hover:translate-x-0 motion-safe:transition-transform motion-safe:duration-100"
    ></div>
  </button>
  <button
    class="absolute group right-0 top-0 bottom-0 flex items-center w-[30%] justify-end"
    on:click={clickNext}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="2"
      stroke="currentColor"
      class="size-6 sm:size-8 mr-1 sm:mr-4 text-white sm:text-transparent group-hover:text-white z-10 motion-safe:transition-colors motion-safe:duration-100"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="m8.25 4.5 7.5 7.5-7.5 7.5"
      />
    </svg>

    <div
      class="absolute top-0 left-0 bottom-0 right-0 bg-gradient-to-l from-black/30 to-transparent to-70% translate-x-full sm:group-hover:translate-x-0 motion-safe:transition-transform motion-safe:duration-100"
    ></div>
  </button>
  <div>
    <div
      class="absolute bottom-2 sm:bottom-3 left-0 right-0 flex justify-center space-x-1 sm:space-x-3 group"
    >
      {#each Array.from({ length: numCards }, (_, i) => i) as card}
        <button
          class="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full hover:bg-white/80 motion-safe:transition-colors motion-safe:duration-100 {card ==
          currentCard
            ? 'bg-white'
            : 'bg-white/50'}"
          on:click={() => clickTo(card)}
        ></button>
      {/each}
    </div>
  </div>
</div>

<style>
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }

  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
