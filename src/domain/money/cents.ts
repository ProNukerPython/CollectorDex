/**
 * Convert a euro amount (UI) to integer cents.
 * Accepts integers or up to 2 decimal places.
 */
export function eurosToCents(euros: number): number {
  if (!Number.isFinite(euros) || euros < 0) {
    throw new Error("euros must be a non-negative finite number");
  }
  return Math.round(euros * 100);
}

export function centsToEuros(cents: number): number {
  if (!Number.isInteger(cents)) {
    throw new Error("cents must be an integer");
  }
  return cents / 100;
}

export function parseEurosToCents(value: string): number {
  const normalized = value.trim().replace(",", ".");
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    throw new Error("invalid euro amount");
  }
  const [euros, cents = ""] = normalized.split(".");
  return Number(euros) * 100 + Number(cents.padEnd(2, "0"));
}

export function savingsOrOverpayCents(
  estimatedValueCents: number | null | undefined,
  pricePaidCents: number | null | undefined,
): number | null {
  if (
    estimatedValueCents === null ||
    estimatedValueCents === undefined ||
    pricePaidCents === null ||
    pricePaidCents === undefined
  ) {
    return null;
  }
  if (
    !Number.isInteger(estimatedValueCents) ||
    !Number.isInteger(pricePaidCents) ||
    estimatedValueCents < 0 ||
    pricePaidCents < 0
  ) {
    throw new Error("amounts must be non-negative integers (cents)");
  }
  return estimatedValueCents - pricePaidCents;
}
