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
import {
  SUPPLY_CHAIN_STATUSES,
  SUPPLY_CHAIN_STATUS_LABELS,
  type SupplyChainStatus,
} from "@/config/supply-chain-status";
import { generateSupplyChainCodeFromName } from "@/lib/supply-chain/code-generator";
import { isAppError } from "@/lib/errors";
import { showErrorToast, showSuccessToast } from "@/lib/toast/notify";
import { createSupplyChain, updateSupplyChain } from "@/services/supply-chains.service";
import type { SupplyChainInterface } from "@/types/supply-chain.interface";

export interface SupplyChainFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplyChain?: SupplyChainInterface;
}

/**
 * SupplyChainFormDialog
 *
 * Create/edit dialog for supply chains with auto-generated code.
 */
export function SupplyChainFormDialog({
  open,
  onOpenChange,
  supplyChain,
}: SupplyChainFormDialogProps): React.JSX.Element {
  const router = useRouter();
  const isEdit = Boolean(supplyChain);

  const [name, setName] = useState(supplyChain?.name ?? "");
  const [code, setCode] = useState(supplyChain?.code ?? "");
  const [description, setDescription] = useState(supplyChain?.description ?? "");
  const [status, setStatus] = useState<SupplyChainStatus>(
    supplyChain?.status ?? "ACTIVE",
  );
  const [codeManuallyEdited, setCodeManuallyEdited] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleNameChange(value: string): void {
    setName(value);
    if (!codeManuallyEdited) {
      setCode(generateSupplyChainCodeFromName(value));
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
      description: description.trim() || undefined,
      status,
    };

    try {
      if (isEdit && supplyChain) {
        await updateSupplyChain(supplyChain.id, payload);
        showSuccessToast(`"${name}" updated successfully.`);
      } else {
        await createSupplyChain(payload);
        showSuccessToast(`"${name}" created successfully.`);
      }
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      if (isAppError(err)) {
        showErrorToast(err.message);
      } else {
        showErrorToast("Failed to save supply chain. Please try again.");
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
          <DialogTitle>{isEdit ? "Edit supply chain" : "Add supply chain"}</DialogTitle>
          <DialogDescription>
            Define a traceability journey route for batch allocation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="gap-section flex flex-col">
          <div className="gap-card flex flex-col">
            <Label htmlFor="chain-name">Name</Label>
            <Input
              id="chain-name"
              value={name}
              onChange={(event) => handleNameChange(event.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="gap-card flex flex-col">
            <Label htmlFor="chain-code">Code</Label>
            <Input
              id="chain-code"
              value={code}
              onChange={(event) => handleCodeChange(event.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="gap-card flex flex-col">
            <Label htmlFor="chain-description">Description (optional)</Label>
            <Input
              id="chain-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={isSubmitting}
            />
          </div>
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
                {SUPPLY_CHAIN_STATUSES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {SUPPLY_CHAIN_STATUS_LABELS[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving…"
                : isEdit
                  ? "Save changes"
                  : "Create supply chain"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
