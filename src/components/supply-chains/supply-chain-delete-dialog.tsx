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
import { deleteSupplyChain } from "@/services/supply-chains.service";
import type { SupplyChainInterface } from "@/types/supply-chain.interface";

export interface SupplyChainDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplyChain: SupplyChainInterface | null;
}

/**
 * SupplyChainDeleteDialog
 *
 * Confirmation dialog before deleting a supply chain.
 */
export function SupplyChainDeleteDialog({
  open,
  onOpenChange,
  supplyChain,
}: SupplyChainDeleteDialogProps): React.JSX.Element {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete(): Promise<void> {
    if (!supplyChain) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteSupplyChain(supplyChain.id);
      showSuccessToast(`"${supplyChain.name}" deleted successfully.`);
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      if (isAppError(err)) {
        showErrorToast(err.message);
      } else {
        showErrorToast("Failed to delete supply chain. Please try again.");
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
          <AlertDialogTitle>Delete supply chain</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="text-foreground font-medium">{supplyChain?.name}</span>?
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
