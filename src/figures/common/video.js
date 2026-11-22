for (const pair of document.querySelectorAll(".clips[data-sync]")) {
  const [lead, ...rest] = pair.querySelectorAll("video");
  const each = (f) => rest.forEach(f);
  each((v) => (v.controls = false));
  lead.addEventListener("play", () => each((v) => v.play().catch(() => {})));
  lead.addEventListener("pause", () => each((v) => v.pause()));
  lead.addEventListener("seeked", () => each((v) => (v.currentTime = lead.currentTime)));
  lead.addEventListener("timeupdate", () =>
    each((v) => {
      if (Math.abs(v.currentTime - lead.currentTime) > 0.15)
        v.currentTime = lead.currentTime;
    })
  );
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
