export type ValuedCopy = {
  estimatedValueCents: number;
  isPrimary: boolean;
};

/**
 * Sum of estimated values for primary copies only.
 */
export function collectionEstimatedValueCents(
  copies: readonly ValuedCopy[],
): number {
  let total = 0;
  for (const copy of copies) {
    if (!Number.isInteger(copy.estimatedValueCents) || copy.estimatedValueCents < 0) {
      throw new Error("estimatedValueCents must be a non-negative integer");
    }
    if (copy.isPrimary) {
      total += copy.estimatedValueCents;
    }
  }
  return total;
}

/**
 * Adjust a reference price by completeness (0–100) and a simple condition factor.
 */
export function estimateCopyValueCents(
  referencePriceCents: number | null,
  completenessPercent: number,
  conditionFactor: number = 1,
): number {
  if (referencePriceCents === null) {
    return 0;
  }
  if (!Number.isInteger(referencePriceCents) || referencePriceCents < 0) {
    throw new Error("referencePriceCents must be a non-negative integer");
  }
  if (
    !Number.isInteger(completenessPercent) ||
    completenessPercent < 0 ||
    completenessPercent > 100
  ) {
    throw new Error("completenessPercent must be an integer 0–100");
  }
  if (conditionFactor < 0) {
    throw new Error("conditionFactor must be non-negative");
  }

  const completenessFactor = completenessPercent / 100;
  return Math.round(referencePriceCents * completenessFactor * conditionFactor);
}
