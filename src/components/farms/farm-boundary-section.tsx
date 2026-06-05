"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { LatLngExpression } from "leaflet";

import { FarmBoundaryMapLoader } from "@/components/farms/farm-boundary-map-loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { isAppError } from "@/lib/errors";
import { showErrorToast, showSuccessToast } from "@/lib/toast/notify";
import {
  deleteFarmBoundary,
  upsertFarmBoundary,
} from "@/services/farm-boundaries.service";
import type {
  FarmBoundaryInterface,
  GeoCoordinateInterface,
} from "@/types/farm-boundary.interface";
import type { FarmInterface } from "@/types/farm.interface";

const GHANA_DEFAULT_CENTER: LatLngExpression = [7.95, -1.03];

export interface FarmBoundarySectionProps {
  /** Farm whose boundary is being managed. */
  farm: FarmInterface;
  /** Existing boundary, if mapped. */
  boundary: FarmBoundaryInterface | null;
}

/**
 * FarmBoundarySection
 *
 * Farm detail section for viewing, drawing, and saving farm boundary polygons.
 */
export function FarmBoundarySection({
  farm,
  boundary,
}: FarmBoundarySectionProps): React.JSX.Element {
  const router = useRouter();
  const [isDrawing, setIsDrawing] = useState(false);
  const [draftCoordinates, setDraftCoordinates] = useState<GeoCoordinateInterface[]>(
    [],
  );
  const [isShapeClosed, setIsShapeClosed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mapCenter = useMemo((): LatLngExpression => {
    const { latitude, longitude } = farm.location;
    if (latitude !== undefined && longitude !== undefined) {
      return [latitude, longitude];
    }
    return GHANA_DEFAULT_CENTER;
  }, [farm.location]);

  const displayArea = boundary?.areaHectares ?? farm.areaHectares;

  function startDrawing(): void {
    setIsDrawing(true);
    setDraftCoordinates([]);
    setIsShapeClosed(false);
  }

  function cancelDrawing(): void {
    setIsDrawing(false);
    setDraftCoordinates([]);
    setIsShapeClosed(false);
  }

  function handleMapClick(coordinate: GeoCoordinateInterface): void {
    setDraftCoordinates((current) => [...current, coordinate]);
  }

  function handleUndo(): void {
    setDraftCoordinates((current) => current.slice(0, -1));
    setIsShapeClosed(false);
  }

  function handleCloseShape(): void {
    if (draftCoordinates.length < 3) {
      showErrorToast("Add at least 3 points before closing the shape.");
      return;
    }
    setIsShapeClosed(true);
  }

  async function handleSave(): Promise<void> {
    if (draftCoordinates.length < 3) {
      showErrorToast("Draw at least 3 points to save a boundary.");
      return;
    }

    setIsSubmitting(true);

    try {
      await upsertFarmBoundary(farm.id, { coordinates: draftCoordinates });
      showSuccessToast("Farm boundary saved successfully.");
      cancelDrawing();
      router.refresh();
    } catch (err) {
      if (isAppError(err)) {
        showErrorToast(err.message);
      } else {
        showErrorToast("Failed to save boundary. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(): Promise<void> {
    setIsSubmitting(true);

    try {
      await deleteFarmBoundary(farm.id);
      showSuccessToast("Farm boundary removed.");
      cancelDrawing();
      router.refresh();
    } catch (err) {
      if (isAppError(err)) {
        showErrorToast(err.message);
      } else {
        showErrorToast("Failed to remove boundary. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-foreground text-lg font-semibold tracking-tight">
          Farm boundary
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Draw the farm polygon on the map to calculate area and mark the farm as
          mapped.
        </p>
      </div>
      <Card>
        <CardContent className="gap-card flex flex-col pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-muted-foreground text-sm">
              {displayArea !== undefined ? (
                <>
                  Area:{" "}
                  <span className="text-foreground font-medium tabular-nums">
                    {displayArea.toLocaleString()} ha
                  </span>
                </>
              ) : (
                "No boundary mapped yet"
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              {!isDrawing && boundary ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={startDrawing}
                  >
                    Redraw
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={(): void => void handleDelete()}
                  >
                    Remove boundary
                  </Button>
                </>
              ) : null}
              {!isDrawing && !boundary ? (
                <Button
                  type="button"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={startDrawing}
                >
                  Draw boundary
                </Button>
              ) : null}
              {isDrawing ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting || draftCoordinates.length === 0}
                    onClick={handleUndo}
                  >
                    Undo last point
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={
                      isSubmitting || isShapeClosed || draftCoordinates.length < 3
                    }
                    onClick={handleCloseShape}
                  >
                    Close shape
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={cancelDrawing}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={
                      isSubmitting || !isShapeClosed || draftCoordinates.length < 3
                    }
                    onClick={(): void => void handleSave()}
                  >
                    {isSubmitting ? "Saving…" : "Save boundary"}
                  </Button>
                </>
              ) : null}
            </div>
          </div>
          {isDrawing ? (
            <p className="text-muted-foreground text-xs">
              Click the map to add corners. Use at least 3 points, then close the shape
              before saving.
            </p>
          ) : null}
          <div className="border-border h-96 overflow-hidden rounded-lg border">
            <FarmBoundaryMapLoader
              center={mapCenter}
              coordinates={boundary && !isDrawing ? boundary.coordinates : []}
              draftCoordinates={isDrawing ? draftCoordinates : []}
              isDrawing={isDrawing}
              isShapeClosed={isShapeClosed}
              onMapClick={isDrawing ? handleMapClick : undefined}
            />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
