import { describe, expect, it } from "vitest";
import { buildDashboardProgress } from "./dashboard";

describe("buildDashboardProgress", () => {
  it("computes progress, value delta and distributions", () => {
    const summary = buildDashboardProgress({
      totalEditions: 4,
      ownedEditionIds: new Set(["e1", "e2"]),
      editions: [
        {
          id: "e1",
          generation: 1,
          platformSlug: "game-boy",
          platformName: "Game Boy",
        },
        {
          id: "e2",
          generation: 1,
          platformSlug: "game-boy",
          platformName: "Game Boy",
        },
        {
          id: "e3",
          generation: 4,
          platformSlug: "nintendo-ds",
          platformName: "Nintendo DS",
        },
        {
          id: "e4",
          generation: 4,
          platformSlug: "nintendo-ds",
          platformName: "Nintendo DS",
        },
      ],
      primaryCopies: [
        {
          gameEditionId: "e1",
          isPrimary: true,
          completenessPercent: 100,
          referencePriceCents: 10000,
        },
        {
          gameEditionId: "e2",
          isPrimary: true,
          completenessPercent: 50,
          referencePriceCents: 20000,
        },
      ],
      investedCents: 12000,
    });

    expect(summary.ownedCount).toBe(2);
    expect(summary.pendingCount).toBe(2);
    expect(summary.progressPercent).toBe(50);
    expect(summary.estimatedValueCents).toBe(20000);
    expect(summary.valueDeltaCents).toBe(8000);
    expect(summary.byGeneration).toEqual([
      { generation: 1, total: 2, owned: 2, percent: 100 },
      { generation: 4, total: 2, owned: 0, percent: 0 },
    ]);
    expect(summary.byPlatform[0]?.platformName).toBe("Game Boy");
    expect(summary.byPlatform[0]?.owned).toBe(2);
  });
});
