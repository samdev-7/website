export const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function scrollProgress(el: HTMLElement) {
  const distance = el.offsetHeight - window.innerHeight;
  if (distance <= 0) return 1;
  return clamp(-el.getBoundingClientRect().top / distance);
}

export function releaseProgress(el: HTMLElement, span: number) {
  const past = window.innerHeight - el.getBoundingClientRect().bottom;
  return clamp(past / (span * window.innerHeight));
}

export const isKeyboardClick = (event: MouseEvent) => event.detail === 0;

export function focusTransiently(el: HTMLElement) {
  el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
  el.addEventListener("blur", () => el.removeAttribute("tabindex"), {
    once: true,
  });
}

export function interceptHashLinks() {
  const onClick = (event: MouseEvent) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;

    const clicked = event.target;
    const href =
      clicked instanceof Element
        ? clicked.closest("a")?.getAttribute("href")
        : null;
    if (!href?.startsWith("#")) return;

    const section = document.getElementById(href.slice(1));
    if (!section) return;

    event.preventDefault();

    if (isKeyboardClick(event)) focusTransiently(section);

    section.scrollIntoView({ block: "start" });
  };

  document.addEventListener("click", onClick);
  return () => document.removeEventListener("click", onClick);
}

export function onScroll(callback: () => void) {
  let rafId: number | null = null;

  const run = () => {
    rafId = null;
    callback();
  };
  const schedule = () => {
    if (rafId === null) rafId = requestAnimationFrame(run);
  };

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  callback();

  return () => {
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    if (rafId !== null) cancelAnimationFrame(rafId);
  };
}
