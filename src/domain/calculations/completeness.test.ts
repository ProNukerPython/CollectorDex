import { describe, expect, it } from "vitest";
import { copyCompletenessPercent } from "./completeness";

describe("copyCompletenessPercent (legacy)", () => {
  it("weights components by presence", () => {
    expect(
      copyCompletenessPercent([
        { weight: 3, isPresent: true },
        { weight: 1, isPresent: false },
      ]),
    ).toBe(75);
  });
});
