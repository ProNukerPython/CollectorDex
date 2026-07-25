import { describe, expect, it } from "vitest";
import {
  centsToEuros,
  eurosToCents,
  savingsOrOverpayCents,
} from "./cents";

describe("eurosToCents / centsToEuros", () => {
  it("converts euros to integer cents", () => {
    expect(eurosToCents(12.34)).toBe(1234);
    expect(eurosToCents(100)).toBe(10000);
  });

  it("rejects negative euros", () => {
    expect(() => eurosToCents(-1)).toThrow(/non-negative/);
  });

  it("converts cents back to euros", () => {
    expect(centsToEuros(1234)).toBe(12.34);
  });
});

describe("savingsOrOverpayCents", () => {
  it("returns positive savings and negative overpay", () => {
    expect(savingsOrOverpayCents(20000, 15000)).toBe(5000);
    expect(savingsOrOverpayCents(10000, 12000)).toBe(-2000);
  });

  it("returns null when either value is missing", () => {
    expect(savingsOrOverpayCents(null, 1000)).toBeNull();
    expect(savingsOrOverpayCents(1000, undefined)).toBeNull();
  });
});
