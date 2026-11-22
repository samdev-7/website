import { node, str, span, items } from "../shared.mjs";

export default (head) => [
  node(
    "ul",
    { className: ["stats"] },
    items(head.items).map((l) => {
      const [value, why] = l.split(/\s+—\s+/);
      return node("li", {}, [span("value", value), ...(why ? [str(" "), span("why", why)] : [])]);
    })
  ),
];
