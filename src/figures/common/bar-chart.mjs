import { node, span, num, flag, chart } from "../shared.mjs";

export default (head) => {
  const { data, series, colour, table, legend } = chart(head);
  const max = +head.max || Math.max(...data.flatMap((r) => r.slice(1).map(num)));
  const bar = (r) => (v, i) =>
    node(
      "span",
      {
        className: ["chart-bar"],
        style: `--v: ${num(v) / max}; --tone: var(--${r[0] === head.highlight ? "red" : colour(series[i], i)})`,
      },
      [span("chart-val", v)]
    );
  return [
    node(
      "div",
      { className: ["chart", flag(head.horizontal) ? "hbar" : "bar"] },
      data.map((r) =>
        node("div", { className: ["chart-group"] }, [
          span("chart-cat", r[0]),
          node("span", { className: ["chart-bars"] }, r.slice(1).map(bar(r))),
        ])
      )
    ),
    table,
    ...legend,
  ];
};
