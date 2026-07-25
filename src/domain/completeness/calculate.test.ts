import { describe, expect, it } from "vitest";
import { calculateCopyCompleteness } from "./calculate";

describe("calculateCopyCompleteness", () => {
  it("returns NO_CHECKLIST when there are no required components", () => {
    const result = calculateCopyCompleteness([
      {
        id: "1",
        name: "Insertos",
        weight: 1,
        isRequired: false,
        presence: "ABSENT",
      },
    ]);
    expect(result.percent).toBeNull();
    expect(result.descriptor).toBe("NO_CHECKLIST");
  });

  it("ignores optional components for scoring", () => {
    const result = calculateCopyCompleteness([
      {
        id: "cart",
        name: "Cartucho",
        weight: 4,
        isRequired: true,
        presence: "PRESENT",
      },
      {
        id: "box",
        name: "Caja",
        weight: 3,
        isRequired: true,
        presence: "PRESENT",
      },
      {
        id: "ins",
        name: "Insertos",
        weight: 10,
        isRequired: false,
        presence: "ABSENT",
      },
    ]);
    expect(result.percent).toBe(100);
    expect(result.descriptor).toBe("COMPLETE");
  });

  it("awards 25% weight for replacements", () => {
    const result = calculateCopyCompleteness([
      {
        id: "cart",
        name: "Cartucho",
        weight: 4,
        isRequired: true,
        presence: "REPLACEMENT",
      },
      {
        id: "box",
        name: "Caja",
        weight: 4,
        isRequired: true,
        presence: "PRESENT",
      },
    ]);
    // earned = 1 + 4 = 5, total = 8 → 63%
    expect(result.percent).toBe(63);
    expect(result.replacementCount).toBe(1);
    expect(result.replacementNames).toContain("Cartucho");
  });

  it("does not inflate score for UNKNOWN", () => {
    const result = calculateCopyCompleteness([
      {
        id: "cart",
        name: "Cartucho",
        weight: 2,
        isRequired: true,
        presence: "PRESENT",
      },
      {
        id: "box",
        name: "Caja",
        weight: 2,
        isRequired: true,
        presence: "UNKNOWN",
      },
    ]);
    expect(result.percent).toBe(50);
    expect(result.unknownCount).toBe(1);
  });

  it("clamps between 0 and 100", () => {
    const result = calculateCopyCompleteness([
      {
        id: "cart",
        name: "Cartucho",
        weight: 1,
        isRequired: true,
        presence: "PRESENT",
      },
    ]);
    expect(result.percent).toBe(100);
  });

  it("marks GAME_ONLY when only one required component is present", () => {
    const result = calculateCopyCompleteness([
      {
        id: "cart",
        name: "Cartucho",
        weight: 4,
        isRequired: true,
        presence: "PRESENT",
      },
      {
        id: "box",
        name: "Caja",
        weight: 3,
        isRequired: true,
        presence: "ABSENT",
      },
      {
        id: "man",
        name: "Manual",
        weight: 2,
        isRequired: true,
        presence: "ABSENT",
      },
    ]);
    expect(result.descriptor).toBe("GAME_ONLY");
    expect(result.missingNames).toEqual(["Caja", "Manual"]);
  });
});
