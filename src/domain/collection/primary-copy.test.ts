import { describe, expect, it } from "vitest";
import {
  assertSinglePrimaryPerEdition,
  resolvePrimaryTransition,
} from "./primary-copy";

describe("resolvePrimaryTransition", () => {
  it("demotes previous primary of the same edition", () => {
    const result = resolvePrimaryTransition({
      editionId: "ed1",
      copyId: "c2",
      makePrimary: true,
      existing: [
        { id: "c1", gameEditionId: "ed1", isPrimary: true },
        { id: "c2", gameEditionId: "ed1", isPrimary: false },
      ],
    });
    expect(result.demoteIds).toEqual(["c1"]);
    expect(result.nextPrimaryId).toBe("c2");
  });

  it("does nothing when not making primary", () => {
    const result = resolvePrimaryTransition({
      editionId: "ed1",
      copyId: "c2",
      makePrimary: false,
      existing: [{ id: "c1", gameEditionId: "ed1", isPrimary: true }],
    });
    expect(result.demoteIds).toEqual([]);
  });
});

describe("assertSinglePrimaryPerEdition", () => {
  it("throws when two primaries exist for one edition", () => {
    expect(() =>
      assertSinglePrimaryPerEdition([
        { id: "a", gameEditionId: "ed1", isPrimary: true },
        { id: "b", gameEditionId: "ed1", isPrimary: true },
      ]),
    ).toThrow(/2 primary copies/);
  });
});
