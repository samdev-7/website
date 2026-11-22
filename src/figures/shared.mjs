export const SERIES = ["blue", "yellow", "green", "pink", "orange", "brown"];
const TONES = ["red", ...SERIES];

export const node = (tagName, properties = {}, children = []) => ({
  type: "element",
  tagName,
  properties,
  children,
});
export const str = (value) => ({ type: "text", value });
export const text = (n) =>
  n.type === "text" ? n.value : (n.children ?? []).map(text).join("");
export const span = (className, value) => node("span", { className: [className] }, [str(value)]);
export const figcaption = (value) => node("figcaption", {}, [str(value)]);

const NUMBER = /^[-+−]?[\d,.]+\s*%?$/;
export const num = (s) => parseFloat(String(s).replace(/[,%\s]/g, "").replace("−", "-"));

export const items = (value = "") => value.split("|").map((s) => s.trim()).filter(Boolean);
const slots = (value = "") => value.split("|").map((s) => s.trim());
export const rows = (value = "") =>
  value.split("\n").map((r) => r.trim()).filter(Boolean).map((r) => r.split("|").map((c) => c.trim()));
export const flag = (value) => value === "true";

const ATTRIBUTE = /([a-z]+)(?:="([^"]*)")?/g;
export const attributes = (value) => {
  const m = value.match(/^<Figure\s([\s\S]*?)\/>$/);
  if (!m) throw new Error(`a <Figure …/> needs to close with /> and have a blank line after it: ${value.split("\n")[0]}`);
  return Object.fromEntries([...m[1].matchAll(ATTRIBUTE)].map(([, k, v]) => [k, v ?? "true"]));
};

export const markdown = (source, base) =>
  source.replace(/^<Figure\s[\s\S]*?\/>$/gm, (tag) => {
    const head = attributes(tag);
    const first = items(head.src)[0];
    return [
      "<!-- The following is an interactive figure, not part of standard Markdown. The Markdown format of this page may not have rendered properly. -->",
      first && !/\.(mp4|svg)$/.test(first) ? `![${head.alt}](${resolve(first, base)})` : head.alt,
      ...(head.caption ? [`*${head.caption}*`] : []),
    ].join("\n\n");
  });

export const resolve = (src, base) => (/^(\/|https?:)/.test(src) ? src : base + src);

export const images = (head, base) => {
  const labels = slots(head.labels);
  const fallbacks = slots(head.fallback);
  return items(head.src).map((src, i) => ({
    src: resolve(src, base),
    fallbacks: fallbacks[i] ? [resolve(fallbacks[i], base)] : [],
    label: labels[i] || undefined,
    alt: labels[i] || head.alt || "",
  }));
};

export const shown = (s) => s.fallbacks.at(-1) ?? s.src;
const TYPES = { avif: "image/avif", webp: "image/webp", mp4: "video/mp4" };
const ext = (src) => src.split(".").pop().toLowerCase();

export const dimensions = (size) =>
  size ? { width: size[0], height: size[1], ...(size[2] && { dataAlpha: "" }) } : {};

export const picture = (s, size) => {
  const img = node("img", {
    src: shown(s),
    alt: s.alt,
    loading: "lazy",
    decoding: "async",
    ...dimensions(size(shown(s)) || size(s.src)),
  });
  if (!s.fallbacks.length) return img;
  return node("picture", {}, [
    ...[s.src, ...s.fallbacks.slice(0, -1)].map((src) =>
      node("source", { srcSet: src, type: TYPES[ext(src)] })
    ),
    img,
  ]);
};

export const video = (s, loop, ctx) => {
  const poster = ctx.poster(shown(s));
  return node(
    "video",
    {
      ariaLabel: s.alt,
      playsInline: true,
      preload: "metadata",
      poster,
      ...dimensions(poster && ctx.size(poster)),
      controls: true,
      ...(loop ? { muted: true, loop: true, preload: "none", dataLoop: "" } : {}),
    },
    [s.src, ...s.fallbacks].map((src) =>
      node("source", {
        src,
        type: /hdr|hevc/i.test(src) ? 'video/mp4; codecs="hvc1"' : TYPES[ext(src)],
      })
    )
  );
};

const tone = (name) => (TONES.includes(name) ? name : "blue");

export const legend = (pairs) =>
  node(
    "ul",
    { className: ["figure-legend"] },
    pairs.map(([t, label]) =>
      node("li", { style: `--tone: var(--${tone(t)})` }, [str(label)])
    )
  );

const ramp = (value) => {
  const [low, colours, high] = slots(value);
  const stops = colours.split(/\s+/).filter((c) => /^#[\da-f]{3,8}$/i.test(c));
  return node("div", { className: ["figure-legend", "ramp"] }, [
    str(low),
    node("span", { className: ["ramp-bar"], style: `background: linear-gradient(to right, ${stops.join(", ")})` }),
    str(high),
  ]);
};

export const scroller = (child) =>
  node("div", { className: ["fades"] }, [
    node("div", { className: ["scroll"] }, [child]),
  ]);

export const sides = ([a, b]) =>
  node("div", { className: ["figure-foot", "sides"] }, [span("side", a.label), span("side r", b.label)]);

const caption = (parts, value) => {
  const cap = node("p", { className: ["caption"] }, [str(value)]);
  const last = parts.at(-1);
  const kind = last?.properties?.className ?? [];
  if (kind.includes("sides")) last.children.splice(1, 0, cap);
  else if (kind.includes("figure-legend"))
    parts.splice(-1, 1, node("div", { className: ["figure-foot"] }, [cap, last]));
  else parts.push(cap);
};

export const figure = (head, build, ctx) => {
  const parts = [
    ...(head.title ? [node("p", { className: ["figure-title"] }, [str(head.title)])] : []),
    ...build(head, ctx),
    ...(head.legend ? [legend(items(head.legend).map((p) => p.split(":").map((s) => s.trim())))] : []),
    ...(head.ramp ? [ramp(head.ramp)] : []),
  ];
  if (head.caption) caption(parts, head.caption);
  return node(
    "div",
    {
      className: [
        "figure",
        `figure-${head.type.replace("/", "-")}`,
        ...(flag(head.pixel) ? ["pixel"] : []),
        ...(head.size === "half" ? ["half"] : []),
      ],
    },
    parts
  );
};

const elements = (n) => (n?.children ?? []).filter((c) => c.type === "element");

export const table = (t) => {
  const trs = elements(t.children.find((c) => c.tagName === "tbody"));
  const every = (i, re) =>
    trs.every((tr) => {
      const v = text(elements(tr)[i] ?? str("")).trim();
      return !v || re.test(v);
    });
  const kind = elements(trs[0]).map((_, i) =>
    every(i, NUMBER) ? "num" : every(i, /\d:\d\d$/) ? "time" : null
  );
  for (const tr of elements(t).flatMap(elements))
    elements(tr).forEach((c, i) => {
      if (kind[i]) c.properties.className = [kind[i]];
    });
  t.properties.className = ["data"];
  return node("div", { className: ["figure", "figure-table"] }, [scroller(t)]);
};

export const chart = (head) => {
  const [header, ...data] = rows(head.data);
  const series = header.slice(1);
  const colour = (name, i) => (name === head.highlight ? "red" : SERIES[i % SERIES.length]);
  const cells = (tag, r) => node("tr", {}, r.map((c) => node(tag, {}, [str(c)])));
  return {
    data,
    series,
    colour,
    table: node("table", { className: ["chart-data"] }, [
      node("thead", {}, [cells("th", header)]),
      node("tbody", {}, data.map((r) => cells("td", r))),
    ]),
    legend: series.length > 1 ? [legend(series.map((s, i) => [colour(s, i), s]))] : [],
  };
};
