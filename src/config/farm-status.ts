export const FARM_STATUSES = [
  "DRAFT",
  "MAPPED",
  "READY_FOR_ASSESSMENT",
  "UNDER_REVIEW",
  "ASSESSED",
  "APPROVED",
  "REJECTED",
] as const;

export type FarmStatus = (typeof FARM_STATUSES)[number];

export const FARM_STATUS_LABELS: Record<FarmStatus, string> = {
  DRAFT: "Draft",
  MAPPED: "Mapped",
  READY_FOR_ASSESSMENT: "Ready for assessment",
  UNDER_REVIEW: "Under review",
  ASSESSED: "Assessed",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

/** Badge variant hint for farm status display. */
export const FARM_STATUS_BADGE_VARIANT: Record<
  FarmStatus,
  "secondary" | "outline" | "destructive"
> = {
  DRAFT: "outline",
  MAPPED: "secondary",
  READY_FOR_ASSESSMENT: "secondary",
  UNDER_REVIEW: "outline",
  ASSESSED: "secondary",
  APPROVED: "secondary",
  REJECTED: "destructive",
};
