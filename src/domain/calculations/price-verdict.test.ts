import { describe, expect, it } from "vitest";
import { priceVerdict } from "./price-verdict";

describe("priceVerdict", () => {
  it("marks steal when well below target", () => {
    expect(
      priceVerdict({
        totalCents: 7000,
        targetPriceCents: 10000,
        maxPriceCents: 12000,
        referencePriceCents: 11000,
      }),
    ).toBe("STEAL");
  });

  it("marks expensive when above max", () => {
    expect(
      priceVerdict({
        totalCents: 13000,
        targetPriceCents: 10000,
        maxPriceCents: 12000,
        referencePriceCents: 11000,
      }),
    ).toBe("EXPENSIVE");
  });

  it("falls back to reference when target missing", () => {
    expect(
      priceVerdict({
        totalCents: 10000,
        targetPriceCents: null,
        maxPriceCents: null,
        referencePriceCents: 10000,
      }),
    ).toBe("FAIR");
  });
});
