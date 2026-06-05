"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  SUPPLY_CHAIN_OVERALL_RISK_BADGE_VARIANT,
  SUPPLY_CHAIN_OVERALL_RISK_LABELS,
} from "@/config/supply-chain-risk";
import { farmDetailPage } from "@/config/page-routes";
import type { SupplyChainRiskSummaryInterface } from "@/types/supply-chain-risk.interface";

export interface SupplyChainRiskSummaryProps {
  /** Aggregated deforestation risk for the chain. */
  riskSummary: SupplyChainRiskSummaryInterface;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * SupplyChainRiskSummary
 *
 * Chain-level deforestation risk from linked farm assessments.
 */
export function SupplyChainRiskSummary({
  riskSummary,
}: SupplyChainRiskSummaryProps): React.JSX.Element {
  const { overallRiskLevel, farmRisks, hasPartialAssessment, unassessedFarmsCount } =
    riskSummary;

  return (
    <Card>
      <CardContent className="gap-card flex flex-col pt-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-foreground text-lg font-semibold">
              Deforestation risk
            </h3>
            <p className="text-muted-foreground text-sm">
              Aggregated from latest assessments on farms supplying this chain.
            </p>
          </div>
          <Badge variant={SUPPLY_CHAIN_OVERALL_RISK_BADGE_VARIANT[overallRiskLevel]}>
            {SUPPLY_CHAIN_OVERALL_RISK_LABELS[overallRiskLevel]}
          </Badge>
        </div>

        {overallRiskLevel === "NO_FARMS" ? (
          <p className="text-muted-foreground text-sm">
            No farms linked yet. Assign batch allocations to evaluate chain risk.
          </p>
        ) : null}

        {hasPartialAssessment ? (
          <p className="text-muted-foreground text-sm">
            {unassessedFarmsCount} linked{" "}
            {unassessedFarmsCount === 1 ? "farm has" : "farms have"} no assessment —
            overall risk reflects the highest assessed farm only.
          </p>
        ) : null}

        {farmRisks.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Farm</TableHead>
                  <TableHead>Latest assessment</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead className="text-right">Deforestation</TableHead>
                  <TableHead className="text-right">Forest cover</TableHead>
                  <TableHead className="text-right">Allocated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {farmRisks.map((entry) => (
                  <TableRow key={entry.farmId}>
                    <TableCell className="font-medium">
                      <Link
                        href={farmDetailPage(entry.farmId)}
                        className="hover:underline"
                      >
                        {entry.farmName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {entry.latestAssessedAt ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm">
                            {formatDate(entry.latestAssessedAt)}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            Most recent assessment
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          Not assessed
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {entry.riskLevel ? (
                        <Badge variant={ASSESSMENT_RISK_BADGE_VARIANT[entry.riskLevel]}>
                          {ASSESSMENT_RISK_LABELS[entry.riskLevel]}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Not assessed</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {entry.analysis ? `${entry.analysis.deforestationPercent}%` : "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {entry.analysis ? `${entry.analysis.forestCoverPercent}%` : "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {entry.allocatedQuantity.toLocaleString()} {entry.unit ?? ""}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
