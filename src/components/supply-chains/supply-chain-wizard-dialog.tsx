"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  SUPPLY_CHAIN_STATUSES,
  SUPPLY_CHAIN_STATUS_LABELS,
  type SupplyChainStatus,
} from "@/config/supply-chain-status";
import { supplyChainDetailPage } from "@/config/page-routes";
import {
  getAllocationQuantityFeedback,
  getBatchMaxAllocation,
} from "@/lib/supply-chain/supply-chain-stats";
import { formatFarmLocation } from "@/lib/farm/format-location";
import { isAppError } from "@/lib/errors";
import { showErrorToast, showSuccessToast } from "@/lib/toast/notify";
import {
  createSupplyChain,
  syncSupplyChainAllocations,
  updateSupplyChain,
} from "@/services/supply-chains.service";
import type { BatchAllocationInterface } from "@/types/batch-allocation.interface";
import type { BatchInterface } from "@/types/batch.interface";
import type { CommodityInterface } from "@/types/commodity.interface";
import type { FarmInterface } from "@/types/farm.interface";
import type { SupplyChainInterface } from "@/types/supply-chain.interface";

const WIZARD_STEPS = ["Select farms", "Allocate batches", "Chain details"] as const;

export type SupplyChainWizardMode = "full" | "allocate";

export interface SupplyChainWizardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commodities: CommodityInterface[];
  farms: FarmInterface[];
  batchesByFarmId: Record<string, BatchInterface[]>;
  allAllocations: BatchAllocationInterface[];
  supplyChain?: SupplyChainInterface;
  /** Full wizard (default) or allocation-focused flow that starts on farm selection. */
  mode?: SupplyChainWizardMode;
}

type AllocationDraft = Record<string, string>;

/**
 * SupplyChainWizardDialog
 *
 * Three-step wizard for creating or editing a supply chain with farm selection,
 * batch allocation, and chain metadata. Supports an allocate-only entry mode.
 */
export function SupplyChainWizardDialog({
  open,
  onOpenChange,
  commodities,
  farms,
  batchesByFarmId,
  allAllocations,
  supplyChain,
  mode = "full",
}: SupplyChainWizardDialogProps): React.JSX.Element {
  const router = useRouter();
  const isEdit = Boolean(supplyChain);
  const isAllocateMode = mode === "allocate" && isEdit;
  const carouselRef = useRef<HTMLDivElement>(null);

  const initialCommodityId = useMemo(() => {
    if (supplyChain?.commodityId) {
      return supplyChain.commodityId;
    }
    if (supplyChain) {
      const chainAllocation = allAllocations.find(
        (item) => item.supplyChainId === supplyChain.id,
      );
      if (chainAllocation) {
        const batch = Object.values(batchesByFarmId)
          .flat()
          .find((item) => item.id === chainAllocation.batchId);
        return batch?.commodityId ?? commodities[0]?.id ?? "";
      }
    }
    return commodities[0]?.id ?? "";
  }, [supplyChain, allAllocations, batchesByFarmId, commodities]);

  const initialFarmIds = useMemo(() => {
    if (!supplyChain) {
      return [] as string[];
    }
    const farmIdSet = new Set<string>();
    for (const allocation of allAllocations.filter(
      (item) => item.supplyChainId === supplyChain.id,
    )) {
      for (const farmId of Object.keys(batchesByFarmId)) {
        const hasBatch = batchesByFarmId[farmId]?.some(
          (batch) => batch.id === allocation.batchId,
        );
        if (hasBatch) {
          farmIdSet.add(farmId);
        }
      }
    }
    return [...farmIdSet];
  }, [supplyChain, allAllocations, batchesByFarmId]);

  const initialAllocations = useMemo((): AllocationDraft => {
    if (!supplyChain) {
      return {};
    }
    const draft: AllocationDraft = {};
    for (const allocation of allAllocations.filter(
      (item) => item.supplyChainId === supplyChain.id,
    )) {
      draft[allocation.batchId] = String(allocation.quantity);
    }
    return draft;
  }, [supplyChain, allAllocations]);

  const [step, setStep] = useState(isAllocateMode ? 0 : 0);
  const [commodityId, setCommodityId] = useState(initialCommodityId);
  const [selectedFarmIds, setSelectedFarmIds] = useState<string[]>(initialFarmIds);
  const [allocationDraft, setAllocationDraft] =
    useState<AllocationDraft>(initialAllocations);
  const [name, setName] = useState(supplyChain?.name ?? "");
  const [description, setDescription] = useState(supplyChain?.description ?? "");
  const [status, setStatus] = useState<SupplyChainStatus>(
    supplyChain?.status ?? "ACTIVE",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedFarms = useMemo(
    () => farms.filter((farm) => selectedFarmIds.includes(farm.id)),
    [farms, selectedFarmIds],
  );

  const commodityFarms = useMemo(
    () => farms.filter((farm) => farm.commodityIds.includes(commodityId)),
    [farms, commodityId],
  );

  const selectedCommodity = commodities.find((item) => item.id === commodityId);

  const allocationFeedbackByBatchId = useMemo(() => {
    const feedback: Record<
      string,
      ReturnType<typeof getAllocationQuantityFeedback>
    > = {};

    for (const farm of selectedFarms) {
      for (const batch of batchesByFarmId[farm.id] ?? []) {
        const maxQty = getBatchMaxAllocation(batch, allAllocations, supplyChain?.id);
        feedback[batch.id] = getAllocationQuantityFeedback({
          draftValue: allocationDraft[batch.id],
          maxQuantity: maxQty,
          unit: batch.unit,
        });
      }
    }

    return feedback;
  }, [
    selectedFarms,
    batchesByFarmId,
    allAllocations,
    supplyChain?.id,
    allocationDraft,
  ]);

  const hasInvalidAllocation = Object.values(allocationFeedbackByBatchId).some(
    (feedback) => !feedback.isValid,
  );

  function resetWizardState(): void {
    setStep(0);
    setCommodityId(initialCommodityId);
    setSelectedFarmIds(initialFarmIds);
    setAllocationDraft(initialAllocations);
    setName(supplyChain?.name ?? "");
    setDescription(supplyChain?.description ?? "");
    setStatus(supplyChain?.status ?? "ACTIVE");
  }

  function handleOpenChange(nextOpen: boolean): void {
    if (nextOpen) {
      resetWizardState();
    }
    onOpenChange(nextOpen);
  }

  function toggleFarm(farmId: string): void {
    setSelectedFarmIds((current) =>
      current.includes(farmId)
        ? current.filter((id) => id !== farmId)
        : [...current, farmId],
    );
  }

  function handleCommodityChange(nextCommodityId: string): void {
    setCommodityId(nextCommodityId);
    setSelectedFarmIds([]);
    setAllocationDraft({});
  }

  function scrollCarousel(direction: "left" | "right"): void {
    const node = carouselRef.current;
    if (!node) {
      return;
    }
    const amount = node.clientWidth * 0.8;
    node.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  function canProceedFromStep(currentStep: number): boolean {
    if (currentStep === 0) {
      return selectedFarmIds.length > 0;
    }
    if (currentStep === 1) {
      const hasPositive = Object.values(allocationDraft).some(
        (value) => Number(value) > 0,
      );
      return hasPositive && !hasInvalidAllocation;
    }
    return name.trim().length >= 2;
  }

  async function handleSubmit(): Promise<void> {
    if (hasInvalidAllocation) {
      showErrorToast("Fix allocation quantities that exceed the available maximum.");
      return;
    }

    setIsSubmitting(true);

    const allocations = Object.entries(allocationDraft)
      .filter(([, quantity]) => Number(quantity) > 0)
      .map(([batchId, quantity]) => ({
        batchId,
        quantity: Number(quantity),
      }));

    const metadata = {
      name,
      description: description.trim() || undefined,
      status,
      commodityId,
    };

    try {
      if (isEdit && supplyChain) {
        await updateSupplyChain(
          supplyChain.id,
          isAllocateMode ? { commodityId } : metadata,
        );
        await syncSupplyChainAllocations(supplyChain.id, { allocations });
        showSuccessToast(
          isAllocateMode
            ? `Allocations for "${supplyChain.name}" updated.`
            : `"${name}" updated successfully.`,
        );
        onOpenChange(false);
        router.refresh();
        router.push(supplyChainDetailPage(supplyChain.id));
      } else {
        const created = await createSupplyChain({
          ...metadata,
          allocations,
        });
        showSuccessToast(`"${name}" created successfully.`);
        onOpenChange(false);
        router.refresh();
        router.push(supplyChainDetailPage(created.id));
      }
    } catch (err) {
      if (isAppError(err)) {
        showErrorToast(err.message);
      } else {
        showErrorToast("Failed to save supply chain. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const dialogTitle = isAllocateMode
    ? "Allocate more"
    : isEdit
      ? "Edit supply chain"
      : "Create supply chain";

  const lastStepIndex = isAllocateMode ? 1 : WIZARD_STEPS.length - 1;
  const visibleSteps = isAllocateMode ? WIZARD_STEPS.slice(0, 2) : WIZARD_STEPS;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {isAllocateMode
              ? `Step ${step + 1} of ${visibleSteps.length}: ${visibleSteps[step]}`
              : `Step ${step + 1} of ${WIZARD_STEPS.length}: ${WIZARD_STEPS[step]}`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          {visibleSteps.map((label, index) => (
            <div
              key={label}
              className={cn(
                "h-1 flex-1 rounded-full",
                index <= step ? "bg-primary" : "bg-muted",
              )}
            />
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto py-2">
          {step === 0 ? (
            <div className="gap-section flex flex-col">
              <div className="gap-card flex flex-col">
                <Label>Commodity</Label>
                <Select
                  value={commodityId}
                  onValueChange={(value): void => {
                    if (value !== null) {
                      handleCommodityChange(value);
                    }
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select commodity">
                      {selectedCommodity?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {commodities.map((commodity) => (
                      <SelectItem key={commodity.id} value={commodity.id}>
                        {commodity.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCommodity ? (
                  <p className="text-muted-foreground text-sm">
                    Selected commodity:{" "}
                    <span className="text-foreground font-medium">
                      {selectedCommodity.name}
                    </span>
                  </p>
                ) : null}
              </div>

              <div className="gap-card flex flex-col">
                <div className="flex items-center justify-between">
                  <Label>Select farms</Label>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      onClick={(): void => scrollCarousel("left")}
                      disabled={commodityFarms.length === 0}
                    >
                      <ChevronLeftIcon className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      onClick={(): void => scrollCarousel("right")}
                      disabled={commodityFarms.length === 0}
                    >
                      <ChevronRightIcon className="size-4" />
                    </Button>
                  </div>
                </div>

                {commodityFarms.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No farms registered for this commodity.
                  </p>
                ) : (
                  <div
                    ref={carouselRef}
                    className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2"
                  >
                    {commodityFarms.map((farm) => {
                      const selected = selectedFarmIds.includes(farm.id);
                      return (
                        <button
                          key={farm.id}
                          type="button"
                          onClick={(): void => toggleFarm(farm.id)}
                          disabled={isSubmitting}
                          className={cn(
                            "w-64 shrink-0 snap-start rounded-lg border p-4 text-left transition-colors",
                            selected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:bg-muted/50",
                          )}
                        >
                          <p className="font-medium">{farm.name}</p>
                          <p className="text-muted-foreground mt-1 text-xs">
                            {formatFarmLocation(farm.location)}
                          </p>
                          <p className="text-muted-foreground mt-2 text-xs">
                            {(batchesByFarmId[farm.id] ?? []).length} batch
                            {(batchesByFarmId[farm.id] ?? []).length === 1 ? "" : "es"}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="gap-section flex flex-col">
              {selectedFarms.map((farm) => {
                const batches = batchesByFarmId[farm.id] ?? [];
                return (
                  <Card key={farm.id}>
                    <CardContent className="gap-card flex flex-col pt-6">
                      <p className="font-medium">{farm.name}</p>
                      {batches.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                          No batches on this farm.
                        </p>
                      ) : (
                        batches.map((batch) => {
                          const maxQty = getBatchMaxAllocation(
                            batch,
                            allAllocations,
                            supplyChain?.id,
                          );
                          const feedback = allocationFeedbackByBatchId[batch.id];
                          const inputId = `qty-${batch.id}`;
                          const feedbackId = `${inputId}-feedback`;

                          return (
                            <div key={batch.id} className="gap-card flex flex-col">
                              <Label htmlFor={inputId}>
                                {batch.batchNumber} — max {maxQty.toLocaleString()}{" "}
                                {batch.unit}
                              </Label>
                              <Input
                                id={inputId}
                                type="number"
                                min={0}
                                max={maxQty}
                                step="any"
                                value={allocationDraft[batch.id] ?? ""}
                                placeholder="0 to skip"
                                aria-invalid={feedback ? !feedback.isValid : undefined}
                                aria-describedby={feedbackId}
                                onChange={(event): void =>
                                  setAllocationDraft((current) => ({
                                    ...current,
                                    [batch.id]: event.target.value,
                                  }))
                                }
                                disabled={isSubmitting || maxQty <= 0}
                                className={cn(
                                  feedback?.isExceeded &&
                                    "border-destructive focus-visible:border-destructive",
                                  feedback &&
                                    feedback.isValid &&
                                    !feedback.isEmpty &&
                                    Number(allocationDraft[batch.id]) > 0 &&
                                    "border-emerald-600 focus-visible:border-emerald-600",
                                )}
                              />
                              {feedback ? (
                                <p
                                  id={feedbackId}
                                  className={cn(
                                    "text-sm",
                                    feedback.isExceeded || !feedback.isValid
                                      ? "text-destructive"
                                      : feedback.isEmpty
                                        ? "text-muted-foreground"
                                        : "text-emerald-700 dark:text-emerald-400",
                                  )}
                                  role={
                                    feedback.isExceeded || !feedback.isValid
                                      ? "alert"
                                      : undefined
                                  }
                                >
                                  {feedback.message}
                                </p>
                              ) : null}
                            </div>
                          );
                        })
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : null}

          {step === 2 && !isAllocateMode ? (
            <div className="gap-section flex flex-col">
              <div className="gap-card flex flex-col">
                <Label htmlFor="chain-name">Name</Label>
                <Input
                  id="chain-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              {isEdit && supplyChain ? (
                <div className="gap-card flex flex-col">
                  <Label>Code</Label>
                  <code className="text-sm">{supplyChain.code}</code>
                </div>
              ) : null}
              <div className="gap-card flex flex-col">
                <Label>Commodity</Label>
                <p className="text-foreground text-sm font-medium">
                  {selectedCommodity?.name ?? "Unknown commodity"}
                </p>
              </div>
              <div className="gap-card flex flex-col">
                <Label htmlFor="chain-description">Description (optional)</Label>
                <Input
                  id="chain-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="gap-card flex flex-col">
                <Label>Status</Label>
                <Select
                  value={status}
                  onValueChange={(value): void => {
                    if (value !== null) {
                      setStatus(value);
                    }
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>{SUPPLY_CHAIN_STATUS_LABELS[status]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPLY_CHAIN_STATUSES.map((option) => (
                      <SelectItem key={option} value={option}>
                        {SUPPLY_CHAIN_STATUS_LABELS[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting || step === 0}
            onClick={(): void => setStep((current) => current - 1)}
          >
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={(): void => onOpenChange(false)}
            >
              Cancel
            </Button>
            {step < lastStepIndex ? (
              <Button
                type="button"
                disabled={isSubmitting || !canProceedFromStep(step)}
                onClick={(): void => setStep((current) => current + 1)}
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                disabled={isSubmitting || !canProceedFromStep(step)}
                onClick={(): void => void handleSubmit()}
              >
                {isSubmitting
                  ? "Saving…"
                  : isAllocateMode
                    ? "Save allocations"
                    : isEdit
                      ? "Save changes"
                      : "Create supply chain"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
