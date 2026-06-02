"use client";

import { useMemo, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isAppError } from "@/lib/errors";
import { showErrorToast, showSuccessToast } from "@/lib/toast/notify";
import {
  createBatchAllocation,
  updateBatchAllocation,
} from "@/services/batch-allocations.service";
import type { BatchAllocationInterface } from "@/types/batch-allocation.interface";
import type { BatchInterface } from "@/types/batch.interface";
import type { SupplyChainInterface } from "@/types/supply-chain.interface";

export interface AllocationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batches: BatchInterface[];
  allocations: BatchAllocationInterface[];
  supplyChains: SupplyChainInterface[];
  allocation?: BatchAllocationInterface;
}

function getAllocatedTotal(
  batchId: string,
  allocations: BatchAllocationInterface[],
  excludeId?: string,
): number {
  return allocations
    .filter((item) => item.batchId === batchId && item.id !== excludeId)
    .reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * AllocationFormDialog
 *
 * Create/edit dialog for allocating batch quantity to a supply chain.
 */
export function AllocationFormDialog({
  open,
  onOpenChange,
  batches,
  allocations,
  supplyChains,
  allocation,
}: AllocationFormDialogProps): React.JSX.Element {
  const router = useRouter();
  const isEdit = Boolean(allocation);

  const activeSupplyChains = useMemo(
    () => supplyChains.filter((chain) => chain.status === "ACTIVE"),
    [supplyChains],
  );

  const batchesWithCapacity = useMemo(() => {
    return batches
      .map((batch) => {
        const allocated = getAllocatedTotal(
          batch.id,
          allocations,
          allocation?.batchId === batch.id ? allocation.id : undefined,
        );
        const remaining = batch.quantity - allocated;
        return { batch, remaining };
      })
      .filter(
        (item) =>
          item.remaining > 0 || (isEdit && item.batch.id === allocation?.batchId),
      );
  }, [batches, allocations, allocation, isEdit]);

  const [batchId, setBatchId] = useState(
    allocation?.batchId ?? batchesWithCapacity[0]?.batch.id ?? "",
  );
  const [supplyChainId, setSupplyChainId] = useState(
    allocation?.supplyChainId ?? activeSupplyChains[0]?.id ?? "",
  );
  const [quantity, setQuantity] = useState(
    allocation ? String(allocation.quantity) : "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedBatchCapacity = useMemo(() => {
    const item = batchesWithCapacity.find((entry) => entry.batch.id === batchId);
    return item?.remaining ?? 0;
  }, [batchesWithCapacity, batchId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setIsSubmitting(true);

    const parsedQuantity = Number(quantity);

    try {
      if (isEdit && allocation) {
        await updateBatchAllocation(allocation.id, { quantity: parsedQuantity });
        showSuccessToast("Allocation updated successfully.");
      } else {
        await createBatchAllocation({
          batchId,
          supplyChainId,
          quantity: parsedQuantity,
        });
        showSuccessToast("Batch allocated successfully.");
      }
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      if (isAppError(err)) {
        showErrorToast(err.message);
      } else {
        showErrorToast("Failed to save allocation. Please try again.");
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
          <DialogTitle>{isEdit ? "Edit allocation" : "Allocate batch"}</DialogTitle>
          <DialogDescription>
            Assign batch quantity to an active supply chain. Over-allocation is
            rejected.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="gap-section flex flex-col">
          <div className="gap-card flex flex-col">
            <Label>Batch</Label>
            <Select
              value={batchId}
              onValueChange={(value): void => {
                if (value !== null) {
                  setBatchId(value);
                }
              }}
              disabled={isSubmitting || isEdit}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select batch" />
              </SelectTrigger>
              <SelectContent>
                {batchesWithCapacity.map(({ batch, remaining }) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.batchNumber} — {remaining.toLocaleString()} {batch.unit}{" "}
                    remaining
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="gap-card flex flex-col">
            <Label>Supply chain</Label>
            <Select
              value={supplyChainId}
              onValueChange={(value): void => {
                if (value !== null) {
                  setSupplyChainId(value);
                }
              }}
              disabled={isSubmitting || isEdit}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select supply chain" />
              </SelectTrigger>
              <SelectContent>
                {activeSupplyChains.map((chain) => (
                  <SelectItem key={chain.id} value={chain.id}>
                    {chain.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="gap-card flex flex-col">
            <Label htmlFor="allocation-quantity">Quantity</Label>
            <Input
              id="allocation-quantity"
              type="number"
              min={1}
              max={selectedBatchCapacity}
              step="any"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              required
              disabled={isSubmitting}
            />
            <p className="text-muted-foreground text-xs">
              Remaining unallocated: {selectedBatchCapacity.toLocaleString()}
            </p>
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
              disabled={
                isSubmitting ||
                batchesWithCapacity.length === 0 ||
                activeSupplyChains.length === 0
              }
            >
              {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Allocate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
