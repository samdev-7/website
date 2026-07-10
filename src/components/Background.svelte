<script>
  // Reusable dot-grid background with a cursor spotlight (engineering-paper
  // look). Locked to the settings dialed in on the pattern tester.
  //
  // Props:
  //   fadeStart / fadeEnd — optional scroll-percent bounds. When set, the whole
  //   effect fades in linearly across [fadeStart, fadeEnd] as the page scrolls
  //   (used by the landing). Omit both to keep it fully visible everywhere.
  let { fadeStart = null, fadeEnd = null } = $props();

  const FG = "74, 57, 17"; // fg (#4a3911) as an rgb triple
  const OPACITY = 0.14; // base dot opacity
  const SIZE = 28; // 1.75rem grid — one text line per row
  const SPOT_RADIUS = 150;
  const SPOT_STRENGTH = 0.5; // extra darkness of dots under the cursor

  let mouse = $state(/** @type {{x:number, y:number} | null} */ (null));
  let intensity = $state(fadeStart === null ? 1 : 0);

  // Scroll-driven fade (only when bounds are provided).
  $effect(() => {
    if (fadeStart === null || fadeEnd === null) return;
    const calc = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      const percent = max > 0 ? window.pageYOffset / max : 0;
      intensity = Math.min(
        1,
        Math.max(0, (percent - fadeStart) / (fadeEnd - fadeStart)),
      );
    };
    calc();
    window.addEventListener("scroll", calc, { passive: true });
    window.addEventListener("resize", calc);
    return () => {
      window.removeEventListener("scroll", calc);
      window.removeEventListener("resize", calc);
    };
  });

  // Track the cursor (rAF-throttled) to drive the spotlight mask position.
  $effect(() => {
    let rafId = null;
    let last = { x: 0, y: 0 };
    const onMove = (e) => {
      last = { x: e.clientX, y: e.clientY };
      if (rafId === null)
        rafId = requestAnimationFrame(() => {
          rafId = null;
          mouse = last;
        });
    };
    const onLeave = () => (mouse = null);
    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  });

  const dots = (alpha) =>
    `background-image: radial-gradient(rgba(${FG}, ${alpha}) 1.1px, transparent 1.3px); background-size: ${SIZE}px ${SIZE}px; background-position: center;`;

  const patternStyle = $derived(dots(OPACITY * intensity));

  const spotMask = $derived(
    mouse
      ? `radial-gradient(circle ${SPOT_RADIUS}px at ${mouse.x}px ${mouse.y}px, #000 0%, rgba(0,0,0,0.5) 45%, transparent 72%)`
      : "none",
  );
  const spotStyle = $derived(
    `${dots(SPOT_STRENGTH * intensity)} -webkit-mask-image: ${spotMask}; mask-image: ${spotMask}; opacity: ${mouse ? 1 : 0}; transition: opacity 200ms ease-out;`,
  );
</script>

<!-- base dot layer -->
<div
  class="pointer-events-none fixed inset-0 -z-10"
  style={patternStyle}
  aria-hidden="true"
></div>

<!-- cursor spotlight: darker dots revealed near the mouse -->
<div
  class="pointer-events-none fixed inset-0 -z-10"
  style={spotStyle}
  aria-hidden="true"
></div>
