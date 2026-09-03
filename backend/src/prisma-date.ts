export function prismaDateTimeFromHongKong(value: string): Date {
  const normalized = value.trim().replace(' ', 'T');
  // Prisma serializes a DateTime to MariaDB as the Date's UTC wall-clock
  // components. The legacy tables store Hong Kong DATETIME values without a
  // timezone, so intentionally use Z here to preserve the original text.
  const date = new Date(`${normalized.replace(/(?:Z|[+-]\d{2}:?\d{2})$/, '')}Z`);
  if (!Number.isFinite(date.getTime())) throw new Error(`Invalid SQL datetime: ${value}`);
  return date;
}

export function decimalString(value: unknown): string | null {
  return value == null ? null : String(value);
}
