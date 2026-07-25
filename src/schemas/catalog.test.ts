import { describe, expect, it } from "vitest";
import {
  catalogFiltersToSearchParams,
  parseCatalogFilters,
} from "./catalog";

describe("parseCatalogFilters", () => {
  it("parses search params into typed filters", () => {
    const filters = parseCatalogFilters({
      q: "Soul",
      generation: "4",
      platform: "nintendo-ds",
      status: "wishlist",
      minPrice: "100",
      maxPrice: "500",
      sort: "price_desc",
      view: "list",
    });

    expect(filters.q).toBe("Soul");
    expect(filters.generation).toBe(4);
    expect(filters.platformSlug).toBe("nintendo-ds");
    expect(filters.status).toBe("wishlist");
    expect(filters.minPriceCents).toBe(10000);
    expect(filters.maxPriceCents).toBe(50000);
    expect(filters.sort).toBe("price_desc");
    expect(filters.view).toBe("list");
  });

  it("round-trips filters to URL search params", () => {
    const filters = parseCatalogFilters({
      q: "platino",
      generation: "4",
      sort: "owned_first",
      view: "list",
    });
    const params = catalogFiltersToSearchParams(filters);
    expect(params.get("q")).toBe("platino");
    expect(params.get("generation")).toBe("4");
    expect(params.get("sort")).toBe("owned_first");
    expect(params.get("view")).toBe("list");
  });
});
