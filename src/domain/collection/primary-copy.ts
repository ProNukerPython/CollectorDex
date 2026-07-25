/**
 * Pure helpers around primary-copy selection rules.
 */

export type PrimaryCopyCandidate = {
  id: string;
  gameEditionId: string;
  isPrimary: boolean;
};

/**
 * Returns the id that should become primary, and which existing primary
 * (same edition) must be demoted — if any.
 */
export function resolvePrimaryTransition(input: {
  editionId: string;
  copyId: string | null;
  makePrimary: boolean;
  existing: readonly PrimaryCopyCandidate[];
}): { nextPrimaryId: string | null; demoteIds: string[] } {
  if (!input.makePrimary) {
    return { nextPrimaryId: null, demoteIds: [] };
  }

  const demoteIds = input.existing
    .filter(
      (copy) =>
        copy.gameEditionId === input.editionId &&
        copy.isPrimary &&
        copy.id !== input.copyId,
    )
    .map((copy) => copy.id);

  return {
    nextPrimaryId: input.copyId,
    demoteIds,
  };
}

export function assertSinglePrimaryPerEdition(
  copies: readonly PrimaryCopyCandidate[],
): void {
  const counts = new Map<string, number>();
  for (const copy of copies) {
    if (!copy.isPrimary) continue;
    counts.set(copy.gameEditionId, (counts.get(copy.gameEditionId) ?? 0) + 1);
  }
  for (const [editionId, count] of counts) {
    if (count > 1) {
      throw new Error(
        `Edition ${editionId} has ${count} primary copies; expected at most 1`,
      );
    }
  }
}
