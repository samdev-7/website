import { node, chart } from "../shared.mjs";

export default (head) => {
  const { series, colour, table, legend } = chart(head);
  return [
    node("div", {
      className: ["chart", "line"],
      dataSeries: JSON.stringify(series.map((s, i) => [s, colour(s, i)])),
      dataUnit: head.unit,
      role: "img",
      ariaLabel: head.alt,
    }),
    table,
    ...legend,
  ];
};
