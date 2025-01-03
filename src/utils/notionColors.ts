export const backgroundColors = {
  default: "#FFFFFF",
  gray: "#F1F1EF",
  brown: "#F3EEEE",
  orange: "#F8ECDF",
  yellow: "#FAF3DD",
  green: "#EEF3ED",
  blue: "#E9F3F7",
  purple: "#F6F3F8",
  pink: "#F9F2F5",
  red: "#FAECEC",
};

export const foregroundColors = {
  default: "#373530",
  gray: "#787774",
  brown: "#976D57",
  orange: "#CC782F",
  yellow: "#C29343",
  green: "#548164",
  blue: "#487CA5",
  purple: "#8A67AB",
  pink: "#B35488",
  red: "#C4554D",
};

export function getBackgroundColor(color: string): string {
  if (Object.keys(backgroundColors).includes(color)) {
    return backgroundColors[color as keyof typeof foregroundColors];
  } else {
    return backgroundColors.default;
  }
}

export function getForegroundColor(color: string): string {
  if (Object.keys(foregroundColors).includes(color)) {
    return foregroundColors[color as keyof typeof foregroundColors];
  } else {
    return foregroundColors.default;
  }
}
