import type { ComponentImportance } from "@prisma/client";

export type SeedComponent = {
  slug: string;
  name: string;
  description?: string;
  importance: ComponentImportance;
};

export const seedComponents: SeedComponent[] = [
  { slug: "cartridge", name: "Cartucho", importance: "CRITICAL" },
  { slug: "disc", name: "Cartucho / juego", importance: "CRITICAL" },
  { slug: "outer-box", name: "Caja exterior", importance: "HIGH" },
  { slug: "big-outer-box", name: "Caja exterior grande", importance: "HIGH" },
  { slug: "standard-box", name: "Caja estándar", importance: "HIGH" },
  { slug: "inner-tray", name: "Bandeja interior", importance: "MEDIUM" },
  { slug: "inner-box", name: "Caja interior", importance: "MEDIUM" },
  { slug: "manual", name: "Manual", importance: "HIGH" },
  { slug: "pokewalker-manual", name: "Manual del Pokéwalker", importance: "MEDIUM" },
  { slug: "inserts", name: "Insertos publicitarios", importance: "LOW" },
  { slug: "map", name: "Mapa", importance: "MEDIUM" },
  { slug: "pokewalker", name: "Pokéwalker", importance: "HIGH" },
  { slug: "pokewalker-clip", name: "Clip del Pokéwalker", importance: "MEDIUM" },
  { slug: "transfer-pak", name: "Transfer Pak", importance: "OPTIONAL" },
  { slug: "wireless-adapter", name: "Wireless Adapter", importance: "HIGH" },
  { slug: "sleeve", name: "Funda", importance: "LOW" },
  { slug: "seal", name: "Precinto", importance: "MEDIUM" },
  { slug: "points-card", name: "Tarjeta de puntos", importance: "LOW" },
  { slug: "other", name: "Otros", importance: "OPTIONAL" },
];

export type EditionComponentSeed = {
  componentSlug: string;
  weight: number;
  isRequired?: boolean;
  sortOrder?: number;
  description?: string;
};

function withOrder(items: EditionComponentSeed[]): EditionComponentSeed[] {
  return items.map((item, index) => ({
    ...item,
    sortOrder: item.sortOrder ?? index,
  }));
}

/** Game Boy / GBC style CIB */
export const gameBoyComponents: EditionComponentSeed[] = withOrder([
  { componentSlug: "cartridge", weight: 4 },
  { componentSlug: "outer-box", weight: 3 },
  { componentSlug: "inner-tray", weight: 2 },
  { componentSlug: "manual", weight: 2 },
  { componentSlug: "inserts", weight: 1, isRequired: false },
]);

/** Default cartridge handheld (GBA/DS/3DS) */
export const defaultCartridgeComponents: EditionComponentSeed[] = withOrder([
  { componentSlug: "cartridge", weight: 4 },
  { componentSlug: "outer-box", weight: 3 },
  { componentSlug: "inner-tray", weight: 2 },
  { componentSlug: "manual", weight: 2 },
  { componentSlug: "inserts", weight: 1, isRequired: false },
]);

export const fireRedLeafGreenComponents: EditionComponentSeed[] = withOrder([
  { componentSlug: "cartridge", weight: 4 },
  { componentSlug: "outer-box", weight: 3, description: "Caja" },
  { componentSlug: "inner-tray", weight: 2 },
  { componentSlug: "manual", weight: 2 },
  { componentSlug: "inserts", weight: 1, isRequired: false },
  {
    componentSlug: "wireless-adapter",
    weight: 3,
    description: "Adaptador inalámbico incluido en la edición",
  },
]);

export const heartGoldSoulSilverComponents: EditionComponentSeed[] = withOrder([
  { componentSlug: "cartridge", weight: 4 },
  { componentSlug: "standard-box", weight: 2, description: "Caja estándar del cartucho" },
  { componentSlug: "manual", weight: 2 },
  { componentSlug: "inserts", weight: 1, isRequired: false },
  { componentSlug: "big-outer-box", weight: 3, description: "Caja exterior grande del set" },
  { componentSlug: "inner-tray", weight: 2 },
  { componentSlug: "pokewalker", weight: 3 },
  { componentSlug: "pokewalker-clip", weight: 1 },
  { componentSlug: "pokewalker-manual", weight: 1 },
]);

export const switchPhysicalComponents: EditionComponentSeed[] = withOrder([
  { componentSlug: "disc", weight: 4, description: "Cartucho Switch" },
  { componentSlug: "outer-box", weight: 3, description: "Caja" },
  { componentSlug: "inserts", weight: 1, isRequired: false },
]);
