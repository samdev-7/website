<script>
  import { genKeyframes } from "../lib/landing-animations";

  const defaultTextHeightRem = 2.25;

  let scrollPercent = $state(0);

  let textGreet = $state(/** @type {HTMLParagraphElement} */ (undefined));
  let textName = $state(/** @type {HTMLParagraphElement} */ (undefined));
  let textDesc = $state(/** @type {HTMLParagraphElement} */ (undefined));
  let textLinks = $state(/** @type {HTMLParagraphElement} */ (undefined));

  let defaultTextHeight = $state(0);
  let greetHeight = $state(0);
  let nameHeight = $state(0);
  let descHeight = $state(0);
  let linksHeight = $state(0);

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // Find the keyframe covering the current scroll position and lerp within it.
  function evalAt(keyframes, percent) {
    let translateY = 0;
    let opacity = 1;
    for (const kf of keyframes) {
      if (percent < kf.from || percent > kf.to) continue;
      const tYb = kf.translateY || [0, 0];
      const oB = kf.opacity || [1, 1];
      const t = (percent - kf.from) / (kf.to - kf.from);
      translateY = lerp(tYb[0], tYb[1], t);
      opacity = lerp(oB[0], oB[1], t);
    }
    return { translateY, opacity };
  }

  const kf = $derived(
    genKeyframes(
      defaultTextHeight,
      greetHeight,
      nameHeight,
      descHeight,
      linksHeight,
    ),
  );

  const greet = $derived(evalAt(kf.greetKeyframes, scrollPercent));
  const nameAnim = $derived(evalAt(kf.nameKeyframes, scrollPercent));
  const desc = $derived(evalAt(kf.descKeyframes, scrollPercent));
  const links = $derived(evalAt(kf.linksKeyframes, scrollPercent));
  const contentOpacity = $derived(
    evalAt(kf.contentKeyframes, scrollPercent).opacity,
  );

  // Reset to the top on load so the animation always starts from the greeting.
  $effect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  });

  // Scroll tracking (rAF-throttled) + magnetic snap to the exact top/bottom
  // once scrolling settles inside the flat zones.
  $effect(() => {
    const getMaxScroll = () => document.body.scrollHeight - window.innerHeight;
    const topSnap = 0.03;
    const bottomSnap = 0.97;

    let rafId = null;
    let snapTimeout = null;

    const update = () => {
      rafId = null;
      scrollPercent = window.pageYOffset / getMaxScroll();
    };

    const maybeSnap = () => {
      const max = getMaxScroll();
      const percent = window.pageYOffset / max;
      if (percent > 0 && percent < topSnap) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (percent > bottomSnap && percent < 1) {
        window.scrollTo({ top: max, behavior: "smooth" });
      }
    };

    const onScroll = () => {
      if (rafId === null) rafId = requestAnimationFrame(update);
      if (snapTimeout !== null) clearTimeout(snapTimeout);
      snapTimeout = setTimeout(maybeSnap, 120);
    };

    window.addEventListener("resize", onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    update();

    return () => {
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("scroll", onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (snapTimeout !== null) clearTimeout(snapTimeout);
    };
  });

  // Measure the rendered text heights (they drive the keyframe geometry).
  $effect(() => {
    const calculateHeights = () => {
      const defaultHeight =
        defaultTextHeightRem *
        parseFloat(getComputedStyle(document.documentElement).fontSize);
      defaultTextHeight = defaultHeight;

      if (!textGreet) return;
      greetHeight = textGreet.offsetHeight || defaultHeight;
      if (!textName) return;
      nameHeight = textName.offsetHeight || defaultHeight;
      if (!textDesc) return;
      descHeight = textDesc.offsetHeight || defaultHeight;
      if (!textLinks) return;
      linksHeight = textLinks.offsetHeight || defaultHeight;
    };

    window.addEventListener("resize", calculateHeights);
    calculateHeights();

    return () => window.removeEventListener("resize", calculateHeights);
  });

  function skipToContent() {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }
</script>

<div class="h-[150rem]">
  {#if contentOpacity < 1}
    <button
      class="text-xs md:text-sm fixed bottom-4 md:bottom-8 right-4 md:right-8 underline cursor-pointer z-10"
      style="opacity: {1 - contentOpacity}"
      onclick={skipToContent}
    >
      skip to content
    </button>
  {/if}
  <div
    class="fixed inset-0 h-screen flex items-center flex-col mx-6 md:mx-12 text-lg sm:text-2xl md:text-3xl text-fg"
  >
    <div
      class="h-full max-w-2xl w-full py-12 flex flex-col items-center justify-center relative text-center"
    >
      <p
        class="absolute left-0 right-0"
        bind:this={textGreet}
        style="opacity: {greet.opacity}; transform: translate3d(0, {greet.translateY}px, 0); will-change: transform, opacity; pointer-events: {greet.opacity ===
        0
          ? 'none'
          : 'auto'};"
      >
        hey there! 👋
      </p>
      <p
        class="absolute left-0 right-0"
        bind:this={textName}
        style="opacity: {nameAnim.opacity}; transform: translate3d(0, {nameAnim.translateY}px, 0); will-change: transform, opacity; pointer-events: {nameAnim.opacity ===
        0
          ? 'none'
          : 'auto'};"
      >
        i'm sam
      </p>
      <p
        class="absolute left-0 right-0"
        bind:this={textDesc}
        style="opacity: {desc.opacity}; transform: translate3d(0, {desc.translateY}px, 0); will-change: transform, opacity; pointer-events: {desc.opacity ===
        0
          ? 'none'
          : 'auto'};"
      >
        i build things that get teens to make technical projects @
        <a href="https://hackclub.com" target="_blank">hack club</a>
      </p>
      <p
        class="absolute left-0 right-0"
        bind:this={textLinks}
        style="opacity: {links.opacity}; transform: translate3d(0, {links.translateY}px, 0); will-change: transform, opacity; pointer-events: {links.opacity ===
        0
          ? 'none'
          : 'auto'};"
      >
        <a href="about">about</a> | <a href="contact">contact</a>
      </p>
      {#if contentOpacity < 1}
        <button
          class="fixed text-base sm:text-lg md:text-xl bottom-6 md:bottom-12 cursor-pointer"
          style="opacity: {1 - contentOpacity}"
          onclick={skipToContent}
        >
          scroll<br />↓
        </button>
      {/if}
    </div>
  </div>
  {#if contentOpacity > 0}
    <p
      class="text-base md:text-xl fixed top-5 md:top-8 left-6 md:left-12"
      style="opacity: {contentOpacity}"
    >
      samliu.dev
    </p>
  {/if}
  {#if contentOpacity > 0}
    <p
      class="text-xs md:text-sm fixed bottom-4 md:bottom-8 transform text-center left-6 right-6"
      style="opacity: {contentOpacity}"
    >
      © 2025 sam liu,
      <a href="https://github.com/samdev-7/website">open sourced</a> ♥︎
    </p>
  {/if}
</div>
