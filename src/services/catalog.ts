import type {
  CompletenessSegment,
  ComponentImportance,
  ListingStatus,
  MarketplacePlatform,
} from "@prisma/client";
import { filterAndSortCatalog } from "@/domain/catalog/filter-sort";
import type {
  CatalogEditionItem,
  CatalogFilters,
  CollectionStatus,
} from "@/domain/catalog/types";
import { prisma } from "@/lib/db";

export type CatalogFacetOption = {
  slug: string;
  name: string;
};

export type CatalogPageData = {
  items: CatalogEditionItem[];
  totalUnfiltered: number;
  platforms: CatalogFacetOption[];
  regions: CatalogFacetOption[];
  generations: number[];
  filters: CatalogFilters;
};

export async function getCatalogPageData(
  userId: string,
  filters: CatalogFilters,
): Promise<CatalogPageData> {
  const [editions, ownedCopies, wishlistEntries, platforms, regions] =
    await Promise.all([
      prisma.gameEdition.findMany({
        select: {
          id: true,
          slug: true,
          name: true,
          versionLabel: true,
          editionLabel: true,
          imageUrl: true,
          language: true,
          referencePriceCents: true,
          targetPriceCents: true,
          maxPriceCents: true,
          currency: true,
          isIndicativePricing: true,
          game: {
            select: {
              name: true,
              generation: true,
              releaseYear: true,
            },
          },
          platform: { select: { name: true, slug: true } },
          region: { select: { name: true, slug: true } },
        },
        orderBy: [{ game: { generation: "asc" } }, { name: "asc" }],
      }),
      prisma.ownedCopy.findMany({
        where: { userId },
        select: {
          gameEditionId: true,
          isPrimary: true,
          completenessPercent: true,
        },
      }),
      prisma.wishlistEntry.findMany({
        where: { userId },
        select: { id: true, gameEditionId: true, priority: true },
      }),
      prisma.platform.findMany({
        select: { slug: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.region.findMany({
        select: { slug: true, name: true },
        orderBy: { name: "asc" },
      }),
    ]);

  const completenessByEdition = new Map<string, number>();
  const ownedIds = new Set<string>();
  for (const copy of ownedCopies) {
    ownedIds.add(copy.gameEditionId);
    if (copy.isPrimary) {
      const current = completenessByEdition.get(copy.gameEditionId) ?? 0;
      if (copy.completenessPercent !== null) {
        completenessByEdition.set(
          copy.gameEditionId,
          Math.max(current, copy.completenessPercent),
        );
      }
    }
  }

  const wishlistByEdition = new Map(
    wishlistEntries.map((entry) => [entry.gameEditionId, entry]),
  );

  const items: CatalogEditionItem[] = editions.map((edition) => {
    const wishlistEntry = wishlistByEdition.get(edition.id);
    const isOwned = ownedIds.has(edition.id);
    const isWishlisted = Boolean(wishlistEntry);
    let status: CollectionStatus = "pending";
    if (isOwned) {
      status = "owned";
    } else if (isWishlisted) {
      status = "wishlist";
    }

    return {
      id: edition.id,
      slug: edition.slug,
      name: edition.name,
      versionLabel: edition.versionLabel,
      editionLabel: edition.editionLabel,
      imageUrl: edition.imageUrl,
      language: edition.language,
      generation: edition.game.generation,
      releaseYear: edition.game.releaseYear,
      gameName: edition.game.name,
      platformName: edition.platform.name,
      platformSlug: edition.platform.slug,
      regionName: edition.region.name,
      regionSlug: edition.region.slug,
      referencePriceCents: edition.referencePriceCents,
      targetPriceCents: edition.targetPriceCents,
      maxPriceCents: edition.maxPriceCents,
      currency: edition.currency,
      isIndicativePricing: edition.isIndicativePricing,
      status,
      isOwned,
      isWishlisted,
      wishlistEntryId: wishlistEntry?.id ?? null,
      wishlistPriority: wishlistEntry?.priority ?? null,
      completenessPercent: completenessByEdition.get(edition.id) ?? null,
    };
  });

  const filtered = filterAndSortCatalog(items, filters);
  const generations = [...new Set(items.map((item) => item.generation))].sort(
    (a, b) => a - b,
  );

  return {
    items: filtered,
    totalUnfiltered: items.length,
    platforms,
    regions,
    generations,
    filters,
  };
}

export type EditionDetailData = {
  id: string;
  slug: string;
  name: string;
  versionLabel: string | null;
  editionLabel: string;
  imageUrl: string | null;
  language: string;
  description: string | null;
  referencePriceCents: number | null;
  targetPriceCents: number | null;
  maxPriceCents: number | null;
  currency: string;
  isIndicativePricing: boolean;
  gameName: string;
  generation: number;
  releaseYear: number | null;
  platformName: string;
  regionName: string;
  status: CollectionStatus;
  isOwned: boolean;
  isWishlisted: boolean;
  wishlistEntryId: string | null;
  wishlistPriority: import("@prisma/client").WishlistPriority | null;
  completenessPercent: number | null;
  components: Array<{
    id: string;
    name: string;
    weight: number;
    isRequired: boolean;
    importance: ComponentImportance;
  }>;
  listings: Array<{
    id: string;
    title: string;
    totalCents: number;
    currency: string;
    platform: MarketplacePlatform;
    status: ListingStatus;
    savedAt: Date;
    url: string;
  }>;
  priceHistory: Array<{
    id: string;
    observedAt: Date;
    priceCents: number;
    currency: string;
    completenessSegment: CompletenessSegment;
    platform: MarketplacePlatform | null;
    isIndicative: boolean;
  }>;
  ownedCopies: Array<{
    id: string;
    condition: string;
    completenessPercent: number | null;
    isPrimary: boolean;
    pricePaidCents: number | null;
  }>;
};

export async function getEditionDetail(
  userId: string,
  slug: string,
): Promise<EditionDetailData | null> {
  const edition = await prisma.gameEdition.findUnique({
    where: { slug },
    include: {
      game: true,
      platform: true,
      region: true,
      editionComponents: {
        include: { componentDefinition: true },
        orderBy: { weight: "desc" },
      },
      listings: {
        where: { userId },
        orderBy: { savedAt: "desc" },
        take: 10,
      },
      priceObservations: {
        where: { userId },
        orderBy: { observedAt: "desc" },
        take: 20,
      },
      ownedCopies: {
        where: { userId },
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
      },
      wishlistEntries: {
        where: { userId },
        select: { id: true, priority: true },
        take: 1,
      },
    },
  });

  if (!edition) {
    return null;
  }

  const primaryCopy =
    edition.ownedCopies.find((copy) => copy.isPrimary) ??
    edition.ownedCopies[0] ??
    null;
  let status: CollectionStatus = "pending";
  if (edition.ownedCopies.length > 0) {
    status = "owned";
  } else if (edition.wishlistEntries.length > 0) {
    status = "wishlist";
  }
  const wishlistEntry = edition.wishlistEntries[0] ?? null;

  return {
    id: edition.id,
    slug: edition.slug,
    name: edition.name,
    versionLabel: edition.versionLabel,
    editionLabel: edition.editionLabel,
    imageUrl: edition.imageUrl,
    language: edition.language,
    description: edition.description,
    referencePriceCents: edition.referencePriceCents,
    targetPriceCents: edition.targetPriceCents,
    maxPriceCents: edition.maxPriceCents,
    currency: edition.currency,
    isIndicativePricing: edition.isIndicativePricing,
    gameName: edition.game.name,
    generation: edition.game.generation,
    releaseYear: edition.game.releaseYear,
    platformName: edition.platform.name,
    regionName: edition.region.name,
    status,
    isOwned: edition.ownedCopies.length > 0,
    isWishlisted: Boolean(wishlistEntry),
    wishlistEntryId: wishlistEntry?.id ?? null,
    wishlistPriority: wishlistEntry?.priority ?? null,
    completenessPercent: primaryCopy?.completenessPercent ?? null,
    components: edition.editionComponents.map((component) => ({
      id: component.id,
      name: component.componentDefinition.name,
      weight: component.weight,
      isRequired: component.isRequired,
      importance: component.componentDefinition.importance,
    })),
    listings: edition.listings.map((listing) => ({
      id: listing.id,
      title: listing.title,
      totalCents: listing.totalCents,
      currency: listing.currency,
      platform: listing.platform,
      status: listing.status,
      savedAt: listing.savedAt,
      url: listing.url,
    })),
    priceHistory: edition.priceObservations.map((observation) => ({
      id: observation.id,
      observedAt: observation.observedAt,
      priceCents: observation.priceCents,
      currency: observation.currency,
      completenessSegment: observation.completenessSegment,
      platform: observation.platform,
      isIndicative: observation.isIndicative,
    })),
    ownedCopies: edition.ownedCopies.map((copy) => ({
      id: copy.id,
      condition: copy.condition,
      completenessPercent: copy.completenessPercent,
      isPrimary: copy.isPrimary,
      pricePaidCents: copy.pricePaidCents,
    })),
  };
}
