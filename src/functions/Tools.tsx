export const capitalizeFirstLetter = <T extends string>(s: T) =>
  (s[0].toUpperCase() + s.slice(1)) as Capitalize<typeof s>;

export const outputDate = (MinuteHour: string) => {
  const date = new Date();
  const [hour, minute] = MinuteHour.split(":");
  date.setHours(Number(hour), Number(minute));
  return date;
};

export function getTextColor(rgb: string) {
  // Extract red, green, and blue values from the rgb(xxx,xxx,xxx) string
  if (!rgb) return "#fff";
  const [r, g, b] = rgb
    .replace(/[^\d,]/g, "") // Remove everything except digits and commas
    .split(",")
    .map(Number); // Convert the values to numbers

  // Calculate brightness using the formula
  const brightness = r * 0.299 + g * 0.587 + b * 0.114;

  // Return black (#000000) or white (#ffffff) based on brightness
  return brightness > 160 ? "#000000" : "#ffffff";
}
