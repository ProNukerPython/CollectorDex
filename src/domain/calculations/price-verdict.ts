export type PriceVerdict =
  | "STEAL"
  | "GREAT"
  | "FAIR"
  | "EXPENSIVE"
  | "VERY_EXPENSIVE";

export type PriceVerdictInput = {
  totalCents: number;
  targetPriceCents: number | null;
  maxPriceCents: number | null;
  referencePriceCents: number | null;
};

/**
 * Compares listing total against target, max and reference prices.
 * Prefer target when available, otherwise fall back to reference.
 */
export function priceVerdict(input: PriceVerdictInput): PriceVerdict {
  const { totalCents, targetPriceCents, maxPriceCents, referencePriceCents } =
    input;

  if (!Number.isInteger(totalCents) || totalCents < 0) {
    throw new Error("totalCents must be a non-negative integer");
  }

  if (maxPriceCents !== null && totalCents > maxPriceCents) {
    return totalCents > maxPriceCents * 1.15 ? "VERY_EXPENSIVE" : "EXPENSIVE";
  }

  const anchor =
    targetPriceCents ?? referencePriceCents ?? maxPriceCents ?? null;

  if (anchor === null) {
    return "FAIR";
  }

  const ratio = totalCents / Math.max(anchor, 1);

  if (ratio <= 0.75) return "STEAL";
  if (ratio <= 0.9) return "GREAT";
  if (ratio <= 1.05) return "FAIR";
  if (ratio <= 1.2) return "EXPENSIVE";
  return "VERY_EXPENSIVE";
}

export const PRICE_VERDICT_LABELS_ES: Record<PriceVerdict, string> = {
  STEAL: "Chollo",
  GREAT: "Muy buen precio",
  FAIR: "Precio correcto",
  EXPENSIVE: "Caro",
  VERY_EXPENSIVE: "Muy caro",
};
