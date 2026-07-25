import { z } from "zod";
import { parseEurosToCents } from "@/domain/money/cents";

export const wishlistPrioritySchema = z.enum([
  "LOW",
  "MEDIUM",
  "HIGH",
  "IMMEDIATE",
]);

export const wishlistConditionSchema = z.enum([
  "SEALED",
  "LIKE_NEW",
  "VERY_GOOD",
  "GOOD",
  "ACCEPTABLE",
  "DAMAGED",
]);

function emptyToNull(value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  return value;
}

const optionalEuroCents = z
  .preprocess(emptyToNull, z.union([z.string(), z.number()]).nullable())
  .transform((value, ctx) => {
    if (value === null) return null;
    try {
      return parseEurosToCents(String(value));
    } catch {
      ctx.addIssue({
        code: "custom",
        message: "Introduce un importe válido, por ejemplo 24,99",
      });
      return z.NEVER;
    }
  });

export const wishlistFormSchema = z
  .object({
    gameEditionId: z.string().uuid("Debes seleccionar una edición"),
    priority: wishlistPrioritySchema.default("MEDIUM"),
    targetPriceEuros: optionalEuroCents,
    maxPriceEuros: optionalEuroCents,
    currency: z.enum(["EUR"]).default("EUR"),
    minCondition: z.preprocess(
      emptyToNull,
      wishlistConditionSchema.nullable().optional().default(null),
    ),
    desiredRegion: z.string().trim().max(80).nullable().optional(),
    notes: z.string().trim().max(1200).nullable().optional(),
    requiredComponentIds: z.array(z.string().uuid()).default([]),
    allowOwnedPrimary: z
      .union([z.boolean(), z.string(), z.null(), z.undefined()])
      .transform((value) => value === true || value === "true" || value === "on"),
  })
  .superRefine((data, ctx) => {
    if (
      data.targetPriceEuros !== null &&
      data.maxPriceEuros !== null &&
      data.targetPriceEuros > data.maxPriceEuros
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["targetPriceEuros"],
        message: "El precio objetivo no puede superar el máximo",
      });
    }
  });

export type WishlistFormValues = z.infer<typeof wishlistFormSchema>;

export const wishlistSearchParamsSchema = z.object({
  q: z.string().trim().max(120).optional().default(""),
  priority: z.preprocess(
    emptyToNull,
    wishlistPrioritySchema.nullable().optional().default(null),
  ),
  generation: z.preprocess(
    emptyToNull,
    z.coerce.number().int().min(1).max(9).nullable().optional().default(null),
  ),
  platform: z.preprocess(
    emptyToNull,
    z.string().trim().max(64).nullable().optional().default(null),
  ),
  minCondition: z.preprocess(
    emptyToNull,
    wishlistConditionSchema.nullable().optional().default(null),
  ),
  withMaxPrice: z
    .union([z.literal("true"), z.literal("on"), z.literal("1")])
    .optional()
    .transform(Boolean),
  sort: z
    .enum([
      "priority",
      "updated_desc",
      "target_price",
      "max_price",
      "generation",
      "name",
    ])
    .optional()
    .default("priority"),
});

export type WishlistFilters = {
  q: string;
  priority: z.infer<typeof wishlistPrioritySchema> | null;
  generation: number | null;
  platformSlug: string | null;
  minCondition: z.infer<typeof wishlistConditionSchema> | null;
  withMaxPrice: boolean;
  sort:
    | "priority"
    | "updated_desc"
    | "target_price"
    | "max_price"
    | "generation"
    | "name";
};

export function parseWishlistFilters(
  raw: Record<string, string | string[] | undefined>,
): WishlistFilters {
  const normalized: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(raw)) {
    normalized[key] = Array.isArray(value) ? value[0] : value;
  }
  const parsed = wishlistSearchParamsSchema.safeParse(normalized);
  const data = parsed.success
    ? parsed.data
    : wishlistSearchParamsSchema.parse({});

  return {
    q: data.q,
    priority: data.priority,
    generation: data.generation,
    platformSlug: data.platform,
    minCondition: data.minCondition,
    withMaxPrice: data.withMaxPrice,
    sort: data.sort,
  };
}

export function wishlistFiltersToSearchParams(
  filters: WishlistFilters,
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.generation !== null) {
    params.set("generation", String(filters.generation));
  }
  if (filters.platformSlug) params.set("platform", filters.platformSlug);
  if (filters.minCondition) params.set("minCondition", filters.minCondition);
  if (filters.withMaxPrice) params.set("withMaxPrice", "true");
  if (filters.sort !== "priority") params.set("sort", filters.sort);
  return params;
}
