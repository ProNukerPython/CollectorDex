import { describe, expect, it } from "vitest";
import {
  collectionEstimatedValueCents,
  estimateCopyValueCents,
} from "./collection-value";

describe("collectionEstimatedValueCents", () => {
  it("sums only primary copies", () => {
    expect(
      collectionEstimatedValueCents([
        { estimatedValueCents: 10000, isPrimary: true },
        { estimatedValueCents: 5000, isPrimary: false },
        { estimatedValueCents: 2000, isPrimary: true },
      ]),
    ).toBe(12000);
  });
});

describe("estimateCopyValueCents", () => {
  it("scales by completeness and condition", () => {
    expect(estimateCopyValueCents(10000, 80, 0.9)).toBe(7200);
  });

  it("returns 0 when reference is null", () => {
    expect(estimateCopyValueCents(null, 100)).toBe(0);
  });
});
