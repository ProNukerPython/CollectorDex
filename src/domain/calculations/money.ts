/**
 * Money helpers — all amounts are integer cents to avoid floating-point errors.
 */

export function listingTotalCents(
  priceCents: number,
  shippingCents: number = 0,
  feeCents: number = 0,
): number {
  assertNonNegativeInt(priceCents, "priceCents");
  assertNonNegativeInt(shippingCents, "shippingCents");
  assertNonNegativeInt(feeCents, "feeCents");
  return priceCents + shippingCents + feeCents;
}

export function savingsCents(
  referenceOrEstimateCents: number,
  paidCents: number,
): number {
  assertNonNegativeInt(referenceOrEstimateCents, "referenceOrEstimateCents");
  assertNonNegativeInt(paidCents, "paidCents");
  return referenceOrEstimateCents - paidCents;
}

export function formatCentsEs(
  cents: number,
  currency: string = "EUR",
): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

function assertNonNegativeInt(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative integer (cents)`);
  }
}
