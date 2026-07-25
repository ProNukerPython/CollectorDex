export type SeedRegion = {
  slug: string;
  name: string;
  code: string;
};

export const seedRegions: SeedRegion[] = [
  { slug: "pal-es", name: "PAL España", code: "PAL-ES" },
  { slug: "pal-eu", name: "PAL Europa", code: "PAL-EU" },
  { slug: "ntsc-u", name: "NTSC-U", code: "NTSC-U" },
  { slug: "ntsc-j", name: "NTSC-J", code: "NTSC-J" },
];
