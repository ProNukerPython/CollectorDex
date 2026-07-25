import { describe, expect, it } from "vitest";
import { collectionProgressPercent } from "./progress";

describe("collectionProgressPercent", () => {
  it("computes percent rounded", () => {
    expect(collectionProgressPercent(1, 3)).toBe(33);
  });

  it("returns 0 when total is 0", () => {
    expect(collectionProgressPercent(0, 0)).toBe(0);
  });

  it("clamps owned to total", () => {
    expect(collectionProgressPercent(5, 3)).toBe(100);
  });
});
