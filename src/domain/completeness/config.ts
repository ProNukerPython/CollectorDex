export const COMPLETENESS_CONFIG = {
  /** Fraction of weight awarded to replacement / reproduction components */
  replacementWeightFactor: 0.25,
  thresholds: {
    /** Inclusive lower bound for "Completa" */
    complete: 95,
    /** Inclusive lower bound for "Casi completa" */
    almostComplete: 75,
    /** Inclusive lower bound for "Parcial" */
    partial: 35,
  },
} as const;

export type CompletenessConfig = typeof COMPLETENESS_CONFIG;
