export function formatCentsEs(
  cents: number,
  currency: string = "EUR",
): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function formatDateEs(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatPercentEs(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(value / 100);
}
