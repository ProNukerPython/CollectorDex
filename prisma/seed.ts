import "dotenv/config";
import {
  Authenticity,
  CompletenessSegment,
  ComponentPresence,
  CopyCondition,
  ListingStatus,
  MarketplacePlatform,
  PrismaClient,
  WishlistPriority,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedComponents } from "../src/data/seed/components";
import {
  COLLECTION_DEFINITION,
  seedEditions,
} from "../src/data/seed/editions";
import { seedPlatforms } from "../src/data/seed/platforms";
import { seedRegions } from "../src/data/seed/regions";
import { listingTotalCents } from "../src/domain/calculations";
import { calculateCopyCompleteness } from "../src/domain/completeness/calculate";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding CollectorDex…");

  // Clean user-owned data first (safe for local reseed)
  await prisma.negotiation.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.listingComponent.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.ownedCopyComponent.deleteMany();
  await prisma.ownedCopy.deleteMany();
  await prisma.wishlistEntry.deleteMany();
  await prisma.priceObservation.deleteMany();
  await prisma.seller.deleteMany();
  await prisma.collectionEntry.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  await prisma.gameEditionTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.editionComponent.deleteMany();
  await prisma.componentDefinition.deleteMany();
  await prisma.gameEdition.deleteMany();
  await prisma.game.deleteMany();
  await prisma.platform.deleteMany();
  await prisma.region.deleteMany();

  for (const platform of seedPlatforms) {
    await prisma.platform.create({ data: platform });
  }
  for (const region of seedRegions) {
    await prisma.region.create({ data: region });
  }
  for (const component of seedComponents) {
    await prisma.componentDefinition.create({ data: component });
  }

  const platforms = await prisma.platform.findMany();
  const regions = await prisma.region.findMany();
  const components = await prisma.componentDefinition.findMany();

  const platformBySlug = Object.fromEntries(platforms.map((p) => [p.slug, p]));
  const regionBySlug = Object.fromEntries(regions.map((r) => [r.slug, r]));
  const componentBySlug = Object.fromEntries(
    components.map((c) => [c.slug, c]),
  );

  for (const item of seedEditions) {
    const game = await prisma.game.upsert({
      where: { slug: item.gameSlug },
      update: {
        name: item.gameName,
        generation: item.generation,
        releaseYear: item.releaseYear,
        description: item.description,
      },
      create: {
        slug: item.gameSlug,
        name: item.gameName,
        generation: item.generation,
        releaseYear: item.releaseYear,
        description: item.description,
      },
    });

    const platform = platformBySlug[item.platformSlug];
    const region = regionBySlug[item.regionSlug];
    if (!platform || !region) {
      throw new Error(`Missing platform/region for ${item.editionSlug}`);
    }

    const edition = await prisma.gameEdition.create({
      data: {
        gameId: game.id,
        platformId: platform.id,
        regionId: region.id,
        slug: item.editionSlug,
        name: item.editionName,
        versionLabel: item.versionLabel,
        language: item.language,
        productCode: item.productCode,
        imageUrl: "/placeholders/games/generic.svg",
        description: item.description,
        referencePriceCents: item.referencePriceCents,
        targetPriceCents: item.targetPriceCents,
        maxPriceCents: item.maxPriceCents,
        currency: "EUR",
        isIndicativePricing: true,
      },
    });

    for (const comp of item.components) {
      const definition = componentBySlug[comp.componentSlug];
      if (!definition) {
        throw new Error(`Unknown component ${comp.componentSlug}`);
      }
      await prisma.editionComponent.create({
        data: {
          gameEditionId: edition.id,
          componentDefinitionId: definition.id,
          weight: comp.weight,
          isRequired: comp.isRequired ?? true,
          sortOrder: comp.sortOrder ?? 0,
          description: comp.description,
        },
      });
    }
  }

  const email = (process.env.DEMO_USER_EMAIL ?? "demo@collectordex.local").toLowerCase();
  const password = process.env.DEMO_USER_PASSWORD ?? "collectordex";
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      name: "Coleccionista Demo",
      passwordHash,
    },
  });

  const collection = await prisma.collection.create({
    data: {
      userId: user.id,
      slug: COLLECTION_DEFINITION.slug,
      name: COLLECTION_DEFINITION.name,
      description: COLLECTION_DEFINITION.description,
      isDefault: true,
    },
  });

  const allEditions = await prisma.gameEdition.findMany({
    include: {
      game: true,
      editionComponents: true,
    },
  });

  for (const edition of allEditions) {
    await prisma.collectionEntry.create({
      data: {
        collectionId: collection.id,
        gameEditionId: edition.id,
      },
    });
  }

  const editionsBySlug = Object.fromEntries(
    allEditions.map((edition) => [edition.slug, edition]),
  );

  async function createDemoCopy(options: {
    slug: string;
    condition: CopyCondition;
    authenticity: Authenticity;
    isPrimary: boolean;
    pricePaidCents: number;
    estimatedValueCents?: number;
    purchasedAt: Date;
    notes: string;
    presenceBySlug: Record<string, ComponentPresence>;
  }) {
    const edition = editionsBySlug[options.slug];
    if (!edition) return null;

    const definitions = await prisma.componentDefinition.findMany();
    const defById = Object.fromEntries(definitions.map((d) => [d.id, d]));

    const componentInputs = edition.editionComponents.map((ec) => {
      const def = defById[ec.componentDefinitionId];
      const presence =
        options.presenceBySlug[def?.slug ?? ""] ?? ComponentPresence.UNKNOWN;
      return {
        editionComponent: ec,
        definitionSlug: def?.slug ?? "",
        name: def?.name ?? "Componente",
        presence,
      };
    });

    const completeness = calculateCopyCompleteness(
      componentInputs.map((item) => ({
        id: item.editionComponent.componentDefinitionId,
        name: item.name,
        weight: item.editionComponent.weight,
        isRequired: item.editionComponent.isRequired,
        presence: item.presence,
      })),
    );

    const copy = await prisma.ownedCopy.create({
      data: {
        userId: user.id,
        gameEditionId: edition.id,
        condition: options.condition,
        language: "es",
        regionLabel: "PAL España",
        pricePaidCents: options.pricePaidCents,
        estimatedValueCents: options.estimatedValueCents,
        currency: "EUR",
        purchasedAt: options.purchasedAt,
        purchasePlatform: MarketplacePlatform.WALLAPOP,
        authenticity: options.authenticity,
        completenessPercent: completeness.percent,
        completenessDescriptor: completeness.descriptor,
        isPrimary: options.isPrimary,
        notes: options.notes,
        photoUrls: [],
        components: {
          create: componentInputs.map((item) => ({
            componentDefinitionId: item.editionComponent.componentDefinitionId,
            presence: item.presence,
          })),
        },
      },
    });

    return copy;
  }

  // Complete primary copy (Rojo)
  await createDemoCopy({
    slug: "rojo-pal-es",
    condition: CopyCondition.VERY_GOOD,
    authenticity: Authenticity.VERIFIED_AUTHENTIC,
    isPrimary: true,
    pricePaidCents: 14000,
    estimatedValueCents: 17000,
    purchasedAt: new Date("2024-06-15"),
    notes: "Copia principal completa de demostración.",
    presenceBySlug: {
      cartridge: ComponentPresence.PRESENT,
      "outer-box": ComponentPresence.PRESENT,
      "inner-tray": ComponentPresence.PRESENT,
      manual: ComponentPresence.PRESENT,
      inserts: ComponentPresence.PRESENT,
    },
  });

  // Partial primary copy (Azul) with missing inserts/tray and a replacement manual
  await createDemoCopy({
    slug: "azul-pal-es",
    condition: CopyCondition.GOOD,
    authenticity: Authenticity.PROBABLY_AUTHENTIC,
    isPrimary: true,
    pricePaidCents: 13500,
    estimatedValueCents: 12000,
    purchasedAt: new Date("2024-08-20"),
    notes: "Copia parcial: manual de reemplazo y bandeja ausente.",
    presenceBySlug: {
      cartridge: ComponentPresence.PRESENT,
      "outer-box": ComponentPresence.PRESENT,
      "inner-tray": ComponentPresence.ABSENT,
      manual: ComponentPresence.REPLACEMENT,
      inserts: ComponentPresence.ABSENT,
    },
  });

  // More simple owned primaries
  for (const slug of [
    "amarillo-pal-es",
    "oro-pal-es",
    "plata-pal-es",
    "rubi-pal-es",
    "zafiro-pal-es",
    "diamante-pal-es",
    "perla-pal-es",
    "x-pal-es",
    "espada-pal-es",
    "escarlata-pal-es",
  ]) {
    await createDemoCopy({
      slug,
      condition: CopyCondition.GOOD,
      authenticity: Authenticity.PROBABLY_AUTHENTIC,
      isPrimary: true,
      pricePaidCents: Math.round(
        ((editionsBySlug[slug]?.referencePriceCents ?? 10000) * 0.85),
      ),
      purchasedAt: new Date("2024-09-01"),
      notes: "Copia de ejemplo del seed (datos orientativos).",
      presenceBySlug: {
        cartridge: ComponentPresence.PRESENT,
        disc: ComponentPresence.PRESENT,
        "outer-box": ComponentPresence.PRESENT,
        "inner-tray": ComponentPresence.PRESENT,
        manual: ComponentPresence.PRESENT,
        inserts: ComponentPresence.ABSENT,
      },
    });
  }

  // Edition with two copies: primary complete-ish + duplicate loose cart
  await createDemoCopy({
    slug: "platino-pal-es",
    condition: CopyCondition.VERY_GOOD,
    authenticity: Authenticity.PROBABLY_AUTHENTIC,
    isPrimary: true,
    pricePaidCents: 19000,
    estimatedValueCents: 21000,
    purchasedAt: new Date("2025-01-10"),
    notes: "Platino principal casi completo.",
    presenceBySlug: {
      cartridge: ComponentPresence.PRESENT,
      "outer-box": ComponentPresence.PRESENT,
      "inner-tray": ComponentPresence.PRESENT,
      manual: ComponentPresence.PRESENT,
      inserts: ComponentPresence.UNKNOWN,
    },
  });

  await createDemoCopy({
    slug: "platino-pal-es",
    condition: CopyCondition.ACCEPTABLE,
    authenticity: Authenticity.UNCHECKED,
    isPrimary: false,
    pricePaidCents: 6000,
    estimatedValueCents: 7000,
    purchasedAt: new Date("2025-02-01"),
    notes: "Duplicado: solo cartucho.",
    presenceBySlug: {
      cartridge: ComponentPresence.PRESENT,
      "outer-box": ComponentPresence.ABSENT,
      "inner-tray": ComponentPresence.ABSENT,
      manual: ComponentPresence.ABSENT,
      inserts: ComponentPresence.ABSENT,
    },
  });

  const soulSilver = allEditions.find((e) => e.slug === "soulsilver-pal-es");
  const cristal = allEditions.find((e) => e.slug === "cristal-pal-es");
  const esmeralda = allEditions.find((e) => e.slug === "esmeralda-pal-es");
  const heartGold = allEditions.find((e) => e.slug === "heartgold-pal-es");

  if (soulSilver) {
    await prisma.wishlistEntry.create({
      data: {
        userId: user.id,
        gameEditionId: soulSilver.id,
        priority: WishlistPriority.IMMEDIATE,
        targetPriceCents: soulSilver.targetPriceCents,
        maxPriceCents: soulSilver.maxPriceCents,
        minCondition: CopyCondition.GOOD,
        desiredRegion: "PAL-ES",
        notes: "Prioridad alta: completo con Pokéwalker si es posible.",
      },
    });
  }

  if (cristal) {
    await prisma.wishlistEntry.create({
      data: {
        userId: user.id,
        gameEditionId: cristal.id,
        priority: WishlistPriority.HIGH,
        targetPriceCents: cristal.targetPriceCents,
        maxPriceCents: cristal.maxPriceCents,
        minCondition: CopyCondition.VERY_GOOD,
        desiredRegion: "PAL-ES",
      },
    });
  }

  if (esmeralda) {
    await prisma.wishlistEntry.create({
      data: {
        userId: user.id,
        gameEditionId: esmeralda.id,
        priority: WishlistPriority.MEDIUM,
        targetPriceCents: esmeralda.targetPriceCents,
        maxPriceCents: esmeralda.maxPriceCents,
        minCondition: CopyCondition.GOOD,
      },
    });
  }

  if (heartGold) {
    await prisma.wishlistEntry.create({
      data: {
        userId: user.id,
        gameEditionId: heartGold.id,
        priority: WishlistPriority.HIGH,
        targetPriceCents: heartGold.targetPriceCents,
        maxPriceCents: heartGold.maxPriceCents,
      },
    });
  }

  if (soulSilver) {
    const priceCents = 42000;
    const shippingCents = 550;
    const feeCents = 0;
    const listing = await prisma.listing.create({
      data: {
        userId: user.id,
        gameEditionId: soulSilver.id,
        platform: MarketplacePlatform.WALLAPOP,
        url: "https://es.wallapop.com/item/ejemplo-soulsilver",
        title: "Pokémon SoulSilver completo + Pokéwalker — ejemplo",
        priceCents,
        shippingCents,
        feeCents,
        totalCents: listingTotalCents(priceCents, shippingCents, feeCents),
        currency: "EUR",
        sellerName: "vendedor_ejemplo",
        location: "Madrid",
        description:
          "Anuncio de ejemplo (manual). Incluye caja, manual y Pokéwalker. Precios orientativos.",
        apparentCondition: CopyCondition.VERY_GOOD,
        estimatedAuthenticity: Authenticity.PROBABLY_AUTHENTIC,
        status: ListingStatus.ACTIVE,
        completenessSegment: CompletenessSegment.CIB_COMPLETE,
        publishedAt: new Date("2025-11-01"),
      },
    });

    await prisma.listingImage.create({
      data: {
        listingId: listing.id,
        url: "/placeholders/listings/sample-1.svg",
        sortOrder: 0,
      },
    });

    await prisma.priceObservation.create({
      data: {
        userId: user.id,
        gameEditionId: soulSilver.id,
        observedAt: new Date("2025-10-01"),
        priceCents: 45000,
        condition: CopyCondition.GOOD,
        completenessSegment: CompletenessSegment.CIB_COMPLETE,
        platform: MarketplacePlatform.WALLAPOP,
        url: "https://es.wallapop.com/item/ejemplo-obs-1",
        isIndicative: true,
        notes: "Observación manual de ejemplo.",
      },
    });

    await prisma.priceObservation.create({
      data: {
        userId: user.id,
        gameEditionId: soulSilver.id,
        observedAt: new Date("2025-12-01"),
        priceCents: 39000,
        condition: CopyCondition.VERY_GOOD,
        completenessSegment: CompletenessSegment.CIB_PARTIAL,
        platform: MarketplacePlatform.VINTED,
        isIndicative: true,
      },
    });
  }

  const rojo = allEditions.find((e) => e.slug === "rojo-pal-es");
  if (rojo) {
    const owned = await prisma.ownedCopy.findFirst({
      where: { userId: user.id, gameEditionId: rojo.id },
    });
    await prisma.purchase.create({
      data: {
        userId: user.id,
        gameEditionId: rojo.id,
        ownedCopyId: owned?.id,
        platform: MarketplacePlatform.WALLAPOP,
        pricePaidCents: 14000,
        shippingCents: 400,
        feeCents: 0,
        totalCents: 14400,
        currency: "EUR",
        purchasedAt: new Date("2024-06-15"),
        notes: "Compra de ejemplo del seed.",
      },
    });
  }

  const azul = allEditions.find((e) => e.slug === "azul-pal-es");
  if (azul) {
    const owned = await prisma.ownedCopy.findFirst({
      where: { userId: user.id, gameEditionId: azul.id },
    });
    await prisma.purchase.create({
      data: {
        userId: user.id,
        gameEditionId: azul.id,
        ownedCopyId: owned?.id,
        platform: MarketplacePlatform.EBAY,
        pricePaidCents: 13500,
        shippingCents: 600,
        feeCents: 200,
        totalCents: 14300,
        currency: "EUR",
        purchasedAt: new Date("2024-08-20"),
        notes: "Compra de ejemplo del seed.",
      },
    });
  }

  const ownedCount = await prisma.ownedCopy.count({ where: { userId: user.id } });

  console.log("✅ Seed complete");
  console.log(`   User: ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Editions: ${allEditions.length}`);
  console.log(`   Owned copies: ${ownedCount}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
