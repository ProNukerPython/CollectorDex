import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  Authenticity,
  ComponentPresence,
  CopyCondition,
  PrismaClient,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  CollectionServiceError,
  createOwnedCopy,
  deleteOwnedCopy,
  getOwnedCopyDetail,
  setOwnedCopyPrimary,
  updateOwnedCopy,
} from "./collection";

const prisma = new PrismaClient();

const suffix = Date.now().toString(36);

describe("collection service integration", () => {
  let userA: string;
  let userB: string;
  let editionId: string;
  let componentIds: string[] = [];

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash("test-password", 8);
    const a = await prisma.user.create({
      data: {
        email: `coll-a-${suffix}@test.local`,
        name: "User A",
        passwordHash,
      },
    });
    const b = await prisma.user.create({
      data: {
        email: `coll-b-${suffix}@test.local`,
        name: "User B",
        passwordHash,
      },
    });
    userA = a.id;
    userB = b.id;

    const edition = await prisma.gameEdition.findFirst({
      where: { slug: "soulsilver-pal-es" },
      include: { editionComponents: true },
    });
    if (!edition) {
      throw new Error("SoulSilver edition missing — run seed first");
    }
    editionId = edition.id;
    componentIds = edition.editionComponents.map(
      (component) => component.componentDefinitionId,
    );
  });

  afterAll(async () => {
    await prisma.ownedCopy.deleteMany({
      where: { userId: { in: [userA, userB] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [userA, userB] } },
    });
    await prisma.$disconnect();
  });

  it("creates a copy, edits components, switches primary, and enforces ownership", async () => {
    const created = await createOwnedCopy(userA, {
      gameEditionId: editionId,
      condition: CopyCondition.GOOD,
      authenticity: Authenticity.UNCHECKED,
      regionLabel: "PAL España",
      language: "es",
      pricePaidEuros: 25000,
      estimatedValueEuros: 30000,
      currency: "EUR",
      purchasedAt: new Date("2025-01-01"),
      purchasePlatform: "WALLAPOP",
      sellerName: "tester",
      listingUrl: "https://example.com/listing",
      serialNumber: null,
      notes: "integration",
      isPrimary: true,
      photoUrls: [],
      components: componentIds.map((componentDefinitionId) => ({
        componentDefinitionId,
        presence: ComponentPresence.PRESENT,
        condition: null,
        notes: null,
      })),
    });

    expect(created.isPrimary).toBe(true);
    expect(created.completenessPercent).not.toBeNull();

    const duplicate = await createOwnedCopy(userA, {
      gameEditionId: editionId,
      condition: CopyCondition.ACCEPTABLE,
      authenticity: Authenticity.UNCHECKED,
      regionLabel: "PAL España",
      language: "es",
      pricePaidEuros: 8000,
      estimatedValueEuros: 9000,
      currency: "EUR",
      purchasedAt: new Date("2025-02-01"),
      purchasePlatform: null,
      sellerName: null,
      listingUrl: null,
      serialNumber: null,
      notes: "duplicate",
      isPrimary: true,
      photoUrls: [],
      components: componentIds.map((componentDefinitionId, index) => ({
        componentDefinitionId,
        presence:
          index === 0 ? ComponentPresence.PRESENT : ComponentPresence.ABSENT,
        condition: null,
        notes: null,
      })),
    });

    const afterSwitch = await prisma.ownedCopy.findMany({
      where: { userId: userA, gameEditionId: editionId },
      orderBy: { createdAt: "asc" },
    });
    const primaries = afterSwitch.filter((copy) => copy.isPrimary);
    expect(primaries).toHaveLength(1);
    expect(primaries[0]?.id).toBe(duplicate.id);

    await setOwnedCopyPrimary(userA, created.id);
    const primaryAgain = await prisma.ownedCopy.findUnique({
      where: { id: created.id },
    });
    expect(primaryAgain?.isPrimary).toBe(true);

    await updateOwnedCopy(userA, created.id, {
      gameEditionId: editionId,
      condition: CopyCondition.VERY_GOOD,
      authenticity: Authenticity.PROBABLY_AUTHENTIC,
      regionLabel: "PAL España",
      language: "es",
      pricePaidEuros: 26000,
      estimatedValueEuros: 32000,
      currency: "EUR",
      purchasedAt: new Date("2025-01-01"),
      purchasePlatform: "WALLAPOP",
      sellerName: "tester",
      listingUrl: "https://example.com/listing",
      serialNumber: null,
      notes: "updated",
      isPrimary: true,
      photoUrls: [],
      components: componentIds.map((componentDefinitionId, index) => ({
        componentDefinitionId,
        presence:
          index < 3 ? ComponentPresence.PRESENT : ComponentPresence.ABSENT,
        condition: null,
        notes: null,
      })),
    });

    const detail = await getOwnedCopyDetail(userA, created.id);
    expect(detail.copy.notes).toBe("updated");
    expect(detail.completeness.presentCount).toBeGreaterThan(0);

    await expect(getOwnedCopyDetail(userB, created.id)).rejects.toBeInstanceOf(
      CollectionServiceError,
    );

    await expect(deleteOwnedCopy(userB, created.id)).rejects.toBeInstanceOf(
      CollectionServiceError,
    );

    await deleteOwnedCopy(userA, created.id);
    await deleteOwnedCopy(userA, duplicate.id);

    const remaining = await prisma.ownedCopy.count({
      where: { userId: userA, gameEditionId: editionId },
    });
    expect(remaining).toBe(0);
  });
});
