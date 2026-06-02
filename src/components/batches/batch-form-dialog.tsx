"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
import { isAppError } from "@/lib/errors";
import { showErrorToast, showSuccessToast } from "@/lib/toast/notify";
import { createBatch, updateBatch } from "@/services/batches.service";
import type { BatchInterface } from "@/types/batch.interface";

export interface BatchFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farmId: string;
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
  batch,
}: BatchFormDialogProps): React.JSX.Element {
  const router = useRouter();
  const isEdit = Boolean(batch);

  const [harvestDate, setHarvestDate] = useState(batch?.harvestDate ?? "");
  const [quantity, setQuantity] = useState(batch ? String(batch.quantity) : "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setIsSubmitting(true);

    const parsedQuantity = Number(quantity);

    try {
      if (isEdit && batch) {
        await updateBatch(batch.id, {
          harvestDate,
          quantity: parsedQuantity,
        });
        showSuccessToast(`Batch "${batch.batchNumber}" updated successfully.`);
      } else {
        await createBatch({
          farmId,
          harvestDate,
          quantity: parsedQuantity,
        });
        showSuccessToast("Harvest batch created successfully.");
      }
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
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>): void {
    void handleSubmit(event);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit batch" : "Add harvest batch"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update harvest date or quantity for this batch."
              : "Record a new harvest batch for this farm. Batch number is auto-generated."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="gap-section flex flex-col">
          {isEdit && batch ? (
            <div className="gap-card flex flex-col">
              <Label>Batch number</Label>
              <code className="text-sm">{batch.batchNumber}</code>
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Create batch"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
