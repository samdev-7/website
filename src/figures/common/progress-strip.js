for (const step of document.querySelectorAll(".steps .active")) {
  const strip = step.closest(".scroll");
  strip.scrollLeft = step.offsetLeft + step.offsetWidth / 2 - strip.clientWidth / 2;
}
