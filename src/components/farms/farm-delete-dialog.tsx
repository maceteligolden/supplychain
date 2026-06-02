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
import { deleteFarm } from "@/services/farms.service";
import type { FarmInterface } from "@/types/farm.interface";

export interface FarmDeleteDialogProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Called when open state should change. */
  onOpenChange: (open: boolean) => void;
  /** Farm to delete — required when open. */
  farm: FarmInterface | null;
}

/**
 * FarmDeleteDialog
 *
 * Confirmation dialog before deleting a farm. Calls the delete
 * service and refreshes the page on success.
 */
export function FarmDeleteDialog({
  open,
  onOpenChange,
  farm,
}: FarmDeleteDialogProps): React.JSX.Element {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete(): Promise<void> {
    if (!farm) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteFarm(farm.id);
      showSuccessToast(`"${farm.name}" deleted successfully.`);
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      if (isAppError(err)) {
        showErrorToast(err.message);
      } else {
        showErrorToast("Failed to delete farm. Please try again.");
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
          <AlertDialogTitle>Delete farm</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="text-foreground font-medium">{farm?.name}</span>? This
            action cannot be undone.
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
