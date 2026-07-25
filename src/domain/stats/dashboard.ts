import {
  collectionEstimatedValueCents,
  collectionProgressPercent,
  estimateCopyValueCents,
  savingsCents,
} from "@/domain/calculations";

export type GenerationProgress = {
  generation: number;
  total: number;
  owned: number;
  percent: number;
};

export type PlatformDistribution = {
  platformSlug: string;
  platformName: string;
  total: number;
  owned: number;
  percent: number;
};

export type DashboardProgressInput = {
  totalEditions: number;
  ownedEditionIds: ReadonlySet<string>;
  editions: ReadonlyArray<{
    id: string;
    generation: number;
    platformSlug: string;
    platformName: string;
  }>;
  primaryCopies: ReadonlyArray<{
    gameEditionId: string;
    isPrimary: boolean;
    completenessPercent: number | null;
    referencePriceCents: number | null;
    estimatedValueCents?: number | null;
  }>;
  investedCents: number;
};

export type DashboardProgressSummary = {
  totalEditions: number;
  ownedCount: number;
  pendingCount: number;
  progressPercent: number;
  investedCents: number;
  estimatedValueCents: number;
  valueDeltaCents: number;
  byGeneration: GenerationProgress[];
  byPlatform: PlatformDistribution[];
};

export function buildDashboardProgress(
  input: DashboardProgressInput,
): DashboardProgressSummary {
  const ownedCount = input.ownedEditionIds.size;
  const pendingCount = Math.max(input.totalEditions - ownedCount, 0);
  const progressPercent = collectionProgressPercent(
    ownedCount,
    input.totalEditions,
  );

  const estimatedValueCents = collectionEstimatedValueCents(
    input.primaryCopies.map((copy) => ({
      isPrimary: copy.isPrimary,
      estimatedValueCents:
        copy.estimatedValueCents ??
        estimateCopyValueCents(
          copy.referencePriceCents,
          copy.completenessPercent ?? 0,
        ),
    })),
  );

  const generationMap = new Map<number, { total: number; owned: number }>();
  const platformMap = new Map<
    string,
    { name: string; total: number; owned: number }
  >();

  for (const edition of input.editions) {
    const gen = generationMap.get(edition.generation) ?? { total: 0, owned: 0 };
    gen.total += 1;
    if (input.ownedEditionIds.has(edition.id)) {
      gen.owned += 1;
    }
    generationMap.set(edition.generation, gen);

    const plat = platformMap.get(edition.platformSlug) ?? {
      name: edition.platformName,
      total: 0,
      owned: 0,
    };
    plat.total += 1;
    if (input.ownedEditionIds.has(edition.id)) {
      plat.owned += 1;
    }
    platformMap.set(edition.platformSlug, plat);
  }

  const byGeneration: GenerationProgress[] = [...generationMap.entries()]
    .sort(([a], [b]) => a - b)
    .map(([generation, value]) => ({
      generation,
      total: value.total,
      owned: value.owned,
      percent: collectionProgressPercent(value.owned, value.total),
    }));

  const byPlatform: PlatformDistribution[] = [...platformMap.entries()]
    .sort((a, b) => a[1].name.localeCompare(b[1].name, "es"))
    .map(([platformSlug, value]) => ({
      platformSlug,
      platformName: value.name,
      total: value.total,
      owned: value.owned,
      percent: collectionProgressPercent(value.owned, value.total),
    }));

  return {
    totalEditions: input.totalEditions,
    ownedCount,
    pendingCount,
    progressPercent,
    investedCents: input.investedCents,
    estimatedValueCents,
    valueDeltaCents: savingsCents(estimatedValueCents, input.investedCents),
    byGeneration,
    byPlatform,
  };
}

export const WISHLIST_PRIORITY_ORDER = [
  "IMMEDIATE",
  "HIGH",
  "MEDIUM",
  "LOW",
] as const;
