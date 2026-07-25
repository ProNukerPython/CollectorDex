/**
 * Collection progress as integer percent 0–100.
 */
export function collectionProgressPercent(
  ownedEditionCount: number,
  totalEditionCount: number,
): number {
  if (
    !Number.isInteger(ownedEditionCount) ||
    !Number.isInteger(totalEditionCount) ||
    ownedEditionCount < 0 ||
    totalEditionCount < 0
  ) {
    throw new Error("counts must be non-negative integers");
  }

  if (totalEditionCount === 0) {
    return 0;
  }

  const clampedOwned = Math.min(ownedEditionCount, totalEditionCount);
  return Math.round((clampedOwned / totalEditionCount) * 100);
}
