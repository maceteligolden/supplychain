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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  ACTOR_STATUSES,
  ACTOR_STATUS_LABELS,
  ACTOR_TYPES,
  ACTOR_TYPE_LABELS,
  type ActorStatus,
  type ActorType,
} from "@/config/actor-types";
import { generateActorCodeFromName } from "@/lib/actor/code-generator";
import { isAppError } from "@/lib/errors";
import { showErrorToast, showSuccessToast } from "@/lib/toast/notify";
import { createActor, updateActor } from "@/services/actors.service";
import type { ActorInterface } from "@/types/actor.interface";

const WIZARD_STEPS = ["Organisation", "Address", "Status"] as const;

export interface ActorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actor?: ActorInterface;
}

/**
 * ActorFormDialog
 *
 * Three-step wizard for creating or editing supply chain actors.
 */
export function ActorFormDialog({
  open,
  onOpenChange,
  actor,
}: ActorFormDialogProps): React.JSX.Element {
  const router = useRouter();
  const isEdit = Boolean(actor);

  const [step, setStep] = useState(0);
  const [name, setName] = useState(actor?.name ?? "");
  const [code, setCode] = useState(actor?.code ?? "");
  const [type, setType] = useState<ActorType>(actor?.type ?? "PROCESSOR");
  const [line1, setLine1] = useState(actor?.address.line1 ?? "");
  const [city, setCity] = useState(actor?.address.city ?? "");
  const [region, setRegion] = useState(actor?.address.region ?? "");
  const [country, setCountry] = useState(actor?.address.country ?? "");
  const [status, setStatus] = useState<ActorStatus>(actor?.status ?? "ACTIVE");
  const [codeManuallyEdited, setCodeManuallyEdited] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function resetWizardState(): void {
    setStep(0);
    setName(actor?.name ?? "");
    setCode(actor?.code ?? "");
    setType(actor?.type ?? "PROCESSOR");
    setLine1(actor?.address.line1 ?? "");
    setCity(actor?.address.city ?? "");
    setRegion(actor?.address.region ?? "");
    setCountry(actor?.address.country ?? "");
    setStatus(actor?.status ?? "ACTIVE");
    setCodeManuallyEdited(isEdit);
  }

  function handleOpenChange(nextOpen: boolean): void {
    if (nextOpen) {
      resetWizardState();
    }
    onOpenChange(nextOpen);
  }

  function handleNameChange(value: string): void {
    setName(value);
    if (!codeManuallyEdited) {
      setCode(generateActorCodeFromName(value));
    }
  }

  function canProceedFromStep(currentStep: number): boolean {
    if (currentStep === 0) {
      return name.trim().length >= 2 && code.trim().length >= 2;
    }
    if (currentStep === 1) {
      return (
        city.trim().length >= 1 &&
        region.trim().length >= 1 &&
        country.trim().length >= 1
      );
    }
    return true;
  }

  async function handleSubmit(): Promise<void> {
    setIsSubmitting(true);

    const payload = {
      name,
      code,
      type,
      address: {
        line1: line1.trim() || undefined,
        city,
        region,
        country,
      },
      status,
    };

    try {
      if (isEdit && actor) {
        await updateActor(actor.id, payload);
        showSuccessToast(`"${name}" updated successfully.`);
      } else {
        await createActor(payload);
        showSuccessToast(`"${name}" created successfully.`);
      }
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      if (isAppError(err)) {
        showErrorToast(err.message);
      } else {
        showErrorToast("Failed to save actor. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-md flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit actor" : "Add actor"}</DialogTitle>
          <DialogDescription>
            Step {step + 1} of {WIZARD_STEPS.length}: {WIZARD_STEPS[step]}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          {WIZARD_STEPS.map((label, index) => (
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
                <Label htmlFor="actor-name">Name</Label>
                <Input
                  id="actor-name"
                  value={name}
                  onChange={(event) => handleNameChange(event.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="gap-card flex flex-col">
                <Label htmlFor="actor-code">Code</Label>
                <Input
                  id="actor-code"
                  value={code}
                  onChange={(event): void => {
                    setCodeManuallyEdited(true);
                    setCode(event.target.value.toUpperCase());
                  }}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="gap-card flex flex-col">
                <Label>Type</Label>
                <Select
                  value={type}
                  onValueChange={(value): void => {
                    if (value !== null) {
                      setType(value);
                    }
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTOR_TYPES.map((option) => (
                      <SelectItem key={option} value={option}>
                        {ACTOR_TYPE_LABELS[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="gap-section flex flex-col">
              <div className="gap-card flex flex-col">
                <Label htmlFor="actor-line1">Address line (optional)</Label>
                <Input
                  id="actor-line1"
                  value={line1}
                  onChange={(event) => setLine1(event.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="gap-card flex flex-col">
                  <Label htmlFor="actor-city">City</Label>
                  <Input
                    id="actor-city"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="gap-card flex flex-col">
                  <Label htmlFor="actor-region">Region</Label>
                  <Input
                    id="actor-region"
                    value={region}
                    onChange={(event) => setRegion(event.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="gap-card flex flex-col">
                <Label htmlFor="actor-country">Country</Label>
                <Input
                  id="actor-country"
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="gap-section flex flex-col">
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
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTOR_STATUSES.map((option) => (
                      <SelectItem key={option} value={option}>
                        {ACTOR_STATUS_LABELS[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground text-xs">
                  Only active actors appear when recording supply chain events.
                </p>
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
            {step < WIZARD_STEPS.length - 1 ? (
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
                {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Create actor"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
