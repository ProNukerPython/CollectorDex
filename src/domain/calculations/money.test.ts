import { describe, expect, it } from "vitest";
import { formatCentsEs, listingTotalCents, savingsCents } from "./money";

describe("listingTotalCents", () => {
  it("sums price, shipping and fees", () => {
    expect(listingTotalCents(10000, 450, 200)).toBe(10650);
  });

  it("defaults shipping and fees to zero", () => {
    expect(listingTotalCents(5000)).toBe(5000);
  });

  it("rejects non-integer amounts", () => {
    expect(() => listingTotalCents(10.5)).toThrow(/non-negative integer/);
  });
});

describe("savingsCents", () => {
  it("returns positive savings when paid less than reference", () => {
    expect(savingsCents(12000, 9000)).toBe(3000);
  });

  it("returns negative when overpaid", () => {
    expect(savingsCents(8000, 10000)).toBe(-2000);
  });
});

describe("formatCentsEs", () => {
  it("formats EUR in es-ES", () => {
    const formatted = formatCentsEs(12345, "EUR");
    expect(formatted).toMatch(/123/);
    expect(formatted).toMatch(/45/);
  });
});
