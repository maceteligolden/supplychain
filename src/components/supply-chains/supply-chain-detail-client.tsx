"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { SupplyChainDetailView } from "@/components/supply-chains/supply-chain-detail-view";
import {
  SupplyChainWizardDialog,
  type SupplyChainWizardMode,
} from "@/components/supply-chains/supply-chain-wizard-dialog";
import { isAppError } from "@/lib/errors";
import { showErrorToast, showSuccessToast } from "@/lib/toast/notify";
import { runFarmAssessment } from "@/services/farm-assessments.service";
import type { ActorInterface } from "@/types/actor.interface";
import type { BatchAllocationInterface } from "@/types/batch-allocation.interface";
import type { BatchInterface } from "@/types/batch.interface";
import type { CommodityInterface } from "@/types/commodity.interface";
import type { FarmInterface } from "@/types/farm.interface";
import type { SupplyChainEventInterface } from "@/types/supply-chain-event.interface";
import type { SupplyChainRiskSummaryInterface } from "@/types/supply-chain-risk.interface";
import type { SupplyChainInterface } from "@/types/supply-chain.interface";

export interface SupplyChainDetailClientProps {
  supplyChain: SupplyChainInterface;
  commodity?: CommodityInterface;
  allocations: BatchAllocationInterface[];
  batches: BatchInterface[];
  farms: FarmInterface[];
  events: SupplyChainEventInterface[];
  actors: ActorInterface[];
  commodities: CommodityInterface[];
  batchesByFarmId: Record<string, BatchInterface[]>;
  allAllocations: BatchAllocationInterface[];
  riskSummary: SupplyChainRiskSummaryInterface;
}

/**
 * SupplyChainDetailClient
 *
 * Client wrapper for supply chain detail — wires edit/allocate wizards and
 * chain-level deforestation assessment runs.
 */
export function SupplyChainDetailClient({
  supplyChain,
  commodity,
  allocations,
  batches,
  farms,
  events,
  actors,
  commodities,
  batchesByFarmId,
  allAllocations,
  riskSummary,
}: SupplyChainDetailClientProps): React.JSX.Element {
  const router = useRouter();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardMode, setWizardMode] = useState<SupplyChainWizardMode>("full");
  const [isRunningAssessments, setIsRunningAssessments] = useState(false);
  const [assessmentProgress, setAssessmentProgress] = useState<string | undefined>();

  function openWizard(mode: SupplyChainWizardMode): void {
    setWizardMode(mode);
    setWizardOpen(true);
  }

  async function handleRunAssessments(): Promise<void> {
    const linkedFarmIds = riskSummary.farmRisks.map((entry) => entry.farmId);
    if (linkedFarmIds.length === 0) {
      showErrorToast("No linked farms to assess. Allocate batches first.");
      return;
    }

    setIsRunningAssessments(true);
    let succeeded = 0;
    let failed = 0;
    const failureMessages: string[] = [];

    try {
      for (let index = 0; index < linkedFarmIds.length; index += 1) {
        const farmId = linkedFarmIds[index];
        if (!farmId) {
          continue;
        }
        const farmName =
          riskSummary.farmRisks.find((entry) => entry.farmId === farmId)?.farmName ??
          farmId;
        setAssessmentProgress(
          `Assessing ${farmName} (${index + 1} of ${linkedFarmIds.length})…`,
        );

        try {
          const result = await runFarmAssessment(farmId);
          if (result.status === "FAILED") {
            failed += 1;
            failureMessages.push(
              `${farmName}: ${result.errorMessage ?? "Assessment failed"}`,
            );
          } else {
            succeeded += 1;
          }
        } catch (error) {
          failed += 1;
          const message = isAppError(error)
            ? error.message
            : "Assessment failed. Check the farm boundary and try again.";
          failureMessages.push(`${farmName}: ${message}`);
        }
      }

      if (succeeded > 0 && failed === 0) {
        showSuccessToast(
          `Ran assessments for ${succeeded} farm${succeeded === 1 ? "" : "s"}.`,
        );
      } else if (succeeded > 0 && failed > 0) {
        showSuccessToast(
          `Completed ${succeeded} assessment${succeeded === 1 ? "" : "s"}; ${failed} failed.`,
        );
        showErrorToast(failureMessages.slice(0, 3).join(" "));
      } else {
        showErrorToast(
          failureMessages[0] ??
            "Could not run assessments. Ensure linked farms have saved boundaries.",
        );
      }

      router.refresh();
    } finally {
      setIsRunningAssessments(false);
      setAssessmentProgress(undefined);
    }
  }

  return (
    <>
      <SupplyChainDetailView
        supplyChain={supplyChain}
        commodity={commodity}
        allocations={allocations}
        batches={batches}
        farms={farms}
        events={events}
        actors={actors}
        riskSummary={riskSummary}
        onEdit={(): void => openWizard("full")}
        onAllocateMore={(): void => openWizard("allocate")}
        onRunAssessments={(): void => void handleRunAssessments()}
        isRunningAssessments={isRunningAssessments}
        assessmentProgress={assessmentProgress}
      />
      <SupplyChainWizardDialog
        key={`${wizardMode}-${wizardOpen ? "open" : "closed"}`}
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        commodities={commodities}
        farms={farms}
        batchesByFarmId={batchesByFarmId}
        allAllocations={allAllocations}
        supplyChain={supplyChain}
        mode={wizardMode}
      />
    </>
  );
}
