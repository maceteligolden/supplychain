"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { isAppError } from "@/lib/errors";
import { showErrorToast, showSuccessToast } from "@/lib/toast/notify";
import { deleteBatchAllocation } from "@/services/batch-allocations.service";
import type { BatchAllocationInterface } from "@/types/batch-allocation.interface";

export interface AllocationDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allocation: BatchAllocationInterface | null;
}

/**
 * AllocationDeleteDialog
 *
 * Confirmation dialog before deleting a batch allocation.
 */
export function AllocationDeleteDialog({
  open,
  onOpenChange,
  allocation,
}: AllocationDeleteDialogProps): React.JSX.Element {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete(): Promise<void> {
    if (!allocation) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteBatchAllocation(allocation.id);
      showSuccessToast("Allocation removed successfully.");
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      if (isAppError(err)) {
        showErrorToast(err.message);
      } else {
        showErrorToast("Failed to delete allocation. Please try again.");
      }
    } finally {
      setIsDeleting(false);
    }
  }

  function onConfirmClick(): void {
    void handleDelete();
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete allocation</AlertDialogTitle>
          <AlertDialogDescription>
            Remove this batch allocation? The batch unallocated quantity will increase.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isDeleting}
            onClick={onConfirmClick}
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
