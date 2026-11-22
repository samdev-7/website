import { node, span, images, picture, scroller } from "../shared.mjs";

export default (head, ctx) => {
  const stages = images(head, ctx.base);
  const active = +head.active;
  return [
    scroller(
      node(
        "ol",
        { className: ["steps"], style: `--chars: ${Math.max(...stages.map((s) => s.label.length))}` },
        stages.map((s, i) =>
          node("li", i + 1 === active ? { className: ["active"], ariaCurrent: "step" } : {}, [
            picture(s, ctx.size),
            span("step-label", s.label),
          ])
        )
      )
    ),
  ];
};
