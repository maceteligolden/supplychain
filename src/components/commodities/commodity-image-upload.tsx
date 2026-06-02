"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { UploadIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export interface CommodityImageUploadProps {
  /** Existing image URL shown when no new file is selected. */
  previewUrl?: string;
  /** Called when the user selects or clears a file. */
  onFileChange: (file: File | null) => void;
  /** Disables the upload control while the form is submitting. */
  disabled?: boolean;
}

/**
 * CommodityImageUpload
 *
 * File picker stub for commodity images. Shows a local preview via
 * object URL but does not persist files — the parent sends imageFileName
 * to the API which assigns a mock imageUrl.
 */
export function CommodityImageUpload({
  previewUrl,
  onFileChange,
  disabled = false,
}: CommodityImageUploadProps): React.JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | undefined>(undefined);
  const displayPreview = localPreview ?? previewUrl;

  useEffect((): (() => void) | void => {
    return (): void => {
      if (localPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0] ?? null;

    if (localPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(localPreview);
    }

    if (file) {
      setLocalPreview(URL.createObjectURL(file));
      onFileChange(file);
    } else {
      setLocalPreview(undefined);
      onFileChange(null);
    }
  }

  function handleClear(): void {
    if (localPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(localPreview);
    }
    setLocalPreview(undefined);
    onFileChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="gap-card flex flex-col">
      <Label>Image</Label>
      <div className="border-border flex items-center gap-4 rounded-lg border p-4">
        <div className="bg-muted relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md">
          {displayPreview ? (
            <Image
              src={displayPreview}
              alt="Commodity preview"
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <UploadIcon className="text-muted-foreground size-6" />
          )}
        </div>
        <div className="gap-card flex flex-col">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={disabled}
            onChange={handleFileSelect}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={(): void => inputRef.current?.click()}
          >
            Choose image
          </Button>
          {displayPreview ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={handleClear}
            >
              Remove
            </Button>
          ) : null}
          <p className="text-muted-foreground text-xs">
            Upload stub — preview is local only; a mock URL is saved on submit.
          </p>
        </div>
      </div>
    </div>
  );
}
