import { node, str, figcaption, images, items, picture, sides } from "../shared.mjs";

export default (head, ctx) => {
  const all = images(head, ctx.base);
  const columns = items(head.columns);
  const rows = items(head.rows);
  const pair = !columns.length && !rows.length && all.length === 2;
  const cols = columns.length || (pair ? 2 : +head.cols || Math.min(all.length, 3));
  const tile = (s) =>
    node("figure", { className: ["grid-tile"] }, [
      picture(s, ctx.size),
      ...(columns.length || pair || !s.label ? [] : [figcaption(s.label)]),
    ]);
  const per = all.length / (rows.length || 1);
  const cells = rows.length
    ? rows.flatMap((row, i) => [
        node("p", { className: ["grid-row"] }, [str(row)]),
        ...all.slice(i * per, (i + 1) * per).map(tile),
      ])
    : all.map(tile);
  return [
    node("div", { className: ["grid"], style: `--cols: ${cols}; --phone: ${pair ? 2 : head.phone ?? cols}` }, [
      ...cells,
      ...columns.map((l) => node("span", { className: ["grid-col"] }, [str(l)])),
    ]),
    ...(pair ? [sides(all)] : []),
  ];
};
