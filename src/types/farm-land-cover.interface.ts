export type FarmLandCoverSource = "BASELINE" | "ASSESSMENT";

export interface FarmLandCoverTimelinePointInterface {
  /** ISO date for this observation. */
  observedAt: string;
  /** Remaining forest cover within boundary (%). */
  forestCoverPercent: number;
  /** Estimated forest loss within boundary (%). */
  deforestationPercent: number;
  /** Whether this point is mock satellite baseline or from an assessment run. */
  source: FarmLandCoverSource;
  /** Linked assessment id when source is ASSESSMENT. */
  assessmentId?: string;
}

export type GetFarmLandCoverTimelineOutput = {
  points: FarmLandCoverTimelinePointInterface[];
};
