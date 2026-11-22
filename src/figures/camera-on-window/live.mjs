import { node, str } from "../shared.mjs";

export default (head) => {
  const props = { alt: head.alt, loading: "lazy", decoding: "async" };
  return [
    node("img", { ...props, dataLiveSrc: head.src }),
    node("noscript", {}, [
      node("style", {}, [str("img[data-live-src] { display: none }")]),
      node("img", { ...props, src: head.src }),
    ]),
  ];
};
