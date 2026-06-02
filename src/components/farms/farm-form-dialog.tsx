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
import { generateFarmCodeFromName } from "@/lib/farm/code-generator";
import { isAppError } from "@/lib/errors";
import { showErrorToast, showSuccessToast } from "@/lib/toast/notify";
import { createFarm, updateFarm } from "@/services/farms.service";
import type { CommodityInterface } from "@/types/commodity.interface";
import type { FarmInterface } from "@/types/farm.interface";

export interface FarmFormDialogProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Called when open state should change. */
  onOpenChange: (open: boolean) => void;
  /** Farm to edit — omit for create mode. */
  farm?: FarmInterface;
  /** Commodities available for the farm commodity select. */
  commodities: CommodityInterface[];
}

/**
 * FarmFormDialog
 *
 * Create/edit dialog for farms. Auto-generates code from name (editable),
 * commodity select, and location fields including optional GPS coordinates.
 */
export function FarmFormDialog({
  open,
  onOpenChange,
  farm,
  commodities,
}: FarmFormDialogProps): React.JSX.Element {
  const router = useRouter();
  const isEdit = Boolean(farm);

  const [name, setName] = useState(farm?.name ?? "");
  const [code, setCode] = useState(farm?.code ?? "");
  const [commodityId, setCommodityId] = useState(
    farm?.commodityId ?? commodities[0]?.id ?? "",
  );
  const [country, setCountry] = useState(farm?.location.country ?? "");
  const [region, setRegion] = useState(farm?.location.region ?? "");
  const [city, setCity] = useState(farm?.location.city ?? "");
  const [latitude, setLatitude] = useState(
    farm?.location.latitude !== undefined ? String(farm.location.latitude) : "",
  );
  const [longitude, setLongitude] = useState(
    farm?.location.longitude !== undefined ? String(farm.location.longitude) : "",
  );
  const [codeManuallyEdited, setCodeManuallyEdited] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleNameChange(value: string): void {
    setName(value);
    if (!codeManuallyEdited) {
      setCode(generateFarmCodeFromName(value));
    }
  }

  function handleCodeChange(value: string): void {
    setCodeManuallyEdited(true);
    setCode(value.toUpperCase());
  }

  function parseOptionalCoordinate(value: string): number | undefined {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }

    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setIsSubmitting(true);

    const location = {
      country,
      region,
      city,
      latitude: parseOptionalCoordinate(latitude),
      longitude: parseOptionalCoordinate(longitude),
    };

    const payload = {
      name,
      code,
      commodityId,
      location,
    };

    try {
      if (isEdit && farm) {
        await updateFarm(farm.id, payload);
        showSuccessToast(`"${name}" updated successfully.`);
      } else {
        await createFarm(payload);
        showSuccessToast(`"${name}" created successfully.`);
      }
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      if (isAppError(err)) {
        showErrorToast(err.message);
      } else {
        showErrorToast("Failed to save farm. Please try again.");
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit farm" : "Add farm"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update farm details and location."
              : "Register a farm for traceability — link it to a commodity and location."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="gap-section flex flex-col">
          <div className="gap-card flex flex-col">
            <Label htmlFor="farm-name">Name</Label>
            <Input
              id="farm-name"
              value={name}
              onChange={(event) => handleNameChange(event.target.value)}
              placeholder="Ashanti Cocoa Farm"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="gap-card flex flex-col">
            <Label htmlFor="farm-code">Code</Label>
            <Input
              id="farm-code"
              value={code}
              onChange={(event) => handleCodeChange(event.target.value)}
              placeholder="ASHANTI_COCOA_FARM"
              required
              disabled={isSubmitting}
            />
            <p className="text-muted-foreground text-xs">
              Auto-generated from name — you can edit before saving.
            </p>
          </div>
          <div className="gap-card flex flex-col">
            <Label>Commodity</Label>
            <Select
              value={commodityId}
              onValueChange={(value): void => {
                if (value !== null) {
                  setCommodityId(value);
                }
              }}
              disabled={isSubmitting || commodities.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select commodity" />
              </SelectTrigger>
              <SelectContent>
                {commodities.map((commodity) => (
                  <SelectItem key={commodity.id} value={commodity.id}>
                    {commodity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="gap-card grid sm:grid-cols-3">
            <div className="gap-card flex flex-col">
              <Label htmlFor="farm-country">Country</Label>
              <Input
                id="farm-country"
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                placeholder="Ghana"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="gap-card flex flex-col">
              <Label htmlFor="farm-region">Region</Label>
              <Input
                id="farm-region"
                value={region}
                onChange={(event) => setRegion(event.target.value)}
                placeholder="Ashanti"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="gap-card flex flex-col">
              <Label htmlFor="farm-city">City</Label>
              <Input
                id="farm-city"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder="Kumasi"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className="gap-card grid sm:grid-cols-2">
            <div className="gap-card flex flex-col">
              <Label htmlFor="farm-latitude">Latitude (optional)</Label>
              <Input
                id="farm-latitude"
                type="number"
                step="any"
                min={-90}
                max={90}
                value={latitude}
                onChange={(event) => setLatitude(event.target.value)}
                placeholder="6.6885"
                disabled={isSubmitting}
              />
            </div>
            <div className="gap-card flex flex-col">
              <Label htmlFor="farm-longitude">Longitude (optional)</Label>
              <Input
                id="farm-longitude"
                type="number"
                step="any"
                min={-180}
                max={180}
                value={longitude}
                onChange={(event) => setLongitude(event.target.value)}
                placeholder="-1.6244"
                disabled={isSubmitting}
              />
            </div>
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
            <Button type="submit" disabled={isSubmitting || commodities.length === 0}>
              {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Create farm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
