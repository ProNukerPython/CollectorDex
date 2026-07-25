import { z } from "zod";
import { eurosToCents } from "@/domain/money/cents";
import { assertSafeUrl, sanitizeUrl } from "@/lib/urls";

const currencySchema = z.enum(["EUR", "USD", "GBP"]);
const conditionSchema = z.enum([
  "SEALED",
  "LIKE_NEW",
  "VERY_GOOD",
  "GOOD",
  "ACCEPTABLE",
  "DAMAGED",
]);
const authenticitySchema = z.enum([
  "UNCHECKED",
  "PROBABLY_AUTHENTIC",
  "VERIFIED_AUTHENTIC",
  "DOUBTFUL",
  "REPRODUCTION",
]);
const marketplaceSchema = z.enum([
  "WALLAPOP",
  "VINTED",
  "EBAY",
  "STORE",
  "PRIVATE",
  "OTHER",
]);
const presenceSchema = z.enum([
  "PRESENT",
  "ABSENT",
  "UNKNOWN",
  "REPLACEMENT",
]);

const optionalEuros = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((value, ctx) => {
    if (value === null || value === undefined || value === "") return null;
    const num = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(num) || num < 0) {
      ctx.addIssue({
        code: "custom",
        message: "El importe debe ser un número mayor o igual que 0",
      });
      return z.NEVER;
    }
    return eurosToCents(num);
  });

const optionalDate = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value, ctx) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      ctx.addIssue({ code: "custom", message: "Fecha no válida" });
      return z.NEVER;
    }
    const tomorrow = new Date();
    tomorrow.setHours(23, 59, 59, 999);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.getTime() > tomorrow.getTime()) {
      ctx.addIssue({
        code: "custom",
        message: "La fecha de compra no puede ser futura",
      });
      return z.NEVER;
    }
    return date;
  });

const componentInputSchema = z.object({
  componentDefinitionId: z.string().uuid(),
  presence: presenceSchema,
  condition: conditionSchema.nullable().optional(),
  notes: z.string().trim().max(500).nullable().optional(),
});

const photoUrlsSchema = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((value, ctx) => {
    const raw =
      typeof value === "string"
        ? value
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
        : (value ?? []);
    const urls: string[] = [];
    for (const item of raw) {
      const sanitized = sanitizeUrl(item);
      if (!sanitized) {
        ctx.addIssue({
          code: "custom",
          message: `URL de imagen no válida: ${item}`,
        });
        return z.NEVER;
      }
      urls.push(sanitized);
    }
    return urls;
  });

export const ownedCopyFormSchema = z.object({
  gameEditionId: z.string().uuid("Debes seleccionar una edición"),
  condition: conditionSchema,
  authenticity: authenticitySchema,
  regionLabel: z.string().trim().max(80).nullable().optional(),
  language: z.string().trim().min(2).max(16).default("es"),
  pricePaidEuros: optionalEuros,
  estimatedValueEuros: optionalEuros,
  currency: currencySchema.default("EUR"),
  purchasedAt: optionalDate,
  purchasePlatform: z.preprocess(
    (value) => (value === "" || value === undefined ? null : value),
    marketplaceSchema.nullable(),
  ),
  sellerName: z.string().trim().max(120).nullable().optional(),
  listingUrl: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value, ctx) => {
      if (!value) return null;
      try {
        return assertSafeUrl(value);
      } catch {
        ctx.addIssue({ code: "custom", message: "URL del anuncio no válida" });
        return z.NEVER;
      }
    }),
  serialNumber: z.string().trim().max(80).nullable().optional(),
  notes: z.string().trim().max(4000).nullable().optional(),
  isPrimary: z
    .union([z.boolean(), z.string(), z.null(), z.undefined()])
    .transform((value) => value === true || value === "true" || value === "on"),
  photoUrls: photoUrlsSchema,
  components: z.array(componentInputSchema).default([]),
});

export type OwnedCopyFormValues = z.infer<typeof ownedCopyFormSchema>;

export const collectionSearchParamsSchema = z.object({
  q: z.string().trim().max(120).optional().default(""),
  generation: z.coerce.number().int().min(1).max(9).optional().nullable(),
  platform: z.string().trim().max(64).optional().nullable(),
  region: z.string().trim().max(64).optional().nullable(),
  condition: conditionSchema.optional().nullable(),
  authenticity: authenticitySchema.optional().nullable(),
  completeness: z
    .enum(["complete", "almost", "partial", "game_only", "none"])
    .optional()
    .nullable(),
  primary: z.enum(["primary", "duplicates", "all"]).optional().default("all"),
  sort: z
    .enum([
      "purchased_desc",
      "name",
      "price_paid",
      "completeness",
      "condition",
      "estimated_value",
    ])
    .optional()
    .default("purchased_desc"),
  view: z.enum(["grid", "list"]).optional().default("grid"),
});

function emptyToNull(value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  return value;
}

export type CollectionFilters = {
  q: string;
  generation: number | null;
  platformSlug: string | null;
  regionSlug: string | null;
  condition: z.infer<typeof conditionSchema> | null;
  authenticity: z.infer<typeof authenticitySchema> | null;
  completeness:
    | "complete"
    | "almost"
    | "partial"
    | "game_only"
    | "none"
    | null;
  primary: "primary" | "duplicates" | "all";
  sort:
    | "purchased_desc"
    | "name"
    | "price_paid"
    | "completeness"
    | "condition"
    | "estimated_value";
  view: "grid" | "list";
};

export function parseCollectionFilters(
  raw: Record<string, string | string[] | undefined>,
): CollectionFilters {
  const normalized: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(raw)) {
    normalized[key] = Array.isArray(value) ? value[0] : value;
  }

  const parsed = collectionSearchParamsSchema.safeParse({
    q: normalized.q ?? "",
    generation: emptyToNull(normalized.generation),
    platform: emptyToNull(normalized.platform),
    region: emptyToNull(normalized.region),
    condition: emptyToNull(normalized.condition),
    authenticity: emptyToNull(normalized.authenticity),
    completeness: emptyToNull(normalized.completeness),
    primary: normalized.primary ?? "all",
    sort: normalized.sort ?? "purchased_desc",
    view: normalized.view ?? "grid",
  });

  const data = parsed.success
    ? parsed.data
    : collectionSearchParamsSchema.parse({});

  return {
    q: data.q,
    generation: data.generation ?? null,
    platformSlug: data.platform ?? null,
    regionSlug: data.region ?? null,
    condition: data.condition ?? null,
    authenticity: data.authenticity ?? null,
    completeness: data.completeness ?? null,
    primary: data.primary,
    sort: data.sort,
    view: data.view,
  };
}

export function collectionFiltersToSearchParams(
  filters: CollectionFilters,
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.generation !== null) {
    params.set("generation", String(filters.generation));
  }
  if (filters.platformSlug) params.set("platform", filters.platformSlug);
  if (filters.regionSlug) params.set("region", filters.regionSlug);
  if (filters.condition) params.set("condition", filters.condition);
  if (filters.authenticity) params.set("authenticity", filters.authenticity);
  if (filters.completeness) params.set("completeness", filters.completeness);
  if (filters.primary !== "all") params.set("primary", filters.primary);
  if (filters.sort !== "purchased_desc") params.set("sort", filters.sort);
  if (filters.view !== "grid") params.set("view", filters.view);
  return params;
}
