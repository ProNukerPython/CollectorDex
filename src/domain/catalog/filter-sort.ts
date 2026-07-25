import type {
  CatalogEditionItem,
  CatalogFilters,
  CatalogSort,
  CollectionStatus,
} from "./types";

export function matchesCatalogFilters(
  item: CatalogEditionItem,
  filters: CatalogFilters,
): boolean {
  if (filters.q) {
    const query = filters.q.toLocaleLowerCase("es");
    const haystack = `${item.gameName} ${item.name} ${item.versionLabel ?? ""}`
      .toLocaleLowerCase("es");
    if (!haystack.includes(query)) {
      return false;
    }
  }

  if (filters.generation !== null && item.generation !== filters.generation) {
    return false;
  }

  if (
    filters.platformSlug !== null &&
    item.platformSlug !== filters.platformSlug
  ) {
    return false;
  }

  if (filters.regionSlug !== null && item.regionSlug !== filters.regionSlug) {
    return false;
  }

  if (filters.status !== null && item.status !== filters.status) {
    return false;
  }

  const price = item.referencePriceCents;
  if (filters.minPriceCents !== null) {
    if (price === null || price < filters.minPriceCents) {
      return false;
    }
  }
  if (filters.maxPriceCents !== null) {
    if (price === null || price > filters.maxPriceCents) {
      return false;
    }
  }

  return true;
}

export function sortCatalogItems(
  items: readonly CatalogEditionItem[],
  sort: CatalogSort,
): CatalogEditionItem[] {
  const copy = [...items];
  const statusRank: Record<CollectionStatus, number> = {
    owned: 0,
    wishlist: 1,
    pending: 2,
  };

  copy.sort((a, b) => {
    switch (sort) {
      case "name":
        return a.gameName.localeCompare(b.gameName, "es");
      case "generation":
        return a.generation - b.generation || a.gameName.localeCompare(b.gameName, "es");
      case "price_asc":
        return (a.referencePriceCents ?? Number.POSITIVE_INFINITY) -
          (b.referencePriceCents ?? Number.POSITIVE_INFINITY);
      case "price_desc":
        return (b.referencePriceCents ?? -1) - (a.referencePriceCents ?? -1);
      case "owned_first":
        return statusRank[a.status] - statusRank[b.status] ||
          a.gameName.localeCompare(b.gameName, "es");
      case "pending_first":
        return statusRank[b.status] - statusRank[a.status] ||
          a.gameName.localeCompare(b.gameName, "es");
      default: {
        const _exhaustive: never = sort;
        return _exhaustive;
      }
    }
  });

  return copy;
}

export function filterAndSortCatalog(
  items: readonly CatalogEditionItem[],
  filters: CatalogFilters,
): CatalogEditionItem[] {
  const filtered = items.filter((item) => matchesCatalogFilters(item, filters));
  return sortCatalogItems(filtered, filters.sort);
}
