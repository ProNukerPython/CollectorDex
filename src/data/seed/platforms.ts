export type SeedPlatform = {
  slug: string;
  name: string;
  shortName: string;
};

export const seedPlatforms: SeedPlatform[] = [
  { slug: "game-boy", name: "Game Boy", shortName: "GB" },
  { slug: "game-boy-color", name: "Game Boy Color", shortName: "GBC" },
  { slug: "game-boy-advance", name: "Game Boy Advance", shortName: "GBA" },
  { slug: "nintendo-ds", name: "Nintendo DS", shortName: "NDS" },
  { slug: "nintendo-3ds", name: "Nintendo 3DS", shortName: "3DS" },
  { slug: "nintendo-switch", name: "Nintendo Switch", shortName: "Switch" },
];
