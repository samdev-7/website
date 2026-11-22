import { node, str, span, items, flag } from "../shared.mjs";

const MARK = {
  "✗": ["no", "rejected", "M4.5 4.5l7 7M11.5 4.5l-7 7"],
  "✓": ["yes", "chosen", "M3 8.5l3.5 3.5 6.5-7"],
};

export default (head) => [
  node(
    "ol",
    { className: ["decisions"] },
    items(head.items).map((l, i) => {
      const m = l.match(/^([✗✓])\s*/);
      const [state, label, d] = MARK[m?.[1]] ?? [];
      const [option, why] = (m ? l.slice(m[0].length) : l).split(/\s+—\s+/);
      return node("li", { className: state ? [state] : [] }, [
        d
          ? node("svg", { className: ["mark"], viewBox: "0 0 16 16", role: "img", ariaLabel: label }, [
              node("path", { d }),
            ])
          : span("mark", flag(head.order) ? String(i + 1) : ""),
        node("span", {}, [span("option", option), ...(why ? [str(" "), span("why", why)] : [])]),
      ]);
    })
  ),
];
