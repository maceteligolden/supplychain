"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isAppError } from "@/lib/errors";
import { showErrorToast } from "@/lib/toast/notify";
import { geocodeQuery } from "@/services/farm-boundaries.service";
import type { GetFarmGeocodeOutput } from "@/types/farm-boundary.interface";
import type { GeoCoordinateInterface } from "@/types/farm-boundary.interface";

export interface FarmLocatePanelProps {
  disabled?: boolean;
  pickOnMapActive: boolean;
  onPickOnMapChange: (active: boolean) => void;
  onLocate: (result: {
    latitude: number;
    longitude: number;
    displayName: string;
  }) => void;
  /** Controlled latitude field (filled when picking on map). */
  latitudeText: string;
  longitudeText: string;
  onLatitudeTextChange: (value: string) => void;
  onLongitudeTextChange: (value: string) => void;
}

/**
 * Locate controls: Nigeria search autocomplete, postcode, lat/lng paste, GPS, pick on map.
 */
export function FarmLocatePanel({
  disabled = false,
  pickOnMapActive,
  onPickOnMapChange,
  onLocate,
  latitudeText,
  longitudeText,
  onLatitudeTextChange,
  onLongitudeTextChange,
}: FarmLocatePanelProps): React.JSX.Element {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GetFarmGeocodeOutput[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);

  async function handleSearch(): Promise<void> {
    const trimmed = query.trim();
    if (!trimmed) {
      showErrorToast("Enter a place name or Nigerian postcode.");
      return;
    }

    setIsSearching(true);
    try {
      const result = await geocodeQuery(trimmed);
      const list =
        result.results && result.results.length > 0 ? result.results : [result];
      setSuggestions(list);
      if (list.length === 0) {
        showErrorToast("No locations found in Nigeria for that search.");
      }
    } catch (error) {
      showErrorToast(isAppError(error) ? error.message : "Search failed. Try again.");
    } finally {
      setIsSearching(false);
    }
  }

  function handlePasteLatLng(): void {
    const latitude = Number(latitudeText);
    const longitude = Number(longitudeText);
    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      showErrorToast("Enter valid latitude and longitude.");
      return;
    }

    onLocate({
      latitude,
      longitude,
      displayName: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
    });
    onPickOnMapChange(false);
  }

  function handleGps(): void {
    if (!navigator.geolocation) {
      showErrorToast("Geolocation is not available in this browser.");
      return;
    }

    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinate: GeoCoordinateInterface = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        onLocate({
          ...coordinate,
          displayName: "Current GPS location",
        });
        onPickOnMapChange(false);
        setIsGpsLoading(false);
      },
      () => {
        showErrorToast("Could not read GPS location. Check browser permissions.");
        setIsGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15_000 },
    );
  }

  return (
    <div className="bg-background/95 border-border flex flex-col gap-3 rounded-lg border p-3 shadow-sm">
      <div>
        <p className="text-foreground text-sm font-medium">Locate farm (Nigeria)</p>
        <p className="text-muted-foreground text-xs">
          Search, paste coordinates, use GPS, or pick a point on the map — then confirm
          to save the farm location.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="farm-locate-search" className="text-xs">
          Place or postcode
        </Label>
        <div className="flex gap-2">
          <Input
            id="farm-locate-search"
            value={query}
            disabled={disabled || isSearching}
            placeholder="e.g. 900001, Abuja"
            onChange={(event): void => setQuery(event.target.value)}
            onKeyDown={(event): void => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleSearch();
              }
            }}
          />
          <Button
            type="button"
            size="sm"
            disabled={disabled || isSearching}
            onClick={(): void => void handleSearch()}
          >
            {isSearching ? "…" : "Search"}
          </Button>
        </div>
        {suggestions.length > 0 ? (
          <ul className="border-border max-h-40 overflow-auto rounded-md border">
            {suggestions.map((item) => (
              <li key={`${item.displayName}-${item.latitude}-${item.longitude}`}>
                <button
                  type="button"
                  className="hover:bg-accent w-full px-3 py-2 text-left text-xs"
                  disabled={disabled}
                  onClick={(): void => {
                    onLocate(item);
                    onPickOnMapChange(false);
                    setSuggestions([]);
                  }}
                >
                  {item.displayName}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Label htmlFor="farm-locate-lat" className="text-xs">
            Latitude
          </Label>
          <Input
            id="farm-locate-lat"
            value={latitudeText}
            disabled={disabled}
            placeholder="9.0820"
            onChange={(event): void => onLatitudeTextChange(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="farm-locate-lng" className="text-xs">
            Longitude
          </Label>
          <Input
            id="farm-locate-lng"
            value={longitudeText}
            disabled={disabled}
            placeholder="8.6753"
            onChange={(event): void => onLongitudeTextChange(event.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={handlePasteLatLng}
        >
          Use coordinates
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled || isGpsLoading}
          onClick={handleGps}
        >
          {isGpsLoading ? "Locating…" : "Use GPS"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={pickOnMapActive ? "default" : "outline"}
          disabled={disabled}
          onClick={(): void => onPickOnMapChange(!pickOnMapActive)}
        >
          {pickOnMapActive ? "Picking on map…" : "Pick on map"}
        </Button>
      </div>
    </div>
  );
}
