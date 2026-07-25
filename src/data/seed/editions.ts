import {
  defaultCartridgeComponents,
  fireRedLeafGreenComponents,
  gameBoyComponents,
  heartGoldSoulSilverComponents,
  switchPhysicalComponents,
  type EditionComponentSeed,
} from "./components";

export type SeedEdition = {
  gameSlug: string;
  gameName: string;
  generation: number;
  releaseYear: number;
  editionSlug: string;
  editionName: string;
  versionLabel?: string;
  platformSlug: string;
  regionSlug: string;
  language: string;
  productCode?: string;
  /** Indicative reference price in EUR cents — not live market data */
  referencePriceCents: number;
  targetPriceCents: number;
  maxPriceCents: number;
  components: EditionComponentSeed[];
  description?: string;
};

const platformMap = {
  gb: "game-boy",
  gbc: "game-boy-color",
  gba: "game-boy-advance",
  nds: "nintendo-ds",
  "3ds": "nintendo-3ds",
  switch: "nintendo-switch",
} as const;

function componentsFor(
  slug: string,
  platformKey: keyof typeof platformMap,
): EditionComponentSeed[] {
  if (platformKey === "switch") return switchPhysicalComponents;
  if (platformKey === "gb" || platformKey === "gbc") return gameBoyComponents;
  if (slug === "rojo-fuego" || slug === "verde-hoja") {
    return fireRedLeafGreenComponents;
  }
  return defaultCartridgeComponents;
}

function ed(
  slug: string,
  name: string,
  generation: number,
  releaseYear: number,
  platformKey: keyof typeof platformMap,
  referencePriceCents: number,
  targetPriceCents: number,
  maxPriceCents: number,
): SeedEdition {
  return {
    gameSlug: slug,
    gameName: name,
    generation,
    releaseYear,
    editionSlug: `${slug}-pal-es`,
    editionName: `${name} (PAL España)`,
    versionLabel: name.replace(/^Pokémon\s*/u, "") || name,
    platformSlug: platformMap[platformKey],
    regionSlug: "pal-es",
    language: "es",
    referencePriceCents,
    targetPriceCents,
    maxPriceCents,
    components: componentsFor(slug, platformKey),
    description: `Edición física principal — ${name}. Precios orientativos de ejemplo.`,
  };
}

/**
 * Editable catalog seed: Pokémon mainline physical editions (PAL Spain focus).
 * Prices are indicative placeholders only.
 */
export const seedEditions: SeedEdition[] = [
  // Gen I
  ed("rojo", "Pokémon Rojo", 1, 1999, "gb", 18000, 15000, 22000),
  ed("azul", "Pokémon Azul", 1, 1999, "gb", 17000, 14000, 21000),
  ed("amarillo", "Pokémon Amarillo", 1, 2000, "gb", 20000, 16000, 25000),

  // Gen II
  ed("oro", "Pokémon Oro", 2, 2001, "gbc", 16000, 13000, 20000),
  ed("plata", "Pokémon Plata", 2, 2001, "gbc", 16000, 13000, 20000),
  ed("cristal", "Pokémon Cristal", 2, 2001, "gbc", 28000, 22000, 35000),

  // Gen III
  ed("rubi", "Pokémon Rubí", 3, 2003, "gba", 14000, 11000, 18000),
  ed("zafiro", "Pokémon Zafiro", 3, 2003, "gba", 14000, 11000, 18000),
  ed("esmeralda", "Pokémon Esmeralda", 3, 2005, "gba", 32000, 26000, 40000),
  ed("rojo-fuego", "Pokémon Rojo Fuego", 3, 2004, "gba", 30000, 24000, 38000),
  ed("verde-hoja", "Pokémon Verde Hoja", 3, 2004, "gba", 30000, 24000, 38000),

  // Gen IV
  ed("diamante", "Pokémon Diamante", 4, 2007, "nds", 12000, 9000, 15000),
  ed("perla", "Pokémon Perla", 4, 2007, "nds", 12000, 9000, 15000),
  ed("platino", "Pokémon Platino", 4, 2009, "nds", 22000, 18000, 28000),
  {
    ...ed("heartgold", "Pokémon HeartGold", 4, 2010, "nds", 45000, 38000, 55000),
    versionLabel: "HeartGold",
    components: heartGoldSoulSilverComponents,
    description:
      "Edición física PAL España con Pokéwalker. Precios orientativos.",
  },
  {
    ...ed("soulsilver", "Pokémon SoulSilver", 4, 2010, "nds", 48000, 40000, 58000),
    versionLabel: "SoulSilver",
    components: heartGoldSoulSilverComponents,
    description:
      "Edición física PAL España con Pokéwalker. Precios orientativos.",
  },

  // Gen V
  ed("negro", "Pokémon Negro", 5, 2011, "nds", 11000, 8500, 14000),
  ed("blanco", "Pokémon Blanco", 5, 2011, "nds", 11000, 8500, 14000),
  ed("negro-2", "Pokémon Negro 2", 5, 2012, "nds", 25000, 20000, 32000),
  ed("blanco-2", "Pokémon Blanco 2", 5, 2012, "nds", 25000, 20000, 32000),

  // Gen VI
  ed("x", "Pokémon X", 6, 2013, "3ds", 9000, 7000, 12000),
  ed("y", "Pokémon Y", 6, 2013, "3ds", 9000, 7000, 12000),
  ed("rubi-omega", "Pokémon Rubí Omega", 6, 2014, "3ds", 10000, 8000, 13000),
  ed("zafiro-alfa", "Pokémon Zafiro Alfa", 6, 2014, "3ds", 10000, 8000, 13000),

  // Gen VII
  ed("sol", "Pokémon Sol", 7, 2016, "3ds", 8000, 6000, 11000),
  ed("luna", "Pokémon Luna", 7, 2016, "3ds", 8000, 6000, 11000),
  ed("ultrasol", "Pokémon Ultrasol", 7, 2017, "3ds", 11000, 8500, 14000),
  ed("ultraluna", "Pokémon Ultraluna", 7, 2017, "3ds", 11000, 8500, 14000),
  ed("lets-go-pikachu", "Pokémon: Let’s Go, Pikachu!", 7, 2018, "switch", 12000, 9000, 15000),
  ed("lets-go-eevee", "Pokémon: Let’s Go, Eevee!", 7, 2018, "switch", 12000, 9000, 15000),

  // Gen VIII
  ed("espada", "Pokémon Espada", 8, 2019, "switch", 10000, 7500, 13000),
  ed("escudo", "Pokémon Escudo", 8, 2019, "switch", 10000, 7500, 13000),
  ed(
    "diamante-brillante",
    "Pokémon Diamante Brillante",
    8,
    2021,
    "switch",
    11000,
    8500,
    14000,
  ),
  ed(
    "perla-reluciente",
    "Pokémon Perla Reluciente",
    8,
    2021,
    "switch",
    11000,
    8500,
    14000,
  ),
  ed(
    "leyendas-arceus",
    "Leyendas Pokémon: Arceus",
    8,
    2022,
    "switch",
    13000,
    10000,
    16000,
  ),

  // Gen IX
  ed("escarlata", "Pokémon Escarlata", 9, 2022, "switch", 14000, 11000, 17000),
  ed("purpura", "Pokémon Púrpura", 9, 2022, "switch", 14000, 11000, 17000),
  ed(
    "leyendas-z-a",
    "Leyendas Pokémon: Z-A",
    9,
    2025,
    "switch",
    16000,
    13000,
    20000,
  ),
];

export const COLLECTION_DEFINITION = {
  slug: "pokemon-mainline-pal-es",
  name: "Pokémon – línea principal – ediciones físicas PAL España",
  description:
    "Colección inicial centrada en las ediciones físicas principales de Pokémon en región PAL España.",
} as const;
