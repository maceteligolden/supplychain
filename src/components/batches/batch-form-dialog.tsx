"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { BatchCreationProgressDialog } from "@/components/batches/batch-creation-progress-dialog";
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
import { isAppError } from "@/lib/errors";
import { showErrorToast, showSuccessToast } from "@/lib/toast/notify";
import { createBatch, updateBatch } from "@/services/batches.service";
import type {
  BatchCreationStepInterface,
  BatchInterface,
} from "@/types/batch.interface";
import type { CommodityInterface } from "@/types/commodity.interface";

const INITIAL_CREATE_STEPS: BatchCreationStepInterface[] = [
  {
    id: "create-batch",
    label: "Recording harvest batch…",
    status: "pending",
  },
  {
    id: "run-assessment",
    label: "Running deforestation assessment…",
    status: "pending",
  },
  {
    id: "complete",
    label: "Finishing up…",
    status: "pending",
  },
];

export interface BatchFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farmId: string;
  farmCommodityIds: string[];
  commodities: CommodityInterface[];
  batch?: BatchInterface;
}

/**
 * BatchFormDialog
 *
 * Create/edit dialog for harvest batches scoped to a farm.
 */
export function BatchFormDialog({
  open,
  onOpenChange,
  farmId,
  farmCommodityIds,
  commodities,
  batch,
}: BatchFormDialogProps): React.JSX.Element {
  const router = useRouter();
  const isEdit = Boolean(batch);

  const farmCommodities = commodities.filter((commodity) =>
    farmCommodityIds.includes(commodity.id),
  );

  const defaultCommodityId =
    batch?.commodityId ?? (farmCommodityIds.length === 1 ? farmCommodityIds[0] : "");

  const [commodityId, setCommodityId] = useState(defaultCommodityId);
  const [harvestDate, setHarvestDate] = useState(batch?.harvestDate ?? "");
  const [quantity, setQuantity] = useState(batch ? String(batch.quantity) : "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [progressSteps, setProgressSteps] =
    useState<BatchCreationStepInterface[]>(INITIAL_CREATE_STEPS);
  const [progressRunning, setProgressRunning] = useState(false);

  const showCommoditySelect = !isEdit && farmCommodityIds.length > 1;

  async function handleCreateBatch(): Promise<void> {
    const parsedQuantity = Number(quantity);

    setProgressOpen(true);
    setProgressRunning(true);
    setProgressSteps(INITIAL_CREATE_STEPS);

    try {
      const result = await createBatch({
        farmId,
        harvestDate,
        quantity: parsedQuantity,
        ...(showCommoditySelect ? { commodityId } : {}),
      });

      setProgressSteps(result.steps);
      setProgressRunning(false);
      showSuccessToast(`Batch "${result.batch.batchNumber}" created successfully.`);
    } catch (err) {
      setProgressOpen(false);
      setProgressRunning(false);
      setProgressSteps(INITIAL_CREATE_STEPS);
      if (isAppError(err)) {
        showErrorToast(err.message);
      } else {
        showErrorToast("Failed to create batch. Please try again.");
      }
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (isEdit && batch) {
      setIsSubmitting(true);
      const parsedQuantity = Number(quantity);

      try {
        await updateBatch(batch.id, {
          harvestDate,
          quantity: parsedQuantity,
        });
        showSuccessToast(`Batch "${batch.batchNumber}" updated successfully.`);
        onOpenChange(false);
        router.refresh();
      } catch (err) {
        if (isAppError(err)) {
          showErrorToast(err.message);
        } else {
          showErrorToast("Failed to save batch. Please try again.");
        }
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setIsSubmitting(true);
    onOpenChange(false);
    await handleCreateBatch();
    setIsSubmitting(false);
  }

  function handleProgressDone(): void {
    setProgressOpen(false);
    setProgressSteps(INITIAL_CREATE_STEPS);
    router.refresh();
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>): void {
    void handleSubmit(event);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit batch" : "Add harvest batch"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update harvest date or quantity for this batch."
                : "Record a new harvest batch. A deforestation assessment runs automatically when the farm boundary is mapped."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="gap-section flex flex-col">
            {isEdit && batch ? (
              <div className="gap-card flex flex-col">
                <Label>Batch number</Label>
                <code className="text-sm">{batch.batchNumber}</code>
              </div>
            ) : null}
            {showCommoditySelect ? (
              <div className="gap-card flex flex-col">
                <Label>Commodity</Label>
                <Select
                  value={commodityId}
                  onValueChange={(value): void => {
                    if (value !== null) {
                      setCommodityId(value);
                    }
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select commodity" />
                  </SelectTrigger>
                  <SelectContent>
                    {farmCommodities.map((commodity) => (
                      <SelectItem key={commodity.id} value={commodity.id}>
                        {commodity.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            <div className="gap-card flex flex-col">
              <Label htmlFor="harvest-date">Harvest date</Label>
              <Input
                id="harvest-date"
                type="date"
                value={harvestDate}
                onChange={(event) => setHarvestDate(event.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="gap-card flex flex-col">
              <Label htmlFor="batch-quantity">Quantity</Label>
              <Input
                id="batch-quantity"
                type="number"
                min={1}
                step="any"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={(): void => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || (showCommoditySelect && !commodityId)}
              >
                {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Create batch"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <BatchCreationProgressDialog
        open={progressOpen}
        onOpenChange={setProgressOpen}
        steps={progressSteps}
        isRunning={progressRunning}
        onDone={handleProgressDone}
      />
    </>
  );
}
