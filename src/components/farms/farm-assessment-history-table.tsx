"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ASSESSMENT_RISK_BADGE_VARIANT,
  ASSESSMENT_RISK_LABELS,
} from "@/config/farm-assessment-risk";
import { cn } from "@/lib/utils";
import type { FarmAssessmentInterface } from "@/types/farm-assessment.interface";

export interface FarmAssessmentHistoryTableProps {
  /** Assessments for this farm, newest first. */
  assessments: FarmAssessmentInterface[];
  /** Currently selected assessment id. */
  selectedAssessmentId?: string;
  /** Called when a row is selected. */
  onSelectAssessment?: (assessmentId: string) => void;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * FarmAssessmentHistoryTable
 *
 * Full assessment history with metrics and selectable rows.
 */
export function FarmAssessmentHistoryTable({
  assessments,
  selectedAssessmentId,
  onSelectAssessment,
}: FarmAssessmentHistoryTableProps): React.JSX.Element {
  if (assessments.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No assessments recorded yet. Map the boundary and run an assessment.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Risk</TableHead>
            <TableHead className="text-right">Deforestation</TableHead>
            <TableHead className="text-right">Forest cover</TableHead>
            <TableHead className="text-right">Protected overlap</TableHead>
            <TableHead className="text-right">Area (ha)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assessments.map((assessment, index) => {
            const isSelected = assessment.id === selectedAssessmentId;
            const isLatest = index === 0;

            return (
              <TableRow
                key={assessment.id}
                className={cn(
                  onSelectAssessment && "cursor-pointer",
                  isSelected && "bg-muted/50",
                )}
                onClick={
                  onSelectAssessment
                    ? (): void => onSelectAssessment(assessment.id)
                    : undefined
                }
              >
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm">
                      {formatDateTime(assessment.assessedAt)}
                    </span>
                    {isLatest ? (
                      <span className="text-muted-foreground text-xs">Latest</span>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={ASSESSMENT_RISK_BADGE_VARIANT[assessment.riskLevel]}>
                    {ASSESSMENT_RISK_LABELS[assessment.riskLevel]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {assessment.analysis.deforestationPercent}%
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {assessment.analysis.forestCoverPercent}%
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {assessment.analysis.protectedAreaOverlapPercent}%
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {assessment.boundaryAreaHectares.toLocaleString()}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
