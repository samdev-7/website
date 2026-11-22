const when = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Toronto",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});
const images = document.querySelectorAll("img[data-live-src]");
fetch(DATA + "/cam.json")
  .then((r) => r.json())
  .then((cam) => {
    for (const t of document.querySelectorAll('time[data-live="capture-time"]')) {
      t.dateTime = cam.captured_at;
      t.textContent = when.format(new Date(cam.captured_at)).toLowerCase();
    }
    images.forEach((img) => (img.src = new URL(cam.url, img.dataset.liveSrc).href));
  })
  .catch(() => images.forEach((img) => (img.src ||= img.dataset.liveSrc)));
