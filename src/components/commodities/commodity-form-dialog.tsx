"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadIcon } from "lucide-react";

import { CommodityImageUpload } from "@/components/commodities/commodity-image-upload";
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
import {
  COMMODITY_UNIT_LABELS,
  COMMODITY_UNITS,
  type CommodityUnit,
} from "@/config/commodity-units";
import { cn } from "@/lib/utils";
import { isAppError } from "@/lib/errors";
import { showErrorToast, showSuccessToast } from "@/lib/toast/notify";
import { createCommodity, updateCommodity } from "@/services/commodities.service";
import type { CommodityInterface } from "@/types/commodity.interface";

const CREATE_WIZARD_STEPS = ["Details", "Unit & image", "Review"] as const;

export interface CommodityFormDialogProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Called when open state should change. */
  onOpenChange: (open: boolean) => void;
  /** Commodity to edit — omit for create mode. */
  commodity?: CommodityInterface;
}

/**
 * CommodityFormDialog
 *
 * Stepped create wizard (Details → Unit & image → Review) and compact edit form.
 * Codes are server-generated and immutable; never sent on create/update.
 */
export function CommodityFormDialog({
  open,
  onOpenChange,
  commodity,
}: CommodityFormDialogProps): React.JSX.Element {
  const router = useRouter();
  const isEdit = Boolean(commodity);

  const [step, setStep] = useState(0);
  const [name, setName] = useState(commodity?.name ?? "");
  const [unit, setUnit] = useState<CommodityUnit>(commodity?.unit ?? "KG");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUploadKey, setImageUploadKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reviewImageUrl = useMemo((): string | undefined => {
    if (!imageFile) {
      return undefined;
    }
    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  useEffect((): (() => void) | void => {
    return (): void => {
      if (reviewImageUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(reviewImageUrl);
      }
    };
  }, [reviewImageUrl]);

  function resetWizardState(): void {
    setStep(0);
    setName(commodity?.name ?? "");
    setUnit(commodity?.unit ?? "KG");
    setImageFile(null);
    setImageUploadKey((current) => current + 1);
  }

  function handleOpenChange(nextOpen: boolean): void {
    resetWizardState();
    onOpenChange(nextOpen);
  }

  function isNameValid(): boolean {
    return name.trim().length >= 2;
  }

  function isUnitValid(): boolean {
    return COMMODITY_UNITS.includes(unit);
  }

  function canProceedFromStep(currentStep: number): boolean {
    if (currentStep === 0) {
      return isNameValid();
    }
    if (currentStep === 1) {
      return isUnitValid();
    }
    return isNameValid() && isUnitValid();
  }

  function canSubmitEdit(): boolean {
    return isNameValid() && isUnitValid();
  }

  async function handleSubmit(): Promise<void> {
    setIsSubmitting(true);

    const payload = {
      name,
      unit,
      imageFile,
    };

    try {
      if (isEdit && commodity) {
        await updateCommodity(commodity.id, payload);
        showSuccessToast(`"${name}" updated successfully.`);
      } else {
        await createCommodity(payload);
        showSuccessToast(`"${name}" created successfully.`);
      }
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      if (isAppError(err)) {
        showErrorToast(err.message);
      } else {
        showErrorToast("Failed to save commodity. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isEdit) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit commodity</DialogTitle>
            <DialogDescription>
              Update commodity details and optionally replace the image.
            </DialogDescription>
          </DialogHeader>
          <div className="gap-section flex flex-col">
            <div className="gap-card flex flex-col">
              <Label htmlFor="commodity-name">Name</Label>
              <Input
                id="commodity-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Cocoa"
                required
                disabled={isSubmitting}
              />
            </div>
            {commodity ? (
              <div className="gap-card flex flex-col">
                <Label>Code</Label>
                <code className="text-sm">{commodity.code}</code>
              </div>
            ) : null}
            <div className="gap-card flex flex-col">
              <Label>Unit of measurement</Label>
              <Select
                value={unit}
                onValueChange={(value) => setUnit(value as CommodityUnit)}
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {COMMODITY_UNITS.map((unitOption) => (
                    <SelectItem key={unitOption} value={unitOption}>
                      {COMMODITY_UNIT_LABELS[unitOption]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <CommodityImageUpload
              key={imageUploadKey}
              previewUrl={commodity?.imageUrl}
              onFileChange={setImageFile}
              disabled={isSubmitting}
            />
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
                type="button"
                disabled={isSubmitting || !canSubmitEdit()}
                onClick={(): void => void handleSubmit()}
              >
                {isSubmitting ? "Saving…" : "Save changes"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const lastStepIndex = CREATE_WIZARD_STEPS.length - 1;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-md flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Add commodity</DialogTitle>
          <DialogDescription>
            Step {step + 1} of {CREATE_WIZARD_STEPS.length}: {CREATE_WIZARD_STEPS[step]}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          {CREATE_WIZARD_STEPS.map((label, index) => (
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
                <Label htmlFor="commodity-name">Name</Label>
                <Input
                  id="commodity-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Cocoa"
                  required
                  disabled={isSubmitting}
                />
                <p className="text-muted-foreground text-xs">At least 2 characters.</p>
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="gap-section flex flex-col">
              <div className="gap-card flex flex-col">
                <Label>Unit of measurement</Label>
                <Select
                  value={unit}
                  onValueChange={(value) => setUnit(value as CommodityUnit)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMODITY_UNITS.map((unitOption) => (
                      <SelectItem key={unitOption} value={unitOption}>
                        {COMMODITY_UNIT_LABELS[unitOption]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <CommodityImageUpload
                key={imageUploadKey}
                onFileChange={setImageFile}
                disabled={isSubmitting}
              />
            </div>
          ) : null}

          {step === 2 ? (
            <div className="gap-section flex flex-col">
              <p className="text-muted-foreground text-sm">
                Review the commodity details before creating.
              </p>
              <div className="gap-card flex flex-col">
                <Label>Name</Label>
                <p className="text-sm">{name.trim()}</p>
              </div>
              <div className="gap-card flex flex-col">
                <Label>Unit</Label>
                <p className="text-sm">{COMMODITY_UNIT_LABELS[unit]}</p>
              </div>
              <div className="gap-card flex flex-col">
                <Label>Image</Label>
                <div className="border-border flex items-center gap-4 rounded-lg border p-4">
                  <div className="bg-muted relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md">
                    {reviewImageUrl ? (
                      <Image
                        src={reviewImageUrl}
                        alt="Commodity preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <UploadIcon className="text-muted-foreground size-6" />
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {imageFile ? imageFile.name : "No image selected"}
                  </p>
                </div>
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
            {step < lastStepIndex ? (
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
                {isSubmitting ? "Saving…" : "Create commodity"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
