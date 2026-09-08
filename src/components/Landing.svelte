<script>
  import {
    DEEP_LINK_AFTER,
    HINT_FADE_VH,
    LANDING_ID,
    genKeyframes,
  } from "../lib/landing-animations";
  import {
    focusTransiently,
    interceptHashLinks,
    isKeyboardClick,
    lerp,
    onScroll,
    releaseProgress,
    scrollProgress,
  } from "../lib/scroll";

  const defaultTextHeightRem = 2.25;

  let scrollPercent = $state(0);
  let hintOpacity = $state(1);

  let runway = $state(/** @type {HTMLDivElement} */ (undefined));
  let intro = $state(/** @type {HTMLDivElement} */ (undefined));
  let textGreet = $state(/** @type {HTMLParagraphElement} */ (undefined));
  let textName = $state(/** @type {HTMLParagraphElement} */ (undefined));
  let textDesc = $state(/** @type {HTMLParagraphElement} */ (undefined));
  let textLinks = $state(/** @type {HTMLParagraphElement} */ (undefined));

  let defaultTextHeight = $state(0);
  let greetHeight = $state(0);
  let nameHeight = $state(0);
  let descHeight = $state(0);
  let linksHeight = $state(0);

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

  const lineStyle = ({ translateY, opacity }) =>
    `opacity: ${opacity}; transform: translate3d(0, ${translateY}px, 0); will-change: transform, opacity; pointer-events: ${opacity === 0 ? "none" : "auto"};`;

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

  const hintTarget = $derived(
    scrollPercent > DEEP_LINK_AFTER ? "#about" : "#content",
  );

  const mounted = $derived(!!runway);

  const hintAttrs = $derived({ href: hintTarget, onclick: onHintClick });

  const lineTabIndex = (line) =>
    mounted && line.opacity === 0 ? -1 : undefined;

  function onHintClick(event) {
    if (scrollPercent > DEEP_LINK_AFTER) return;
    event.preventDefault();
    if (isKeyboardClick(event)) focusTransiently(intro);
    runway.scrollIntoView({ block: "end" });
  }

  $effect(() => {
    if (!runway) return;

    const target = location.hash
      ? document.getElementById(location.hash.slice(1))
      : null;

    if (!target && window.pageYOffset >= runway.offsetHeight) return;

    window.scrollTo({ top: 0, behavior: "instant" });
    if (!target) return;

    let inner = null;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() =>
        target.scrollIntoView({ block: "start" }),
      );
    });

    return () => {
      cancelAnimationFrame(outer);
      if (inner !== null) cancelAnimationFrame(inner);
    };
  });

  $effect(() => interceptHashLinks());

  $effect(() => {
    if (!runway) return;
    const el = runway;
    return onScroll(() => {
      scrollPercent = scrollProgress(el);
      hintOpacity = 1 - releaseProgress(el, HINT_FADE_VH);
    });
  });

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
</script>

<div id={LANDING_ID} bind:this={runway} class="h-dvh motion-safe:h-[150rem]">
  {#if hintOpacity > 0}
    <a
      {...hintAttrs}
      class="landing-skip text-xs md:text-sm fixed bottom-4 md:bottom-8 right-4 md:right-8 z-10 opacity-0 pointer-events-none focus:opacity-100 focus:pointer-events-auto"
    >
      skip to content
    </a>
  {/if}
  <div
    class="sticky top-0 h-dvh flex items-center flex-col mx-6 md:mx-12 text-lg sm:text-2xl md:text-3xl text-fg"
  >
    <div
      bind:this={intro}
      class="h-full max-w-2xl w-full py-12 flex flex-col items-center justify-center relative text-center"
    >
      <p
        class="landing-line landing-greet absolute left-0 right-0"
        bind:this={textGreet}
        style={lineStyle(greet)}
      >
        hey there! 👋
      </p>
      <p
        class="landing-line absolute left-0 right-0"
        bind:this={textName}
        style={lineStyle(nameAnim)}
      >
        i'm sam
      </p>
      <p
        class="landing-line absolute left-0 right-0"
        bind:this={textDesc}
        style={lineStyle(desc)}
      >
        i build things that get teens to make technical projects @
        <a
          href="https://hackclub.com"
          target="_blank"
          tabindex={lineTabIndex(desc)}>hack club</a
        >
      </p>
      <p
        class="landing-line absolute left-0 right-0"
        bind:this={textLinks}
        style={lineStyle(links)}
      >
        <a href="#about" tabindex={lineTabIndex(links)}>about</a> |
        <a href="#contact" tabindex={lineTabIndex(links)}>contact</a>
      </p>
      {#if hintOpacity > 0}
        <a
          {...hintAttrs}
          class="landing-scroll fixed text-base sm:text-lg md:text-xl bottom-6 md:bottom-12 no-underline"
          style="opacity: {hintOpacity}"
        >
          scroll<br />↓
        </a>
      {/if}
    </div>
  </div>
</div>
