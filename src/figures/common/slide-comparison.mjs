import { node, span, figcaption, images, items, flag, picture, shown } from "../shared.mjs";

const wipe = (a, b, ctx) => {
  const [w, h] = ctx.size(shown(b)) || [16, 9];
  return node("div", { className: ["wipe"], style: `--x: 50%; --ar: ${w} / ${h}` }, [
    picture(b, ctx.size),
    node("div", { className: ["wipe-over"] }, [picture(a, ctx.size)]),
    node("span", { className: ["wipe-bar"], ariaHidden: "true" }),
    span("corner l", a.label),
    span("corner r", b.label),
    node("input", {
      type: "range",
      min: 0,
      max: 100,
      value: 50,
      step: 0.1,
      ariaLabel: `compare ${a.label} with ${b.label}`,
    }),
  ]);
};

export default (head, ctx) => {
  const all = images(head, ctx.base);
  const pairs = all.flatMap((a, i) => (i % 2 ? [] : [[a, all[i + 1]]]));
  if (pairs.length === 1) return [wipe(...pairs[0], ctx)];
  const columns = items(head.columns);
  return [
    node(
      "div",
      {
        className: ["grid"],
        dataLink: flag(head.link) ? "" : undefined,
        style: `--cols: ${columns.length || pairs.length}; --phone: ${head.phone ?? 1}`,
      },
      pairs.map(([a, b], i) =>
        node("figure", { className: ["grid-tile"] }, [
          wipe(a, b, ctx),
          ...(columns[i] ? [figcaption(columns[i])] : []),
        ])
      )
    ),
  ];
};
