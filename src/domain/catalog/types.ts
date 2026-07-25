export type CollectionStatus = "owned" | "wishlist" | "pending";

export type CatalogSort =
  | "name"
  | "generation"
  | "price_asc"
  | "price_desc"
  | "owned_first"
  | "pending_first";

export type CatalogView = "grid" | "list";

export type CatalogFilters = {
  q: string;
  generation: number | null;
  platformSlug: string | null;
  regionSlug: string | null;
  status: CollectionStatus | null;
  minPriceCents: number | null;
  maxPriceCents: number | null;
  sort: CatalogSort;
  view: CatalogView;
};

export type CatalogEditionItem = {
  id: string;
  slug: string;
  name: string;
  versionLabel: string | null;
  editionLabel: string;
  imageUrl: string | null;
  language: string;
  generation: number;
  releaseYear: number | null;
  gameName: string;
  platformName: string;
  platformSlug: string;
  regionName: string;
  regionSlug: string;
  referencePriceCents: number | null;
  targetPriceCents: number | null;
  maxPriceCents: number | null;
  currency: string;
  isIndicativePricing: boolean;
  status: CollectionStatus;
  completenessPercent: number | null;
};
