"use client";

import { CheckIcon, CircleIcon, Loader2Icon, MinusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { BatchCreationStepInterface } from "@/types/batch.interface";

export interface BatchCreationProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Steps returned from batch creation workflow. */
  steps: BatchCreationStepInterface[];
  /** Whether the workflow is still running. */
  isRunning: boolean;
  /** Called when the user dismisses the completed dialog. */
  onDone: () => void;
}

function StepIcon({
  status,
  isActive,
}: {
  status: BatchCreationStepInterface["status"];
  isActive: boolean;
}): React.JSX.Element {
  if (isActive && status === "pending") {
    return <Loader2Icon className="text-primary size-4 animate-spin" />;
  }

  if (status === "completed") {
    return <CheckIcon className="text-primary size-4" />;
  }

  if (status === "skipped") {
    return <MinusIcon className="text-muted-foreground size-4" />;
  }

  if (status === "failed") {
    return <CircleIcon className="text-destructive size-4" />;
  }

  return <CircleIcon className="text-muted-foreground size-4" />;
}

/**
 * BatchCreationProgressDialog
 *
 * Shows workflow steps while creating a harvest batch and running deforestation checks.
 */
export function BatchCreationProgressDialog({
  open,
  onOpenChange,
  steps,
  isRunning,
  onDone,
}: BatchCreationProgressDialogProps): React.JSX.Element {
  const firstPendingIndex = steps.findIndex((step) => step.status === "pending");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={!isRunning}>
        <DialogHeader>
          <DialogTitle>
            {isRunning ? "Creating harvest batch…" : "Harvest batch created"}
          </DialogTitle>
          <DialogDescription>
            {isRunning
              ? "Please wait while we record the batch and run compliance checks."
              : "All workflow steps have finished."}
          </DialogDescription>
        </DialogHeader>
        <ol className="flex flex-col gap-3 py-2">
          {steps.map((step, index) => {
            const isActive = isRunning && index === firstPendingIndex;

            return (
              <li key={step.id} className="flex items-start gap-3">
                <span
                  className={cn(
                    "bg-background mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border",
                    step.status === "completed" && "border-primary",
                    step.status === "failed" && "border-destructive",
                  )}
                >
                  <StepIcon status={step.status} isActive={isActive} />
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      step.status === "pending" && !isActive && "text-muted-foreground",
                      step.status === "skipped" && "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </p>
                  {step.detail ? (
                    <p className="text-muted-foreground text-xs">{step.detail}</p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
        {!isRunning ? (
          <DialogFooter>
            <Button type="button" onClick={onDone}>
              Done
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
