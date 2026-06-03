export const capitalizeFirstLetter = <T extends string>(s: T) =>
  (s[0].toUpperCase() + s.slice(1)) as Capitalize<typeof s>;

export const outputDate = (minuteHour: string) => {
  const date = new Date();
  const [hour, minute] = minuteHour.split(':');
  date.setHours(Number(hour), Number(minute));
  return date;
};

export function getTextColor(rgb: string) {
  if (!rgb) return '#fff';
  const [r, g, b] = rgb.replace(/[^\d,]/g, '').split(',').map(Number);
  const brightness = r * 0.299 + g * 0.587 + b * 0.114;
  return brightness > 160 ? '#000000' : '#ffffff';
}
