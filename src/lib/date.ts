export const formatDate = (date: Date) =>
  date
    .toLocaleDateString("en-GB", {
      timeZone: "UTC",
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(/ (\w+) /, " $1, ")
    .toLowerCase();
