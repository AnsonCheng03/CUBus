export const capitalizeFirstLetter = <T extends string>(s: T) =>
  (s[0].toUpperCase() + s.slice(1)) as Capitalize<typeof s>;

export const outputDate = (MinuteHour: string) => {
  const date = new Date();
  const [hour, minute] = MinuteHour.split(":");
  date.setHours(Number(hour), Number(minute));
  return date;
};
