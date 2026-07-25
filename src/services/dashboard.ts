import type { WishlistPriority } from "@prisma/client";
import {
  buildDashboardProgress,
  WISHLIST_PRIORITY_ORDER,
} from "@/domain/stats/dashboard";
import { prisma } from "@/lib/db";

export type DashboardRecentPurchase = {
  id: string;
  totalCents: number;
  currency: string;
  purchasedAt: Date;
  gameName: string;
  editionSlug: string;
};

export type DashboardWishlistItem = {
  id: string;
  priority: WishlistPriority;
  targetPriceCents: number | null;
  gameName: string;
  editionSlug: string;
};

export type DashboardData = ReturnType<typeof buildDashboardProgress> & {
  recentPurchases: DashboardRecentPurchase[];
  priorityWishlist: DashboardWishlistItem[];
};

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const [editions, ownedCopies, purchaseAgg, recentPurchases, wishlistEntries] =
    await Promise.all([
      prisma.gameEdition.findMany({
        select: {
          id: true,
          game: { select: { generation: true } },
          platform: { select: { slug: true, name: true } },
        },
      }),
      prisma.ownedCopy.findMany({
        where: { userId },
        select: {
          gameEditionId: true,
          isPrimary: true,
          completenessPercent: true,
          estimatedValueCents: true,
          gameEdition: {
            select: { referencePriceCents: true },
          },
        },
      }),
      prisma.purchase.aggregate({
        where: { userId },
        _sum: { totalCents: true },
      }),
      prisma.purchase.findMany({
        where: { userId },
        orderBy: { purchasedAt: "desc" },
        take: 5,
        select: {
          id: true,
          totalCents: true,
          currency: true,
          purchasedAt: true,
          gameEdition: {
            select: {
              slug: true,
              game: { select: { name: true } },
            },
          },
        },
      }),
      prisma.wishlistEntry.findMany({
        where: { userId },
        select: {
          id: true,
          priority: true,
          targetPriceCents: true,
          gameEdition: {
            select: {
              slug: true,
              game: { select: { name: true } },
            },
          },
        },
      }),
    ]);

  const ownedEditionIds = new Set(ownedCopies.map((copy) => copy.gameEditionId));

  const summary = buildDashboardProgress({
    totalEditions: editions.length,
    ownedEditionIds,
    editions: editions.map((edition) => ({
      id: edition.id,
      generation: edition.game.generation,
      platformSlug: edition.platform.slug,
      platformName: edition.platform.name,
    })),
    primaryCopies: ownedCopies
      .filter((copy) => copy.isPrimary)
      .map((copy) => ({
        gameEditionId: copy.gameEditionId,
        isPrimary: true,
        completenessPercent: copy.completenessPercent,
        referencePriceCents: copy.gameEdition.referencePriceCents,
        estimatedValueCents: copy.estimatedValueCents,
      })),
    investedCents: purchaseAgg._sum.totalCents ?? 0,
  });

  const priorityRank = new Map(
    WISHLIST_PRIORITY_ORDER.map((priority, index) => [priority, index]),
  );

  const priorityWishlist = [...wishlistEntries]
    .sort((a, b) => {
      const rankA = priorityRank.get(a.priority) ?? 99;
      const rankB = priorityRank.get(b.priority) ?? 99;
      return rankA - rankB;
    })
    .slice(0, 5)
    .map((entry) => ({
      id: entry.id,
      priority: entry.priority,
      targetPriceCents: entry.targetPriceCents,
      gameName: entry.gameEdition.game.name,
      editionSlug: entry.gameEdition.slug,
    }));

  return {
    ...summary,
    recentPurchases: recentPurchases.map((purchase) => ({
      id: purchase.id,
      totalCents: purchase.totalCents,
      currency: purchase.currency,
      purchasedAt: purchase.purchasedAt,
      gameName: purchase.gameEdition.game.name,
      editionSlug: purchase.gameEdition.slug,
    })),
    priorityWishlist,
  };
}
