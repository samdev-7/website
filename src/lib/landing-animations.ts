type Keyframe = {
  from: number;
  to: number;
  translateY?: [number, number];
  opacity?: [number, number];
};

export function genKeyframes(
  defaultTextHeight: number,
  greetHeight: number,
  nameHeight: number,
  descHeight: number,
  linksHeight: number
) {
  const sec1 = [0.01, 0.1]; // rising of greeting, appearance of name

  const sec2 = [0.3, 0.5]; // disappearance of greeting, rising of name, appearance of description

  const sec3 = [0.7, 0.95]; // rising of name and description, appearance of links

  const greetKeyframes: Keyframe[] = [
    {
      from: -1,
      to: sec1[0],
    },
    {
      from: sec1[0],
      to: sec1[1],
      translateY: [0, -((greetHeight + nameHeight) / 2 - greetHeight / 2)],
    },
    {
      from: sec1[1],
      to: sec2[0],
      translateY: [
        -((greetHeight + nameHeight) / 2 - greetHeight / 2),
        -((greetHeight + nameHeight) / 2 - greetHeight / 2),
      ],
    },
    {
      from: sec2[0],
      to: sec2[1],
      translateY: [
        -nameHeight / 2,
        -nameHeight / 2 +
          (-(nameHeight + descHeight + defaultTextHeight) / 2 +
            nameHeight / 2 -
            ((greetHeight + nameHeight) / 2 - nameHeight / 2)),
      ],
      opacity: [1, 0],
    },
    {
      from: sec2[1],
      to: 2,
      translateY: [
        -nameHeight / 2 +
          (-(nameHeight + descHeight + defaultTextHeight) / 2 +
            nameHeight / 2 -
            ((greetHeight + nameHeight) / 2 - nameHeight / 2)),
        -nameHeight / 2 +
          (-(nameHeight + descHeight + defaultTextHeight) / 2 +
            nameHeight / 2 -
            ((greetHeight + nameHeight) / 2 - nameHeight / 2)),
      ],
      opacity: [0, 0],
    },
  ];

  const nameKeyframes: Keyframe[] = [
    {
      from: -1,
      to: sec1[0],
      translateY: [
        (greetHeight + nameHeight) / 2,
        (greetHeight + nameHeight) / 2,
      ],
      opacity: [0, 0],
    },
    {
      from: sec1[0],
      to: sec1[1],
      translateY: [
        (greetHeight + nameHeight) / 2,
        (greetHeight + nameHeight) / 2 - nameHeight / 2,
      ],
      opacity: [0, 1],
    },
    {
      from: sec1[1],
      to: sec2[0],
      translateY: [
        (greetHeight + nameHeight) / 2 - nameHeight / 2,
        (greetHeight + nameHeight) / 2 - nameHeight / 2,
      ],
      opacity: [1, 1],
    },
    {
      from: sec2[0],
      to: sec2[1],
      translateY: [
        (greetHeight + nameHeight) / 2 - nameHeight / 2,
        -(nameHeight + descHeight + defaultTextHeight) / 2 + nameHeight / 2,
      ],
    },
    {
      from: sec2[1],
      to: sec3[0],
      translateY: [
        -(nameHeight + descHeight + defaultTextHeight) / 2 + nameHeight / 2,
        -(nameHeight + descHeight + defaultTextHeight) / 2 + nameHeight / 2,
      ],
      opacity: [1, 1],
    },
    {
      from: sec3[0],
      to: sec3[1],
      translateY: [
        -(nameHeight + descHeight + defaultTextHeight) / 2 + nameHeight / 2,
        -(
          nameHeight +
          defaultTextHeight +
          descHeight +
          defaultTextHeight +
          linksHeight
        ) /
          2 +
          nameHeight / 2,
      ],
    },
    {
      from: sec3[1],
      to: 2,
      translateY: [
        -(
          nameHeight +
          defaultTextHeight +
          descHeight +
          defaultTextHeight +
          linksHeight
        ) /
          2 +
          nameHeight / 2,
        -(
          nameHeight +
          defaultTextHeight +
          descHeight +
          defaultTextHeight +
          linksHeight
        ) /
          2 +
          nameHeight / 2,
      ],
      opacity: [1, 1],
    },
  ];

  const descKeyframes: Keyframe[] = [
    {
      from: -1,
      to: sec2[0],
      translateY: [
        (nameHeight + descHeight + defaultTextHeight) / 2 -
          descHeight / 2 -
          (-(nameHeight + descHeight + defaultTextHeight) / 2 +
            nameHeight / 2 -
            ((greetHeight + nameHeight) / 2 - nameHeight / 2)),
        (nameHeight + descHeight + defaultTextHeight) / 2 -
          descHeight / 2 -
          (-(nameHeight + descHeight + defaultTextHeight) / 2 +
            nameHeight / 2 -
            ((greetHeight + nameHeight) / 2 - nameHeight / 2)),
      ],
      opacity: [0, 0],
    },
    {
      from: sec2[0],
      to: sec2[1],
      translateY: [
        (nameHeight + descHeight + defaultTextHeight) / 2 -
          descHeight / 2 -
          (-(nameHeight + descHeight + defaultTextHeight) / 2 +
            nameHeight / 2 -
            ((greetHeight + nameHeight) / 2 - nameHeight / 2)),
        (nameHeight + descHeight + defaultTextHeight) / 2 - descHeight / 2,
      ],
      opacity: [0, 1],
    },
    {
      from: sec2[1],
      to: sec3[0],
      translateY: [
        (nameHeight + descHeight + defaultTextHeight) / 2 - descHeight / 2,
        (nameHeight + descHeight + defaultTextHeight) / 2 - descHeight / 2,
      ],
      opacity: [1, 1],
    },
    {
      from: sec3[0],
      to: sec3[1],
      translateY: [
        (nameHeight + descHeight + defaultTextHeight) / 2 - descHeight / 2,
        -(
          nameHeight +
          defaultTextHeight +
          descHeight +
          defaultTextHeight +
          linksHeight
        ) /
          2 +
          nameHeight +
          defaultTextHeight +
          descHeight / 2,
      ],
    },
    {
      from: sec3[1],
      to: 2,
      translateY: [
        -(
          nameHeight +
          defaultTextHeight +
          descHeight +
          defaultTextHeight +
          linksHeight
        ) /
          2 +
          nameHeight +
          defaultTextHeight +
          descHeight / 2,
        -(
          nameHeight +
          defaultTextHeight +
          descHeight +
          defaultTextHeight +
          linksHeight
        ) /
          2 +
          nameHeight +
          defaultTextHeight +
          descHeight / 2,
      ],
      opacity: [1, 1],
    },
  ];

  const linksKeyframes: Keyframe[] = [
    {
      from: -1,
      to: sec3[0],
      translateY: [
        (nameHeight +
          +defaultTextHeight +
          descHeight +
          defaultTextHeight +
          linksHeight) /
          2 -
          linksHeight / 2 -
          (-(
            nameHeight +
            defaultTextHeight +
            descHeight +
            defaultTextHeight +
            linksHeight
          ) /
            2 +
            nameHeight +
            defaultTextHeight +
            descHeight / 2 -
            ((nameHeight + descHeight + defaultTextHeight) / 2 -
              descHeight / 2)),
        (nameHeight +
          +defaultTextHeight +
          descHeight +
          defaultTextHeight +
          linksHeight) /
          2 -
          linksHeight / 2 -
          (-(
            nameHeight +
            defaultTextHeight +
            descHeight +
            defaultTextHeight +
            linksHeight
          ) /
            2 +
            nameHeight +
            defaultTextHeight +
            descHeight / 2 -
            ((nameHeight + descHeight + defaultTextHeight) / 2 -
              descHeight / 2)),
      ],
      opacity: [0, 0],
    },
    {
      from: sec3[0],
      to: sec3[1],
      translateY: [
        (nameHeight +
          +defaultTextHeight +
          descHeight +
          defaultTextHeight +
          linksHeight) /
          2 -
          linksHeight / 2 -
          (-(
            nameHeight +
            defaultTextHeight +
            descHeight +
            defaultTextHeight +
            linksHeight
          ) /
            2 +
            nameHeight +
            defaultTextHeight +
            descHeight / 2 -
            ((nameHeight + descHeight + defaultTextHeight) / 2 -
              descHeight / 2)),
        (nameHeight +
          +defaultTextHeight +
          descHeight +
          defaultTextHeight +
          linksHeight) /
          2 -
          linksHeight / 2,
      ],
      opacity: [0, 1],
    },
    {
      from: sec3[1],
      to: 2,
      translateY: [
        (nameHeight +
          +defaultTextHeight +
          descHeight +
          defaultTextHeight +
          linksHeight) /
          2 -
          linksHeight / 2,
        (nameHeight +
          +defaultTextHeight +
          descHeight +
          defaultTextHeight +
          linksHeight) /
          2 -
          linksHeight / 2,
      ],
      opacity: [1, 1],
    },
  ];

  const contentKeyframes: Keyframe[] = [
    {
      from: -1,
      to: sec3[0],
      opacity: [0, 0],
    },
    {
      from: sec3[0],
      to: sec3[1],
      opacity: [0, 1],
    },
    {
      from: sec3[1],
      to: 2,
      opacity: [1, 1],
    },
  ];

  return {
    greetKeyframes,
    nameKeyframes,
    descKeyframes,
    linksKeyframes,
    contentKeyframes,
  };
}
