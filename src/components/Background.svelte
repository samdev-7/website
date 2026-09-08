<script>
  import { clamp, onScroll, scrollProgress } from "../lib/scroll";

  // fadeTarget is the id of an element whose scroll progress drives the fade;
  // the effect ramps in linearly across [fadeStart, fadeEnd] of that progress.
  // Omit it to stay fully visible.
  let { fadeTarget = null, fadeStart = 0, fadeEnd = 1 } = $props();

  const FG = "74, 57, 17"; // fg (#4a3911) as an rgb triple
  const OPACITY = 0.14;
  const SIZE = 28;
  const SPOT_RADIUS = 150;
  const SPOT_STRENGTH = 0.5;

  let mouse = $state(/** @type {{x:number, y:number} | null} */ (null));
  let intensity = $state(fadeTarget === null ? 1 : 0);

  $effect(() => {
    if (fadeTarget === null) return;

    const el = document.getElementById(fadeTarget);
    if (!el || fadeEnd <= fadeStart) {
      intensity = 1;
      return;
    }

    return onScroll(() => {
      intensity = clamp(
        (scrollProgress(el) - fadeStart) / (fadeEnd - fadeStart),
      );
    });
  });

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

<div
  class="pointer-events-none fixed inset-0 -z-10"
  style={patternStyle}
  aria-hidden="true"
></div>

<div
  class="pointer-events-none fixed inset-0 -z-10"
  style={spotStyle}
  aria-hidden="true"
></div>
