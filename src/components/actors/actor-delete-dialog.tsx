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
import { deleteActor } from "@/services/actors.service";
import type { ActorInterface } from "@/types/actor.interface";

export interface ActorDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actor: ActorInterface | null;
}

/**
 * ActorDeleteDialog
 *
 * Confirmation dialog before deleting an actor.
 */
export function ActorDeleteDialog({
  open,
  onOpenChange,
  actor,
}: ActorDeleteDialogProps): React.JSX.Element {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete(): Promise<void> {
    if (!actor) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteActor(actor.id);
      showSuccessToast(`"${actor.name}" deleted successfully.`);
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      if (isAppError(err)) {
        showErrorToast(err.message);
      } else {
        showErrorToast("Failed to delete actor. Please try again.");
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
          <AlertDialogTitle>Delete actor</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="text-foreground font-medium">{actor?.name}</span>? Actors
            referenced by events cannot be deleted.
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
