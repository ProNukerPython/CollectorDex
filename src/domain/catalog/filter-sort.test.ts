import { describe, expect, it } from "vitest";
import { filterAndSortCatalog, matchesCatalogFilters } from "./filter-sort";
import type { CatalogEditionItem, CatalogFilters } from "./types";

function item(
  overrides: Partial<CatalogEditionItem> & Pick<CatalogEditionItem, "id" | "gameName">,
): CatalogEditionItem {
  return {
    slug: overrides.id,
    name: `${overrides.gameName} (PAL España)`,
    versionLabel: null,
    editionLabel: "Estándar",
    imageUrl: null,
    language: "es",
    generation: 4,
    releaseYear: 2010,
    platformName: "Nintendo DS",
    platformSlug: "nintendo-ds",
    regionName: "PAL España",
    regionSlug: "pal-es",
    referencePriceCents: 20000,
    targetPriceCents: 15000,
    maxPriceCents: 25000,
    currency: "EUR",
    isIndicativePricing: true,
    status: "pending",
    isOwned: false,
    isWishlisted: false,
    wishlistEntryId: null,
    wishlistPriority: null,
    completenessPercent: null,
    ...overrides,
  };
}

const baseFilters: CatalogFilters = {
  q: "",
  generation: null,
  platformSlug: null,
  regionSlug: null,
  status: null,
  minPriceCents: null,
  maxPriceCents: null,
  sort: "name",
  view: "grid",
};

describe("matchesCatalogFilters", () => {
  it("filters by name query", () => {
    const soul = item({ id: "1", gameName: "Pokémon SoulSilver" });
    expect(
      matchesCatalogFilters(soul, { ...baseFilters, q: "soul" }),
    ).toBe(true);
    expect(
      matchesCatalogFilters(soul, { ...baseFilters, q: "cristal" }),
    ).toBe(false);
  });

  it("filters by collection status and price range", () => {
    const owned = item({
      id: "1",
      gameName: "Pokémon Platino",
      status: "owned",
      referencePriceCents: 22000,
    });
    expect(
      matchesCatalogFilters(owned, {
        ...baseFilters,
        status: "owned",
        minPriceCents: 20000,
        maxPriceCents: 30000,
      }),
    ).toBe(true);
    expect(
      matchesCatalogFilters(owned, {
        ...baseFilters,
        status: "pending",
      }),
    ).toBe(false);
  });
});

describe("filterAndSortCatalog", () => {
  const items = [
    item({
      id: "a",
      gameName: "Pokémon Azul",
      generation: 1,
      status: "owned",
      referencePriceCents: 17000,
    }),
    item({
      id: "b",
      gameName: "Pokémon SoulSilver",
      generation: 4,
      status: "wishlist",
      referencePriceCents: 48000,
    }),
    item({
      id: "c",
      gameName: "Pokémon Cristal",
      generation: 2,
      status: "pending",
      referencePriceCents: 28000,
    }),
  ];

  it("sorts owned first", () => {
    const result = filterAndSortCatalog(items, {
      ...baseFilters,
      sort: "owned_first",
    });
    expect(result.map((entry) => entry.id)).toEqual(["a", "b", "c"]);
  });

  it("sorts by price descending", () => {
    const result = filterAndSortCatalog(items, {
      ...baseFilters,
      sort: "price_desc",
    });
    expect(result.map((entry) => entry.id)).toEqual(["b", "c", "a"]);
  });

  it("combines generation filter and name sort", () => {
    const result = filterAndSortCatalog(items, {
      ...baseFilters,
      generation: 1,
      sort: "name",
    });
    expect(result).toHaveLength(1);
    expect(result[0]?.gameName).toBe("Pokémon Azul");
  });
});
