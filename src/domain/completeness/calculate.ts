import { COMPLETENESS_CONFIG } from "./config";

export type ComponentPresenceKind =
  | "PRESENT"
  | "ABSENT"
  | "UNKNOWN"
  | "REPLACEMENT";

export type CompletenessDescriptorKind =
  | "COMPLETE"
  | "ALMOST_COMPLETE"
  | "PARTIAL"
  | "GAME_ONLY"
  | "NO_CHECKLIST";

export type CompletenessComponentInput = {
  id: string;
  name: string;
  weight: number;
  isRequired: boolean;
  presence: ComponentPresenceKind;
};

export type CompletenessResult = {
  percent: number | null;
  earnedWeight: number;
  totalWeight: number;
  presentCount: number;
  missingCount: number;
  unknownCount: number;
  replacementCount: number;
  descriptor: CompletenessDescriptorKind;
  missingNames: string[];
  presentNames: string[];
  unknownNames: string[];
  replacementNames: string[];
};

/**
 * Weighted completeness for a physical copy.
 * Optional components are excluded from scoring unless marked required.
 * Unknown components contribute 0 and remain in the denominator (no inflation).
 */
export function calculateCopyCompleteness(
  components: readonly CompletenessComponentInput[],
  config: typeof COMPLETENESS_CONFIG = COMPLETENESS_CONFIG,
): CompletenessResult {
  const scoring = components.filter((component) => component.isRequired);

  if (scoring.length === 0) {
    return {
      percent: null,
      earnedWeight: 0,
      totalWeight: 0,
      presentCount: 0,
      missingCount: 0,
      unknownCount: 0,
      replacementCount: 0,
      descriptor: "NO_CHECKLIST",
      missingNames: [],
      presentNames: [],
      unknownNames: [],
      replacementNames: [],
    };
  }

  let earnedWeight = 0;
  let totalWeight = 0;
  let presentCount = 0;
  let missingCount = 0;
  let unknownCount = 0;
  let replacementCount = 0;
  const missingNames: string[] = [];
  const presentNames: string[] = [];
  const unknownNames: string[] = [];
  const replacementNames: string[] = [];

  for (const component of scoring) {
    if (!Number.isFinite(component.weight) || component.weight <= 0) {
      throw new Error(`Invalid weight for component ${component.id}`);
    }

    totalWeight += component.weight;

    switch (component.presence) {
      case "PRESENT":
        earnedWeight += component.weight;
        presentCount += 1;
        presentNames.push(component.name);
        break;
      case "REPLACEMENT":
        earnedWeight += component.weight * config.replacementWeightFactor;
        replacementCount += 1;
        replacementNames.push(component.name);
        break;
      case "UNKNOWN":
        unknownCount += 1;
        unknownNames.push(component.name);
        break;
      case "ABSENT":
        missingCount += 1;
        missingNames.push(component.name);
        break;
      default: {
        const _exhaustive: never = component.presence;
        throw new Error(`Unhandled presence: ${_exhaustive}`);
      }
    }
  }

  const rawPercent = totalWeight === 0 ? 0 : (earnedWeight / totalWeight) * 100;
  const percent = Math.min(100, Math.max(0, Math.round(rawPercent)));

  return {
    percent,
    earnedWeight: roundWeight(earnedWeight),
    totalWeight: roundWeight(totalWeight),
    presentCount,
    missingCount,
    unknownCount,
    replacementCount,
    descriptor: describeCompleteness(percent, presentCount, scoring.length),
    missingNames,
    presentNames,
    unknownNames,
    replacementNames,
  };
}

export function describeCompleteness(
  percent: number,
  presentCount: number,
  requiredCount: number,
  config: typeof COMPLETENESS_CONFIG = COMPLETENESS_CONFIG,
): CompletenessDescriptorKind {
  if (requiredCount === 0) return "NO_CHECKLIST";
  if (percent >= config.thresholds.complete) return "COMPLETE";
  if (percent >= config.thresholds.almostComplete) return "ALMOST_COMPLETE";
  if (presentCount <= 1) return "GAME_ONLY";
  if (percent >= config.thresholds.partial) return "PARTIAL";
  return "PARTIAL";
}

function roundWeight(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Legacy helper kept for existing call sites that only need a percent. */
export function copyCompletenessPercent(
  components: ReadonlyArray<{ weight: number; isPresent: boolean }>,
): number {
  const mapped = components.map((component, index) => ({
    id: String(index),
    name: String(index),
    weight: component.weight,
    isRequired: true,
    presence: (component.isPresent ? "PRESENT" : "ABSENT") as ComponentPresenceKind,
  }));
  return calculateCopyCompleteness(mapped).percent ?? 0;
}
