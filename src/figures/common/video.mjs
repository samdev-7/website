import { node, images, flag, video, sides } from "../shared.mjs";

export default (head, ctx) => {
  const clips = images(head, ctx.base);
  return [
    node(
      "div",
      { className: ["clips"], dataSync: clips.length > 1 ? "" : undefined },
      clips.map((c) => video(c, flag(head.loop), ctx))
    ),
    ...(clips.length === 2 ? [sides(clips)] : []),
  ];
};
