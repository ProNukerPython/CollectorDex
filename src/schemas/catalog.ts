import { z } from "zod";
import type { CatalogFilters } from "@/domain/catalog/types";

const emptyToNull = (value: unknown) => {
  if (value === undefined || value === null || value === "") return null;
  return value;
};

export const catalogSearchParamsSchema = z.object({
  q: z.string().trim().max(120).optional().default(""),
  generation: z.preprocess(
    emptyToNull,
    z.coerce.number().int().min(1).max(9).nullable().optional().default(null),
  ),
  platform: z.preprocess(
    emptyToNull,
    z.string().trim().max(64).nullable().optional().default(null),
  ),
  region: z.preprocess(
    emptyToNull,
    z.string().trim().max(64).nullable().optional().default(null),
  ),
  status: z.preprocess(
    emptyToNull,
    z.enum(["owned", "wishlist", "pending"]).nullable().optional().default(null),
  ),
  minPrice: z.preprocess(
    emptyToNull,
    z.coerce.number().int().min(0).nullable().optional().default(null),
  ),
  maxPrice: z.preprocess(
    emptyToNull,
    z.coerce.number().int().min(0).nullable().optional().default(null),
  ),
  sort: z
    .enum([
      "name",
      "generation",
      "price_asc",
      "price_desc",
      "owned_first",
      "pending_first",
    ])
    .optional()
    .default("generation"),
  view: z.enum(["grid", "list"]).optional().default("grid"),
});

export type CatalogSearchParamsInput = z.infer<typeof catalogSearchParamsSchema>;

export function parseCatalogFilters(
  raw: Record<string, string | string[] | undefined>,
): CatalogFilters {
  const normalized: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(raw)) {
    normalized[key] = Array.isArray(value) ? value[0] : value;
  }

  const parsed = catalogSearchParamsSchema.safeParse(normalized);
  const data = parsed.success
    ? parsed.data
    : catalogSearchParamsSchema.parse({});

  const minEuros = data.minPrice;
  const maxEuros = data.maxPrice;

  return {
    q: data.q,
    generation: data.generation,
    platformSlug: data.platform,
    regionSlug: data.region,
    status: data.status,
    minPriceCents: minEuros === null ? null : minEuros * 100,
    maxPriceCents: maxEuros === null ? null : maxEuros * 100,
    sort: data.sort,
    view: data.view,
  };
}

export function catalogFiltersToSearchParams(
  filters: CatalogFilters,
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.generation !== null) {
    params.set("generation", String(filters.generation));
  }
  if (filters.platformSlug) params.set("platform", filters.platformSlug);
  if (filters.regionSlug) params.set("region", filters.regionSlug);
  if (filters.status) params.set("status", filters.status);
  if (filters.minPriceCents !== null) {
    params.set("minPrice", String(Math.round(filters.minPriceCents / 100)));
  }
  if (filters.maxPriceCents !== null) {
    params.set("maxPrice", String(Math.round(filters.maxPriceCents / 100)));
  }
  if (filters.sort !== "generation") params.set("sort", filters.sort);
  if (filters.view !== "grid") params.set("view", filters.view);
  return params;
}
