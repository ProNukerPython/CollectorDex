import type {
  Authenticity,
  CompletenessDescriptor,
  ComponentPresence,
  CopyCondition,
  MarketplacePlatform,
  Prisma,
} from "@prisma/client";
import { calculateCopyCompleteness } from "@/domain/completeness/calculate";
import { estimateCopyValueCents } from "@/domain/calculations";
import { savingsOrOverpayCents } from "@/domain/money/cents";
import { prisma } from "@/lib/db";
import type { CollectionFilters, OwnedCopyFormValues } from "@/schemas/owned-copy";

export class CollectionServiceError extends Error {
  constructor(
    message: string,
    readonly code:
      | "NOT_FOUND"
      | "FORBIDDEN"
      | "VALIDATION"
      | "CONFLICT" = "VALIDATION",
  ) {
    super(message);
    this.name = "CollectionServiceError";
  }
}

export type CollectionListItem = {
  id: string;
  gameEditionId: string;
  editionSlug: string;
  gameName: string;
  imageUrl: string | null;
  platformName: string;
  regionName: string;
  generation: number;
  condition: CopyCondition;
  authenticity: Authenticity;
  pricePaidCents: number | null;
  estimatedValueCents: number | null;
  currency: string;
  completenessPercent: number | null;
  completenessDescriptor: CompletenessDescriptor;
  missingComponents: string[];
  purchasedAt: Date | null;
  isPrimary: boolean;
};

export async function listOwnedCopies(
  userId: string,
  filters: CollectionFilters,
): Promise<{
  items: CollectionListItem[];
  platforms: Array<{ slug: string; name: string }>;
  regions: Array<{ slug: string; name: string }>;
  generations: number[];
}> {
  const copies = await prisma.ownedCopy.findMany({
    where: { userId },
    include: {
      gameEdition: {
        include: {
          game: true,
          platform: true,
          region: true,
          editionComponents: {
            where: { isRequired: true },
            include: { componentDefinition: true },
          },
        },
      },
      components: {
        include: { componentDefinition: true },
      },
    },
  });

  const platforms = new Map<string, string>();
  const regions = new Map<string, string>();
  const generations = new Set<number>();

  let items: CollectionListItem[] = copies.map((copy) => {
    platforms.set(copy.gameEdition.platform.slug, copy.gameEdition.platform.name);
    regions.set(copy.gameEdition.region.slug, copy.gameEdition.region.name);
    generations.add(copy.gameEdition.game.generation);

    const presenceByComponent = new Map(
      copy.components.map((component) => [
        component.componentDefinitionId,
        component.presence,
      ]),
    );

    const completeness = calculateCopyCompleteness(
      copy.gameEdition.editionComponents.map((editionComponent) => ({
        id: editionComponent.componentDefinitionId,
        name: editionComponent.componentDefinition.name,
        weight: editionComponent.weight,
        isRequired: editionComponent.isRequired,
        presence:
          presenceByComponent.get(editionComponent.componentDefinitionId) ??
          "UNKNOWN",
      })),
    );

    const estimated =
      copy.estimatedValueCents ??
      estimateCopyValueCents(
        copy.gameEdition.referencePriceCents,
        completeness.percent ?? 0,
      );

    return {
      id: copy.id,
      gameEditionId: copy.gameEditionId,
      editionSlug: copy.gameEdition.slug,
      gameName: copy.gameEdition.game.name,
      imageUrl: copy.gameEdition.imageUrl,
      platformName: copy.gameEdition.platform.name,
      regionName: copy.gameEdition.region.name,
      generation: copy.gameEdition.game.generation,
      condition: copy.condition,
      authenticity: copy.authenticity,
      pricePaidCents: copy.pricePaidCents,
      estimatedValueCents: estimated,
      currency: copy.currency,
      completenessPercent: copy.completenessPercent ?? completeness.percent,
      completenessDescriptor: copy.completenessDescriptor,
      missingComponents: completeness.missingNames,
      purchasedAt: copy.purchasedAt,
      isPrimary: copy.isPrimary,
    };
  });

  items = items.filter((item) => {
    if (filters.q) {
      const q = filters.q.toLocaleLowerCase("es");
      if (!item.gameName.toLocaleLowerCase("es").includes(q)) return false;
    }
    if (filters.generation !== null && item.generation !== filters.generation) {
      return false;
    }
    if (filters.platformSlug) {
      const copy = copies.find((entry) => entry.id === item.id);
      if (copy?.gameEdition.platform.slug !== filters.platformSlug) return false;
    }
    if (filters.regionSlug) {
      const copy = copies.find((entry) => entry.id === item.id);
      if (copy?.gameEdition.region.slug !== filters.regionSlug) return false;
    }
    if (filters.condition && item.condition !== filters.condition) return false;
    if (filters.authenticity && item.authenticity !== filters.authenticity) {
      return false;
    }
    if (filters.primary === "primary" && !item.isPrimary) return false;
    if (filters.primary === "duplicates" && item.isPrimary) return false;
    if (filters.completeness) {
      const map = {
        complete: "COMPLETE",
        almost: "ALMOST_COMPLETE",
        partial: "PARTIAL",
        game_only: "GAME_ONLY",
        none: "NO_CHECKLIST",
      } as const;
      if (item.completenessDescriptor !== map[filters.completeness]) {
        return false;
      }
    }
    return true;
  });

  const conditionRank: Record<CopyCondition, number> = {
    SEALED: 0,
    LIKE_NEW: 1,
    VERY_GOOD: 2,
    GOOD: 3,
    ACCEPTABLE: 4,
    DAMAGED: 5,
  };

  items.sort((a, b) => {
    switch (filters.sort) {
      case "name":
        return a.gameName.localeCompare(b.gameName, "es");
      case "price_paid":
        return (b.pricePaidCents ?? -1) - (a.pricePaidCents ?? -1);
      case "completeness":
        return (b.completenessPercent ?? -1) - (a.completenessPercent ?? -1);
      case "condition":
        return conditionRank[a.condition] - conditionRank[b.condition];
      case "estimated_value":
        return (b.estimatedValueCents ?? -1) - (a.estimatedValueCents ?? -1);
      case "purchased_desc":
      default: {
        const aTime = a.purchasedAt?.getTime() ?? 0;
        const bTime = b.purchasedAt?.getTime() ?? 0;
        return bTime - aTime;
      }
    }
  });

  return {
    items,
    platforms: [...platforms.entries()]
      .map(([slug, name]) => ({ slug, name }))
      .sort((a, b) => a.name.localeCompare(b.name, "es")),
    regions: [...regions.entries()]
      .map(([slug, name]) => ({ slug, name }))
      .sort((a, b) => a.name.localeCompare(b.name, "es")),
    generations: [...generations].sort((a, b) => a - b),
  };
}

export async function getOwnedCopyDetail(userId: string, copyId: string) {
  const copy = await prisma.ownedCopy.findUnique({
    where: { id: copyId },
    include: {
      gameEdition: {
        include: {
          game: true,
          platform: true,
          region: true,
          editionComponents: {
            include: { componentDefinition: true },
            orderBy: [{ sortOrder: "asc" }, { weight: "desc" }],
          },
        },
      },
      components: {
        include: { componentDefinition: true },
      },
      purchases: {
        select: { id: true },
      },
    },
  });

  if (!copy) {
    throw new CollectionServiceError("Copia no encontrada", "NOT_FOUND");
  }
  if (copy.userId !== userId) {
    throw new CollectionServiceError("No tienes acceso a esta copia", "FORBIDDEN");
  }

  const presenceByComponent = new Map(
    copy.components.map((component) => [
      component.componentDefinitionId,
      component,
    ]),
  );

  const checklist = copy.gameEdition.editionComponents.map((editionComponent) => {
    const owned = presenceByComponent.get(editionComponent.componentDefinitionId);
    return {
      editionComponentId: editionComponent.id,
      componentDefinitionId: editionComponent.componentDefinitionId,
      name: editionComponent.componentDefinition.name,
      description:
        editionComponent.description ??
        editionComponent.componentDefinition.description,
      weight: editionComponent.weight,
      isRequired: editionComponent.isRequired,
      sortOrder: editionComponent.sortOrder,
      presence: owned?.presence ?? ("UNKNOWN" as ComponentPresence),
      condition: owned?.condition ?? null,
      notes: owned?.notes ?? null,
    };
  });

  const completeness = calculateCopyCompleteness(
    checklist.map((item) => ({
      id: item.componentDefinitionId,
      name: item.name,
      weight: item.weight,
      isRequired: item.isRequired,
      presence: item.presence,
    })),
  );

  const estimatedValueCents =
    copy.estimatedValueCents ??
    estimateCopyValueCents(
      copy.gameEdition.referencePriceCents,
      completeness.percent ?? 0,
    );

  return {
    copy,
    checklist,
    completeness,
    estimatedValueCents,
    savingsCents: savingsOrOverpayCents(
      estimatedValueCents,
      copy.pricePaidCents,
    ),
    relatedPurchaseCount: copy.purchases.length,
  };
}

export async function getEditionChecklist(gameEditionId: string) {
  return prisma.editionComponent.findMany({
    where: { gameEditionId },
    include: { componentDefinition: true },
    orderBy: [{ sortOrder: "asc" }, { weight: "desc" }],
  });
}

export async function listEditionsForSelect() {
  return prisma.gameEdition.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      language: true,
      region: { select: { name: true, code: true } },
      game: { select: { name: true, generation: true } },
      platform: { select: { name: true } },
    },
    orderBy: [{ game: { generation: "asc" } }, { name: "asc" }],
  });
}

function buildCompletenessFromForm(
  expected: Awaited<ReturnType<typeof getEditionChecklist>>,
  components: OwnedCopyFormValues["components"],
) {
  const presenceMap = new Map(
    components.map((component) => [
      component.componentDefinitionId,
      component.presence,
    ]),
  );

  return calculateCopyCompleteness(
    expected.map((editionComponent) => ({
      id: editionComponent.componentDefinitionId,
      name: editionComponent.componentDefinition.name,
      weight: editionComponent.weight,
      isRequired: editionComponent.isRequired,
      presence: presenceMap.get(editionComponent.componentDefinitionId) ?? "UNKNOWN",
    })),
  );
}

async function ensurePrimaryExclusive(
  tx: Prisma.TransactionClient,
  userId: string,
  gameEditionId: string,
  copyId: string,
) {
  await tx.ownedCopy.updateMany({
    where: {
      userId,
      gameEditionId,
      isPrimary: true,
      NOT: { id: copyId },
    },
    data: { isPrimary: false },
  });
}

export async function createOwnedCopy(
  userId: string,
  input: OwnedCopyFormValues,
) {
  const edition = await prisma.gameEdition.findUnique({
    where: { id: input.gameEditionId },
  });
  if (!edition) {
    throw new CollectionServiceError("Edición no encontrada", "NOT_FOUND");
  }

  const expected = await getEditionChecklist(input.gameEditionId);
  const completeness = buildCompletenessFromForm(expected, input.components);

  const existingPrimary = await prisma.ownedCopy.findFirst({
    where: { userId, gameEditionId: input.gameEditionId, isPrimary: true },
    select: { id: true },
  });

  const shouldBePrimary = input.isPrimary || !existingPrimary;

  return prisma.$transaction(async (tx) => {
    // Create as non-primary first to satisfy the partial unique index, then promote.
    const created = await tx.ownedCopy.create({
      data: {
        userId,
        gameEditionId: input.gameEditionId,
        condition: input.condition,
        authenticity: input.authenticity,
        regionLabel: input.regionLabel ?? null,
        language: input.language,
        pricePaidCents: input.pricePaidEuros,
        estimatedValueCents: input.estimatedValueEuros,
        currency: input.currency,
        purchasedAt: input.purchasedAt,
        purchasePlatform: (input.purchasePlatform ??
          null) as MarketplacePlatform | null,
        sellerName: input.sellerName ?? null,
        listingUrl: input.listingUrl,
        serialNumber: input.serialNumber ?? null,
        notes: input.notes ?? null,
        photoUrls: input.photoUrls ?? [],
        isPrimary: false,
        completenessPercent: completeness.percent,
        completenessDescriptor: completeness.descriptor,
        components: {
          create: expected.map((editionComponent) => {
            const fromForm = input.components.find(
              (component) =>
                component.componentDefinitionId ===
                editionComponent.componentDefinitionId,
            );
            return {
              componentDefinitionId: editionComponent.componentDefinitionId,
              presence: fromForm?.presence ?? "UNKNOWN",
              condition: fromForm?.condition ?? null,
              notes: fromForm?.notes ?? null,
            };
          }),
        },
      },
    });

    if (shouldBePrimary) {
      await ensurePrimaryExclusive(
        tx,
        userId,
        input.gameEditionId,
        created.id,
      );
      return tx.ownedCopy.update({
        where: { id: created.id },
        data: { isPrimary: true },
      });
    }

    return created;
  });
}

export async function updateOwnedCopy(
  userId: string,
  copyId: string,
  input: OwnedCopyFormValues,
) {
  const existing = await prisma.ownedCopy.findUnique({ where: { id: copyId } });
  if (!existing) {
    throw new CollectionServiceError("Copia no encontrada", "NOT_FOUND");
  }
  if (existing.userId !== userId) {
    throw new CollectionServiceError("No tienes acceso a esta copia", "FORBIDDEN");
  }

  const expected = await getEditionChecklist(input.gameEditionId);
  const completeness = buildCompletenessFromForm(expected, input.components);

  return prisma.$transaction(async (tx) => {
    await tx.ownedCopyComponent.deleteMany({ where: { ownedCopyId: copyId } });

    // Temporarily clear primary to allow exclusive reassignment under the partial unique index.
    await tx.ownedCopy.update({
      where: { id: copyId },
      data: { isPrimary: false },
    });

    const updated = await tx.ownedCopy.update({
      where: { id: copyId },
      data: {
        gameEditionId: input.gameEditionId,
        condition: input.condition,
        authenticity: input.authenticity,
        regionLabel: input.regionLabel ?? null,
        language: input.language,
        pricePaidCents: input.pricePaidEuros,
        estimatedValueCents: input.estimatedValueEuros,
        currency: input.currency,
        purchasedAt: input.purchasedAt,
        purchasePlatform: (input.purchasePlatform ??
          null) as MarketplacePlatform | null,
        sellerName: input.sellerName ?? null,
        listingUrl: input.listingUrl,
        serialNumber: input.serialNumber ?? null,
        notes: input.notes ?? null,
        photoUrls: input.photoUrls ?? [],
        completenessPercent: completeness.percent,
        completenessDescriptor: completeness.descriptor,
        components: {
          create: expected.map((editionComponent) => {
            const fromForm = input.components.find(
              (component) =>
                component.componentDefinitionId ===
                editionComponent.componentDefinitionId,
            );
            return {
              componentDefinitionId: editionComponent.componentDefinitionId,
              presence: fromForm?.presence ?? "UNKNOWN",
              condition: fromForm?.condition ?? null,
              notes: fromForm?.notes ?? null,
            };
          }),
        },
      },
    });

    if (input.isPrimary) {
      await ensurePrimaryExclusive(tx, userId, input.gameEditionId, copyId);
      return tx.ownedCopy.update({
        where: { id: copyId },
        data: { isPrimary: true },
      });
    }

    const other = await tx.ownedCopy.findFirst({
      where: {
        userId,
        gameEditionId: input.gameEditionId,
        NOT: { id: copyId },
      },
      orderBy: { createdAt: "asc" },
    });
    if (other) {
      await ensurePrimaryExclusive(tx, userId, input.gameEditionId, other.id);
      await tx.ownedCopy.update({
        where: { id: other.id },
        data: { isPrimary: true },
      });
    }

    return updated;
  });
}

export async function setOwnedCopyPrimary(userId: string, copyId: string) {
  const copy = await prisma.ownedCopy.findUnique({ where: { id: copyId } });
  if (!copy) {
    throw new CollectionServiceError("Copia no encontrada", "NOT_FOUND");
  }
  if (copy.userId !== userId) {
    throw new CollectionServiceError("No tienes acceso a esta copia", "FORBIDDEN");
  }

  return prisma.$transaction(async (tx) => {
    await ensurePrimaryExclusive(tx, userId, copy.gameEditionId, copyId);
    return tx.ownedCopy.update({
      where: { id: copyId },
      data: { isPrimary: true },
    });
  });
}

export async function deleteOwnedCopy(userId: string, copyId: string) {
  const copy = await prisma.ownedCopy.findUnique({
    where: { id: copyId },
    include: {
      components: true,
      purchases: { select: { id: true } },
    },
  });
  if (!copy) {
    throw new CollectionServiceError("Copia no encontrada", "NOT_FOUND");
  }
  if (copy.userId !== userId) {
    throw new CollectionServiceError("No tienes acceso a esta copia", "FORBIDDEN");
  }

  await prisma.$transaction(async (tx) => {
    // Detach purchases (SetNull) then delete copy (cascades components)
    await tx.purchase.updateMany({
      where: { ownedCopyId: copyId },
      data: { ownedCopyId: null },
    });
    await tx.ownedCopy.delete({ where: { id: copyId } });

    if (copy.isPrimary) {
      const next = await tx.ownedCopy.findFirst({
        where: { userId, gameEditionId: copy.gameEditionId },
        orderBy: { createdAt: "asc" },
      });
      if (next) {
        await tx.ownedCopy.update({
          where: { id: next.id },
          data: { isPrimary: true },
        });
      }
    }
  });

  return {
    deletedComponentCount: copy.components.length,
    detachedPurchaseCount: copy.purchases.length,
  };
}

export async function listCopiesForEdition(userId: string, gameEditionId: string) {
  return prisma.ownedCopy.findMany({
    where: { userId, gameEditionId },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
    select: {
      id: true,
      condition: true,
      authenticity: true,
      completenessPercent: true,
      completenessDescriptor: true,
      isPrimary: true,
      pricePaidCents: true,
      purchasedAt: true,
    },
  });
}
