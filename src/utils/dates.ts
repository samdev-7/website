export function toReadable(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function toSimpleDate(date: Date): string {
  return date.toISOString().split("T")[0];
}
