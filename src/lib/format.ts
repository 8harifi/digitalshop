const DIGITS: Record<string, string> = {
  fa: "۰۱۲۳۴۵۶۷۸۹",
  ar: "٠١٢٣٤٥٦٧٨٩",
};

export function toLocalizedDigits(
  input: string | number,
  locale: string,
): string {
  const value = String(input);
  const digits = DIGITS[locale];
  if (!digits) return value;
  return value.replace(/\d/g, (d) => digits[Number(d)]);
}

export function formatPrice(
  value: number | string | null | undefined,
  locale: string,
): string {
  const amount = typeof value === "number" ? value : Number(value);
  const safe = Number.isFinite(amount) ? amount : 0;
  return toLocalizedDigits(safe.toLocaleString("en-US"), locale);
}
