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
import { deleteBatch } from "@/services/batches.service";
import type { BatchInterface } from "@/types/batch.interface";

export interface BatchDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch: BatchInterface | null;
}

/**
 * BatchDeleteDialog
 *
 * Confirmation dialog before deleting a harvest batch.
 */
export function BatchDeleteDialog({
  open,
  onOpenChange,
  batch,
}: BatchDeleteDialogProps): React.JSX.Element {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete(): Promise<void> {
    if (!batch) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteBatch(batch.id);
      showSuccessToast(`Batch "${batch.batchNumber}" deleted successfully.`);
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      if (isAppError(err)) {
        showErrorToast(err.message);
      } else {
        showErrorToast("Failed to delete batch. Please try again.");
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
          <AlertDialogTitle>Delete batch</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete batch{" "}
            <span className="text-foreground font-medium">{batch?.batchNumber}</span>?
            Batches with allocations cannot be deleted.
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
