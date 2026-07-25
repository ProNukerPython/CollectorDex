import type {
  Authenticity,
  CompletenessSegment,
  ComponentImportance,
  CopyCondition,
  ListingStatus,
  MarketplacePlatform,
  NegotiationTone,
  WishlistPriority,
} from "@prisma/client";
import type { PriceVerdict } from "@/domain/calculations";

export const COPY_CONDITION_LABELS: Record<CopyCondition, string> = {
  SEALED: "Precintado",
  LIKE_NEW: "Como nuevo",
  VERY_GOOD: "Muy buen estado",
  GOOD: "Buen estado",
  ACCEPTABLE: "Aceptable",
  DAMAGED: "Deteriorado",
};

export const AUTHENTICITY_LABELS: Record<Authenticity, string> = {
  UNCHECKED: "No comprobada",
  PROBABLY_AUTHENTIC: "Probablemente auténtica",
  VERIFIED_AUTHENTIC: "Autenticidad verificada",
  DOUBTFUL: "Dudosa",
  REPRODUCTION: "Reproducción",
};

export const COMPONENT_PRESENCE_LABELS: Record<
  import("@prisma/client").ComponentPresence,
  string
> = {
  PRESENT: "Presente",
  ABSENT: "Ausente",
  UNKNOWN: "Desconocido",
  REPLACEMENT: "Reemplazo / reproducción",
};

export const COMPLETENESS_DESCRIPTOR_LABELS: Record<
  import("@prisma/client").CompletenessDescriptor,
  string
> = {
  COMPLETE: "Completa",
  ALMOST_COMPLETE: "Casi completa",
  PARTIAL: "Parcial",
  GAME_ONLY: "Solo juego",
  NO_CHECKLIST: "Sin checklist",
};

export const WISHLIST_PRIORITY_LABELS: Record<WishlistPriority, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  IMMEDIATE: "Oportunidad inmediata",
};

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  ACTIVE: "Activo",
  NEGOTIATING: "Negociando",
  PURCHASED: "Comprado",
  DISCARDED: "Descartado",
  SOLD: "Vendido",
  EXPIRED: "Caducado",
};

export const MARKETPLACE_LABELS: Record<MarketplacePlatform, string> = {
  WALLAPOP: "Wallapop",
  VINTED: "Vinted",
  EBAY: "eBay",
  STORE: "Tienda",
  PRIVATE: "Particular",
  OTHER: "Otro",
};

export const COMPLETENESS_SEGMENT_LABELS: Record<CompletenessSegment, string> = {
  LOOSE: "Suelto",
  CIB_PARTIAL: "Caja incompleta",
  CIB_COMPLETE: "Completo en caja",
  SEALED: "Precintado",
};

export const NEGOTIATION_TONE_LABELS: Record<NegotiationTone, string> = {
  FRIENDLY: "Amistoso",
  DIRECT: "Directo",
  INFORMED_COLLECTOR: "Coleccionista informado",
  BRIEF: "Breve",
};

export const PRICE_VERDICT_LABELS: Record<PriceVerdict, string> = {
  STEAL: "Chollo",
  GREAT: "Muy buen precio",
  FAIR: "Precio correcto",
  EXPENSIVE: "Caro",
  VERY_EXPENSIVE: "Muy caro",
};

export const COMPONENT_IMPORTANCE_LABELS: Record<ComponentImportance, string> = {
  CRITICAL: "Crítico",
  HIGH: "Alto",
  MEDIUM: "Medio",
  LOW: "Bajo",
  OPTIONAL: "Opcional",
};
