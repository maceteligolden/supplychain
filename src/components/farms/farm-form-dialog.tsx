"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { LatLngExpression } from "leaflet";

import { FarmBoundaryDrawField } from "@/components/farms/farm-boundary-draw-field";
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
  FARM_STATUSES,
  FARM_STATUS_LABELS,
  type FarmStatus,
} from "@/config/farm-status";
import { createEmptyFarmLocation } from "@/lib/farm/empty-location";
import { createEmptyFarmOwner } from "@/lib/farm/empty-owner";
import { generateFarmCodeFromName } from "@/lib/farm/code-generator";
import { cn } from "@/lib/utils";
import { isAppError } from "@/lib/errors";
import { showErrorToast, showSuccessToast } from "@/lib/toast/notify";
import { upsertFarmBoundary } from "@/services/farm-boundaries.service";
import { createFarm, updateFarm } from "@/services/farms.service";
import type { CommodityInterface } from "@/types/commodity.interface";
import type { GeoCoordinateInterface } from "@/types/farm-boundary.interface";
import type { FarmInterface } from "@/types/farm.interface";

const CREATE_WIZARD_STEPS = [
  "Farm",
  "Owner",
  "Location",
  "Boundary",
  "Compliance",
] as const;
const EDIT_WIZARD_STEPS = ["Farm", "Owner", "Location", "Compliance"] as const;

type WizardStepKind = "farm" | "owner" | "location" | "boundary" | "compliance";

function getStepKind(step: number, isEdit: boolean): WizardStepKind {
  if (step === 0) {
    return "farm";
  }
  if (step === 1) {
    return "owner";
  }
  if (step === 2) {
    return "location";
  }
  if (!isEdit && step === 3) {
    return "boundary";
  }
  return "compliance";
}

export interface FarmFormDialogProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Called when open state should change. */
  onOpenChange: (open: boolean) => void;
  /** Farm to edit — omit for create mode. */
  farm?: FarmInterface;
  /** Commodities available for multi-select. */
  commodities: CommodityInterface[];
}

/**
 * FarmFormDialog
 *
 * Multi-step wizard for creating or editing farms with optional skippable steps.
 */
export function FarmFormDialog({
  open,
  onOpenChange,
  farm,
  commodities,
}: FarmFormDialogProps): React.JSX.Element {
  const router = useRouter();
  const isEdit = Boolean(farm);
  const wizardSteps = isEdit ? EDIT_WIZARD_STEPS : CREATE_WIZARD_STEPS;

  const [step, setStep] = useState(0);
  const [name, setName] = useState(farm?.name ?? "");
  const [code, setCode] = useState(farm?.code ?? "");
  const [commodityIds, setCommodityIds] = useState<string[]>(farm?.commodityIds ?? []);
  const [ownerFirstName, setOwnerFirstName] = useState(farm?.owner.firstName ?? "");
  const [ownerLastName, setOwnerLastName] = useState(farm?.owner.lastName ?? "");
  const [ownerPhone, setOwnerPhone] = useState(farm?.owner.phone ?? "");
  const [ownerEmail, setOwnerEmail] = useState(farm?.owner.email ?? "");
  const [country, setCountry] = useState(farm?.location.country ?? "");
  const [region, setRegion] = useState(farm?.location.region ?? "");
  const [city, setCity] = useState(farm?.location.city ?? "");
  const [latitude, setLatitude] = useState(
    farm?.location.latitude !== undefined ? String(farm.location.latitude) : "",
  );
  const [longitude, setLongitude] = useState(
    farm?.location.longitude !== undefined ? String(farm.location.longitude) : "",
  );
  const [boundaryCoordinates, setBoundaryCoordinates] = useState<
    GeoCoordinateInterface[]
  >([]);
  const [boundaryShapeClosed, setBoundaryShapeClosed] = useState(false);
  const [annualProduction, setAnnualProduction] = useState(
    farm?.annualProductionEstimateKg !== undefined
      ? String(farm.annualProductionEstimateKg)
      : "",
  );
  const [declarationAccepted, setDeclarationAccepted] = useState(
    farm?.declarationAccepted ?? false,
  );
  const [status, setStatus] = useState<FarmStatus>(farm?.status ?? "DRAFT");
  const [codeManuallyEdited, setCodeManuallyEdited] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const boundaryMapCenter = useMemo((): LatLngExpression | undefined => {
    const parsedLatitude = latitude.trim() ? Number(latitude) : undefined;
    const parsedLongitude = longitude.trim() ? Number(longitude) : undefined;
    if (parsedLatitude !== undefined && parsedLongitude !== undefined) {
      return [parsedLatitude, parsedLongitude];
    }
    return undefined;
  }, [latitude, longitude]);

  function resetWizardState(): void {
    setStep(0);
    setName(farm?.name ?? "");
    setCode(farm?.code ?? "");
    setCommodityIds(farm?.commodityIds ?? []);
    setOwnerFirstName(farm?.owner.firstName ?? "");
    setOwnerLastName(farm?.owner.lastName ?? "");
    setOwnerPhone(farm?.owner.phone ?? "");
    setOwnerEmail(farm?.owner.email ?? "");
    setCountry(farm?.location.country ?? "");
    setRegion(farm?.location.region ?? "");
    setCity(farm?.location.city ?? "");
    setLatitude(
      farm?.location.latitude !== undefined ? String(farm.location.latitude) : "",
    );
    setLongitude(
      farm?.location.longitude !== undefined ? String(farm.location.longitude) : "",
    );
    setBoundaryCoordinates([]);
    setBoundaryShapeClosed(false);
    setAnnualProduction(
      farm?.annualProductionEstimateKg !== undefined
        ? String(farm.annualProductionEstimateKg)
        : "",
    );
    setDeclarationAccepted(farm?.declarationAccepted ?? false);
    setStatus(farm?.status ?? "DRAFT");
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
      setCode(generateFarmCodeFromName(value));
    }
  }

  function toggleCommodity(commodityId: string): void {
    setCommodityIds((current) =>
      current.includes(commodityId)
        ? current.filter((id) => id !== commodityId)
        : [...current, commodityId],
    );
  }

  function canProceedFromStep(currentStep: number): boolean {
    const kind = getStepKind(currentStep, isEdit);
    if (kind === "farm") {
      return (
        name.trim().length >= 2 && code.trim().length >= 2 && commodityIds.length > 0
      );
    }
    if (kind === "location") {
      return (
        country.trim().length >= 1 &&
        region.trim().length >= 1 &&
        city.trim().length >= 1
      );
    }
    return true;
  }

  function applySkipDefaults(currentStep: number): void {
    if (isEdit) {
      return;
    }

    const kind = getStepKind(currentStep, isEdit);
    if (kind === "owner") {
      const empty = createEmptyFarmOwner();
      setOwnerFirstName(empty.firstName);
      setOwnerLastName(empty.lastName);
      setOwnerPhone(empty.phone);
      setOwnerEmail(empty.email);
    }

    if (kind === "location") {
      const empty = createEmptyFarmLocation();
      setCountry(empty.country);
      setRegion(empty.region);
      setCity(empty.city);
      setLatitude("");
      setLongitude("");
    }

    if (kind === "boundary") {
      setBoundaryCoordinates([]);
      setBoundaryShapeClosed(false);
    }

    if (kind === "compliance") {
      setAnnualProduction("");
      setDeclarationAccepted(false);
    }
  }

  function handleSkip(): void {
    applySkipDefaults(step);
    setStep((current) => current + 1);
  }

  function handleNext(): void {
    if (!canProceedFromStep(step)) {
      showErrorToast("Complete the required fields before continuing.");
      return;
    }
    setStep((current) => current + 1);
  }

  async function handleSubmit(): Promise<void> {
    setIsSubmitting(true);

    const parsedLatitude = latitude.trim() ? Number(latitude) : undefined;
    const parsedLongitude = longitude.trim() ? Number(longitude) : undefined;
    const parsedProduction = annualProduction.trim()
      ? Number(annualProduction)
      : undefined;

    const payload = {
      name,
      code,
      owner: {
        firstName: ownerFirstName,
        lastName: ownerLastName,
        phone: ownerPhone,
        email: ownerEmail,
      },
      commodityIds,
      location: {
        country,
        region,
        city,
        latitude: parsedLatitude,
        longitude: parsedLongitude,
      },
      annualProductionEstimateKg: parsedProduction,
      declarationAccepted,
      ...(isEdit ? { status } : {}),
    };

    try {
      if (isEdit && farm) {
        await updateFarm(farm.id, payload);
        showSuccessToast(`"${name}" updated successfully.`);
      } else {
        const created = await createFarm({
          ...payload,
          status: "DRAFT",
        });

        if (boundaryShapeClosed && boundaryCoordinates.length >= 3) {
          await upsertFarmBoundary(created.id, { coordinates: boundaryCoordinates });
        }

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

  const stepKind = getStepKind(step, isEdit);
  const isOptionalStep =
    stepKind === "owner" ||
    stepKind === "location" ||
    stepKind === "boundary" ||
    stepKind === "compliance";
  const lastStepIndex = wizardSteps.length - 1;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-lg flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit farm" : "Add farm"}</DialogTitle>
          <DialogDescription>
            Step {step + 1} of {wizardSteps.length}: {wizardSteps[step]}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          {wizardSteps.map((label, index) => (
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
          {stepKind === "farm" ? (
            <div className="gap-section flex flex-col">
              <div className="gap-card flex flex-col">
                <Label htmlFor="farm-name">Name</Label>
                <Input
                  id="farm-name"
                  value={name}
                  onChange={(event) => handleNameChange(event.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="gap-card flex flex-col">
                <Label htmlFor="farm-code">Code</Label>
                <Input
                  id="farm-code"
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
                <Label>Commodities</Label>
                <p className="text-muted-foreground text-xs">
                  Select one or more commodities grown at this farm.
                </p>
                <div className="flex flex-col gap-2">
                  {commodities.map((commodity) => {
                    const selected = commodityIds.includes(commodity.id);
                    return (
                      <button
                        key={commodity.id}
                        type="button"
                        disabled={isSubmitting}
                        onClick={(): void => toggleCommodity(commodity.id)}
                        className={cn(
                          "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                          selected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted/50",
                        )}
                      >
                        {commodity.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}

          {stepKind === "owner" ? (
            <div className="gap-section flex flex-col">
              <p className="text-muted-foreground text-sm">
                Optional — add the farm owner contact details or skip for now.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="gap-card flex flex-col">
                  <Label htmlFor="owner-first-name">First name</Label>
                  <Input
                    id="owner-first-name"
                    value={ownerFirstName}
                    onChange={(event) => setOwnerFirstName(event.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="gap-card flex flex-col">
                  <Label htmlFor="owner-last-name">Last name</Label>
                  <Input
                    id="owner-last-name"
                    value={ownerLastName}
                    onChange={(event) => setOwnerLastName(event.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="gap-card flex flex-col">
                <Label htmlFor="owner-phone">Phone</Label>
                <Input
                  id="owner-phone"
                  value={ownerPhone}
                  onChange={(event) => setOwnerPhone(event.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="gap-card flex flex-col">
                <Label htmlFor="owner-email">Email</Label>
                <Input
                  id="owner-email"
                  type="email"
                  value={ownerEmail}
                  onChange={(event) => setOwnerEmail(event.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          ) : null}

          {stepKind === "location" ? (
            <div className="gap-section flex flex-col">
              <p className="text-muted-foreground text-sm">
                Optional — enter the farm location or skip for now.
              </p>
              <div className="gap-card flex flex-col">
                <Label htmlFor="farm-country">Country</Label>
                <Input
                  id="farm-country"
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="gap-card flex flex-col">
                  <Label htmlFor="farm-region">Region</Label>
                  <Input
                    id="farm-region"
                    value={region}
                    onChange={(event) => setRegion(event.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="gap-card flex flex-col">
                  <Label htmlFor="farm-city">City</Label>
                  <Input
                    id="farm-city"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="gap-card flex flex-col">
                  <Label htmlFor="farm-latitude">Latitude (optional)</Label>
                  <Input
                    id="farm-latitude"
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(event) => setLatitude(event.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="gap-card flex flex-col">
                  <Label htmlFor="farm-longitude">Longitude (optional)</Label>
                  <Input
                    id="farm-longitude"
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(event) => setLongitude(event.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {stepKind === "boundary" ? (
            <div className="gap-section flex flex-col">
              <p className="text-muted-foreground text-sm">
                Optional — draw the farm boundary on the map or skip and map it later on
                the farm detail page.
              </p>
              <FarmBoundaryDrawField
                center={boundaryMapCenter}
                coordinates={boundaryCoordinates}
                onCoordinatesChange={setBoundaryCoordinates}
                isShapeClosed={boundaryShapeClosed}
                onShapeClosedChange={setBoundaryShapeClosed}
                disabled={isSubmitting}
              />
            </div>
          ) : null}

          {stepKind === "compliance" ? (
            <div className="gap-section flex flex-col">
              <p className="text-muted-foreground text-sm">
                Optional compliance details — skip if not ready yet.
              </p>
              {isEdit ? (
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
                      {FARM_STATUSES.map((option) => (
                        <SelectItem key={option} value={option}>
                          {FARM_STATUS_LABELS[option]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
              <div className="gap-card flex flex-col">
                <Label htmlFor="annual-production">
                  Annual production estimate (kg)
                </Label>
                <Input
                  id="annual-production"
                  type="number"
                  min={0}
                  step="any"
                  value={annualProduction}
                  onChange={(event) => setAnnualProduction(event.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={declarationAccepted}
                  onChange={(event) => setDeclarationAccepted(event.target.checked)}
                  disabled={isSubmitting}
                />
                Declaration accepted
              </label>
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
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={(): void => onOpenChange(false)}
            >
              Cancel
            </Button>
            {isOptionalStep && step < lastStepIndex ? (
              <Button
                type="button"
                variant="ghost"
                disabled={isSubmitting}
                onClick={handleSkip}
              >
                Skip for now
              </Button>
            ) : null}
            {step < lastStepIndex ? (
              <Button type="button" disabled={isSubmitting} onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={(): void => void handleSubmit()}
              >
                {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Create farm"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
