import type {
  CopyCondition,
  Prisma,
  WishlistPriority,
} from "@prisma/client";
import { Prisma as PrismaNamespace } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { WishlistFilters, WishlistFormValues } from "@/schemas/wishlist";

export class WishlistServiceError extends Error {
  constructor(
    message: string,
    readonly code:
      | "NOT_FOUND"
      | "FORBIDDEN"
      | "VALIDATION"
      | "CONFLICT" = "VALIDATION",
  ) {
    super(message);
    this.name = "WishlistServiceError";
  }
}

export type WishlistEntryItem = {
  id: string;
  gameEditionId: string;
  editionSlug: string;
  gameName: string;
  editionName: string;
  editionLabel: string;
  imageUrl: string | null;
  platformName: string;
  platformSlug: string;
  generation: number;
  regionName: string;
  language: string;
  priority: WishlistPriority;
  targetPriceCents: number | null;
  maxPriceCents: number | null;
  currency: string;
  minCondition: CopyCondition | null;
  requiredComponents: string[];
  notes: string | null;
  updatedAt: Date;
  isOwnedPrimary: boolean;
};

export type WishlistFormOption = {
  id: string;
  label: string;
  gameName: string;
  editionName: string;
  editionSlug: string;
  regionName: string;
  language: string;
  isOwnedPrimary: boolean;
  checklist: Array<{
    componentDefinitionId: string;
    name: string;
    isRequired: boolean;
  }>;
};

export type WishlistFormData = {
  entry: {
    id: string;
    gameEditionId: string;
    priority: WishlistPriority;
    targetPriceCents: number | null;
    maxPriceCents: number | null;
    minCondition: CopyCondition | null;
    desiredRegion: string;
    notes: string;
    requiredComponentIds: string[];
  } | null;
  editions: WishlistFormOption[];
};

const priorityRank: Record<WishlistPriority, number> = {
  IMMEDIATE: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

function isUniqueConstraintError(error: unknown) {
  return (
    error instanceof PrismaNamespace.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function normalizeText(value: string) {
  return value.toLocaleLowerCase("es");
}

function matchesFilters(item: WishlistEntryItem, filters: WishlistFilters) {
  if (filters.q) {
    const q = normalizeText(filters.q);
    const haystack = normalizeText(
      `${item.gameName} ${item.editionName} ${item.editionLabel}`,
    );
    if (!haystack.includes(q)) return false;
  }
  if (filters.priority && item.priority !== filters.priority) return false;
  if (filters.generation !== null && item.generation !== filters.generation) {
    return false;
  }
  if (filters.platformSlug && item.platformSlug !== filters.platformSlug) {
    return false;
  }
  if (filters.minCondition && item.minCondition !== filters.minCondition) {
    return false;
  }
  if (filters.withMaxPrice && item.maxPriceCents === null) return false;
  return true;
}

function sortItems(items: WishlistEntryItem[], filters: WishlistFilters) {
  items.sort((a, b) => {
    switch (filters.sort) {
      case "updated_desc":
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      case "target_price":
        return (
          (a.targetPriceCents ?? Number.POSITIVE_INFINITY) -
          (b.targetPriceCents ?? Number.POSITIVE_INFINITY)
        );
      case "max_price":
        return (
          (a.maxPriceCents ?? Number.POSITIVE_INFINITY) -
          (b.maxPriceCents ?? Number.POSITIVE_INFINITY)
        );
      case "generation":
        return a.generation - b.generation || a.gameName.localeCompare(b.gameName, "es");
      case "name":
        return a.gameName.localeCompare(b.gameName, "es");
      case "priority":
      default:
        return (
          priorityRank[a.priority] - priorityRank[b.priority] ||
          b.updatedAt.getTime() - a.updatedAt.getTime()
        );
    }
  });
}

export async function listWishlistEntries(userId: string, filters: WishlistFilters) {
  const [entries, ownedPrimaries] = await Promise.all([
    prisma.wishlistEntry.findMany({
      where: { userId },
      select: {
        id: true,
        gameEditionId: true,
        priority: true,
        targetPriceCents: true,
        maxPriceCents: true,
        currency: true,
        minCondition: true,
        requiredComponentIds: true,
        notes: true,
        updatedAt: true,
        gameEdition: {
          select: {
            slug: true,
            name: true,
            editionLabel: true,
            imageUrl: true,
            language: true,
            game: { select: { name: true, generation: true } },
            platform: { select: { name: true, slug: true } },
            region: { select: { name: true } },
            editionComponents: {
              select: {
                componentDefinitionId: true,
                componentDefinition: { select: { name: true } },
              },
            },
          },
        },
      },
    }),
    prisma.ownedCopy.findMany({
      where: { userId, isPrimary: true },
      select: { gameEditionId: true },
    }),
  ]);

  const ownedPrimaryIds = new Set(
    ownedPrimaries.map((copy) => copy.gameEditionId),
  );
  const platforms = new Map<string, string>();
  const generations = new Set<number>();

  const items = entries.map((entry) => {
    platforms.set(
      entry.gameEdition.platform.slug,
      entry.gameEdition.platform.name,
    );
    generations.add(entry.gameEdition.game.generation);
    const componentNames = new Map(
      entry.gameEdition.editionComponents.map((component) => [
        component.componentDefinitionId,
        component.componentDefinition.name,
      ]),
    );

    return {
      id: entry.id,
      gameEditionId: entry.gameEditionId,
      editionSlug: entry.gameEdition.slug,
      gameName: entry.gameEdition.game.name,
      editionName: entry.gameEdition.name,
      editionLabel: entry.gameEdition.editionLabel,
      imageUrl: entry.gameEdition.imageUrl,
      platformName: entry.gameEdition.platform.name,
      platformSlug: entry.gameEdition.platform.slug,
      generation: entry.gameEdition.game.generation,
      regionName: entry.gameEdition.region.name,
      language: entry.gameEdition.language,
      priority: entry.priority,
      targetPriceCents: entry.targetPriceCents,
      maxPriceCents: entry.maxPriceCents,
      currency: entry.currency,
      minCondition: entry.minCondition,
      requiredComponents: entry.requiredComponentIds
        .map((id) => componentNames.get(id))
        .filter((name): name is string => Boolean(name)),
      notes: entry.notes,
      updatedAt: entry.updatedAt,
      isOwnedPrimary: ownedPrimaryIds.has(entry.gameEditionId),
    } satisfies WishlistEntryItem;
  });

  const filtered = items.filter((item) => matchesFilters(item, filters));
  sortItems(filtered, filters);

  return {
    items: filtered,
    platforms: [...platforms.entries()]
      .map(([slug, name]) => ({ slug, name }))
      .sort((a, b) => a.name.localeCompare(b.name, "es")),
    generations: [...generations].sort((a, b) => a - b),
    filters,
  };
}

export async function getWishlistFormData(
  userId: string,
  entryId?: string,
  editionId?: string,
): Promise<WishlistFormData> {
  const [entry, editions, ownedPrimaries] = await Promise.all([
    entryId
      ? prisma.wishlistEntry.findUnique({
          where: { id: entryId },
          select: {
            id: true,
            userId: true,
            gameEditionId: true,
            priority: true,
            targetPriceCents: true,
            maxPriceCents: true,
            minCondition: true,
            desiredRegion: true,
            notes: true,
            requiredComponentIds: true,
          },
        })
      : null,
    prisma.gameEdition.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        editionLabel: true,
        language: true,
        game: { select: { name: true } },
        platform: { select: { name: true } },
        region: { select: { name: true } },
        editionComponents: {
          select: {
            componentDefinitionId: true,
            isRequired: true,
            componentDefinition: { select: { name: true } },
          },
          orderBy: [{ sortOrder: "asc" }, { weight: "desc" }],
        },
      },
      orderBy: [{ game: { generation: "asc" } }, { name: "asc" }],
    }),
    prisma.ownedCopy.findMany({
      where: { userId, isPrimary: true },
      select: { gameEditionId: true },
    }),
  ]);

  if (entryId && !entry) {
    throw new WishlistServiceError("Entrada no encontrada", "NOT_FOUND");
  }
  if (entry && entry.userId !== userId) {
    throw new WishlistServiceError("No tienes acceso a esta entrada", "FORBIDDEN");
  }

  const ownedPrimaryIds = new Set(
    ownedPrimaries.map((copy) => copy.gameEditionId),
  );
  const selectedEditionId = entry?.gameEditionId ?? editionId;

  return {
    entry: entry
      ? {
          id: entry.id,
          gameEditionId: entry.gameEditionId,
          priority: entry.priority,
          targetPriceCents: entry.targetPriceCents,
          maxPriceCents: entry.maxPriceCents,
          minCondition: entry.minCondition,
          desiredRegion: entry.desiredRegion ?? "",
          notes: entry.notes ?? "",
          requiredComponentIds: entry.requiredComponentIds,
        }
      : selectedEditionId
        ? {
            id: "",
            gameEditionId: selectedEditionId,
            priority: "MEDIUM",
            targetPriceCents: null,
            maxPriceCents: null,
            minCondition: null,
            desiredRegion: "",
            notes: "",
            requiredComponentIds: [],
          }
        : null,
    editions: editions.map((edition) => ({
      id: edition.id,
      label: `${edition.game.name} · ${edition.platform.name} · ${edition.region.name}`,
      gameName: edition.game.name,
      editionName: edition.name,
      editionSlug: edition.slug,
      regionName: edition.region.name,
      language: edition.language,
      isOwnedPrimary: ownedPrimaryIds.has(edition.id),
      checklist: edition.editionComponents.map((component) => ({
        componentDefinitionId: component.componentDefinitionId,
        name: component.componentDefinition.name,
        isRequired: component.isRequired,
      })),
    })),
  };
}

async function validateInput(userId: string, input: WishlistFormValues) {
  const edition = await prisma.gameEdition.findUnique({
    where: { id: input.gameEditionId },
    select: {
      id: true,
      slug: true,
      editionComponents: {
        select: { componentDefinitionId: true },
      },
      ownedCopies: {
        where: { userId, isPrimary: true },
        select: { id: true },
      },
    },
  });
  if (!edition) {
    throw new WishlistServiceError("Edición no encontrada", "NOT_FOUND");
  }
  if (edition.ownedCopies.length > 0 && !input.allowOwnedPrimary) {
    throw new WishlistServiceError(
      "Ya tienes esta edición como copia principal. Confirma que buscas una segunda copia o mejora.",
      "VALIDATION",
    );
  }

  const allowedComponents = new Set(
    edition.editionComponents.map((component) => component.componentDefinitionId),
  );
  const invalidComponent = input.requiredComponentIds.find(
    (id) => !allowedComponents.has(id),
  );
  if (invalidComponent) {
    throw new WishlistServiceError(
      "Algún componente no pertenece al checklist de la edición",
      "VALIDATION",
    );
  }

  return edition;
}

export async function createWishlistEntry(
  userId: string,
  input: WishlistFormValues,
) {
  const edition = await validateInput(userId, input);
  try {
    return await prisma.wishlistEntry.create({
      data: {
        userId,
        gameEditionId: input.gameEditionId,
        priority: input.priority,
        targetPriceCents: input.targetPriceEuros,
        maxPriceCents: input.maxPriceEuros,
        currency: input.currency,
        minCondition: input.minCondition ?? null,
        desiredRegion: input.desiredRegion ?? null,
        notes: input.notes ?? null,
        requiredComponentIds: [...new Set(input.requiredComponentIds)],
      },
      select: { id: true, gameEdition: { select: { slug: true } } },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new WishlistServiceError(
        "Esta edición ya está en tu wishlist",
        "CONFLICT",
      );
    }
    throw error;
  } finally {
    void edition;
  }
}

export async function updateWishlistEntry(
  userId: string,
  entryId: string,
  input: WishlistFormValues,
) {
  const existing = await prisma.wishlistEntry.findUnique({
    where: { id: entryId },
    select: { userId: true, gameEditionId: true },
  });
  if (!existing) {
    throw new WishlistServiceError("Entrada no encontrada", "NOT_FOUND");
  }
  if (existing.userId !== userId) {
    throw new WishlistServiceError("No tienes acceso a esta entrada", "FORBIDDEN");
  }
  if (existing.gameEditionId !== input.gameEditionId) {
    throw new WishlistServiceError(
      "La edición no se puede cambiar al editar",
      "VALIDATION",
    );
  }

  await validateInput(userId, input);
  return prisma.wishlistEntry.update({
    where: { id: entryId },
    data: {
      priority: input.priority,
      targetPriceCents: input.targetPriceEuros,
      maxPriceCents: input.maxPriceEuros,
      currency: input.currency,
      minCondition: input.minCondition ?? null,
      desiredRegion: input.desiredRegion ?? null,
      notes: input.notes ?? null,
      requiredComponentIds: [...new Set(input.requiredComponentIds)],
    },
    select: { id: true, gameEdition: { select: { slug: true } } },
  });
}

export async function deleteWishlistEntry(userId: string, entryId: string) {
  const existing = await prisma.wishlistEntry.findUnique({
    where: { id: entryId },
    select: { userId: true, gameEdition: { select: { slug: true } } },
  });
  if (!existing) {
    throw new WishlistServiceError("Entrada no encontrada", "NOT_FOUND");
  }
  if (existing.userId !== userId) {
    throw new WishlistServiceError("No tienes acceso a esta entrada", "FORBIDDEN");
  }
  await prisma.wishlistEntry.delete({ where: { id: entryId } });
  return { editionSlug: existing.gameEdition.slug };
}

export async function getWishlistEntryForEdition(
  userId: string,
  gameEditionId: string,
) {
  return prisma.wishlistEntry.findUnique({
    where: { userId_gameEditionId: { userId, gameEditionId } },
    select: { id: true },
  });
}

export type WishlistTransactionClient = Prisma.TransactionClient;
