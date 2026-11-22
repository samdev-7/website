const SVG = "http://www.w3.org/2000/svg";
const svg = (tag, attrs = {}, parent) => {
  const e = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  parent?.append(e);
  return e;
};
const el = (tag, className, text) =>
  Object.assign(document.createElement(tag), { className, textContent: text ?? "" });
const num = (s) => parseFloat(String(s).replace(/[,%\s]/g, "").replace("−", "-"));
const nice = (max) => {
  const step = 10 ** Math.floor(Math.log10(max / 4));
  const m = [1, 2, 2.5, 5, 10].find((f) => max / (f * step) <= 5) * step;
  return { step: m, top: Math.ceil(max / m) * m };
};

const line = (chart) => {
  const table = chart.nextElementSibling;
  const series = JSON.parse(chart.dataset.series);
  const unit = chart.dataset.unit ? " " + chart.dataset.unit : "";
  const rows = [...table.tBodies[0].rows].map((r) =>
    [...r.cells].map((c) => c.textContent)
  );
  const xs = rows.map((r) => r[0]);
  const values = rows.map((r) => r.slice(1).map(num));
  const { step, top } = nice(Math.max(...values.flat()));
  const t = chart.appendChild(el("div", "chart-tip"));
  const draw = () => {
    chart.querySelector("svg")?.remove();
    const W = chart.clientWidth,
      H = W < 480 ? 200 : 240,
      L = 36,
      B = 24,
      T = 8;
    const x = (i) => L + (i * (W - L - 8)) / Math.max(1, xs.length - 1);
    const y = (v) => T + (1 - v / top) * (H - T - B);
    const s = svg("svg", { width: W, height: H, viewBox: `0 0 ${W} ${H}` });
    chart.prepend(s);
    for (let v = 0; v <= top + 1e-9; v += step) {
      svg("line", { class: "grid-line", x1: L, x2: W, y1: y(v), y2: y(v) }, s);
      svg("text", { class: "tick", x: L - 8, y: y(v) + 4, "text-anchor": "end" }, s).textContent =
        +v.toFixed(6);
    }
    const every = Math.ceil(xs.length / Math.floor((W - L) / 64));
    xs.forEach((label, i) => {
      if (i % every) return;
      svg("text", { class: "tick", x: x(i), y: H - 6, "text-anchor": "middle" }, s).textContent = label;
    });
    series.forEach(([, tone], j) =>
      svg("path", {
        class: "series",
        d: values.map((r, i) => `${i ? "L" : "M"}${x(i)},${y(r[j])}`).join(""),
        style: `--tone: var(--${tone})`,
      }, s)
    );
    const cross = svg("line", { class: "cross", y1: T, y2: H - B }, s);
    const dots = series.map(([, tone]) =>
      svg("circle", { class: "dot", r: 3, style: `--tone: var(--${tone})` }, s)
    );
    const show = (e) => {
      const r = s.getBoundingClientRect();
      const i = Math.max(0, Math.min(xs.length - 1, Math.round(((e.clientX - r.left - L) / (W - L - 8)) * (xs.length - 1))));
      chart.dataset.hover = "";
      cross.setAttribute("x1", x(i));
      cross.setAttribute("x2", x(i));
      dots.forEach((d, j) => {
        d.setAttribute("cx", x(i));
        d.setAttribute("cy", y(values[i][j]));
      });
      t.replaceChildren(
        el("b", "", xs[i]),
        ...series.map(([name, tone], j) => {
          const row = el("span", "", `${name} ${rows[i][j + 1]}${unit}`);
          row.style.setProperty("--tone", `var(--${tone})`);
          return row;
        })
      );
      const left = x(i) + 12;
      t.style.left = (left + t.offsetWidth > W ? x(i) - 12 - t.offsetWidth : left) + "px";
    };
    s.addEventListener("pointermove", show);
    s.addEventListener("pointerleave", () => delete chart.dataset.hover);
  };
  let width = 0;
  new ResizeObserver(() => {
    if (chart.clientWidth === width) return;
    width = chart.clientWidth;
    draw();
  }).observe(chart);
  const legend = chart.parentElement.querySelector(".figure-legend");
  legend?.querySelectorAll("li").forEach((li, j) => {
    const focus = (on) =>
      chart.querySelectorAll(".series").forEach((p, k) =>
        p.classList.toggle("dim", on && k !== j)
      );
    li.addEventListener("pointerenter", () => focus(true));
    li.addEventListener("pointerleave", () => focus(false));
  });
};
document.querySelectorAll(".chart.line").forEach(line);
