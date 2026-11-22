for (const w of document.querySelectorAll(".wipe")) {
  const input = w.querySelector("input");
  const group = w.closest("[data-link]")?.querySelectorAll(".wipe") ?? [w];
  input.addEventListener("input", () =>
    group.forEach((g) => {
      g.style.setProperty("--x", input.value + "%");
      g.querySelector("input").value = input.value;
    })
  );
}
