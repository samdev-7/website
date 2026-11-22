for (const pair of document.querySelectorAll(".clips[data-sync]")) {
  const [lead, ...rest] = pair.querySelectorAll("video");
  const each = (f) => rest.forEach(f);
  each((v) => (v.controls = false));
  lead.addEventListener("play", () => each((v) => v.play().catch(() => {})));
  lead.addEventListener("pause", () => each((v) => v.pause()));
  const behind = (v) => {
    const d = lead.currentTime - v.currentTime;
    const n = lead.duration;
    return n ? ((d + n * 1.5) % n) - n / 2 : d;
  };
  const align = (v) => {
    const d = behind(v);
    if (Math.abs(d) > 1) {
      v.currentTime = lead.currentTime;
      v.playbackRate = 1;
    } else v.playbackRate = 1 + Math.max(-0.1, Math.min(0.1, d));
  };
  lead.addEventListener("seeked", () => each(align));
  lead.addEventListener("timeupdate", () => each(align));
}

const near = new IntersectionObserver(
  (entries) =>
    entries.forEach(({ target, isIntersecting }) =>
      isIntersecting ? target.play().catch(() => {}) : target.pause()
    ),
  { rootMargin: "100% 0px" }
);
for (const v of document.querySelectorAll("video[data-loop]")) {
  v.controls = false;
  if (!v.matches(".clips[data-sync] video:not(:first-child)")) near.observe(v);
}
