"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
import { generateCommodityCodeFromName } from "@/lib/commodity/code-generator";
import { isAppError } from "@/lib/errors";
import { showErrorToast, showSuccessToast } from "@/lib/toast/notify";
import { createCommodity, updateCommodity } from "@/services/commodities.service";
import type { CommodityInterface } from "@/types/commodity.interface";

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
 * Create/edit dialog for commodities. Auto-generates code from name (editable),
 * unit select, and image upload stub. Persists via commodities service.
 */
export function CommodityFormDialog({
  open,
  onOpenChange,
  commodity,
}: CommodityFormDialogProps): React.JSX.Element {
  const router = useRouter();
  const isEdit = Boolean(commodity);

  const [name, setName] = useState(commodity?.name ?? "");
  const [code, setCode] = useState(commodity?.code ?? "");
  const [unit, setUnit] = useState<CommodityUnit>(commodity?.unit ?? "KG");
  const [codeManuallyEdited, setCodeManuallyEdited] = useState(isEdit);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleNameChange(value: string): void {
    setName(value);
    if (!codeManuallyEdited) {
      setCode(generateCommodityCodeFromName(value));
    }
  }

  function handleCodeChange(value: string): void {
    setCodeManuallyEdited(true);
    setCode(value.toUpperCase());
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setIsSubmitting(true);

    const payload = {
      name,
      code,
      unit,
      imageFileName: imageFile?.name,
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

  function onSubmit(event: React.FormEvent<HTMLFormElement>): void {
    void handleSubmit(event);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit commodity" : "Add commodity"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update commodity details. Image upload is a mock stub."
              : "Create a new commodity for the traceability platform."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="gap-section flex flex-col">
          <div className="gap-card flex flex-col">
            <Label htmlFor="commodity-name">Name</Label>
            <Input
              id="commodity-name"
              value={name}
              onChange={(event) => handleNameChange(event.target.value)}
              placeholder="Cocoa"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="gap-card flex flex-col">
            <Label htmlFor="commodity-code">Code</Label>
            <Input
              id="commodity-code"
              value={code}
              onChange={(event) => handleCodeChange(event.target.value)}
              placeholder="COCOA"
              required
              disabled={isSubmitting}
            />
            <p className="text-muted-foreground text-xs">
              Auto-generated from name — you can edit before saving.
            </p>
          </div>
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Create commodity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
