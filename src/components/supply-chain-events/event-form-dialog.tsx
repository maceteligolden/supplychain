"use client";

import { useMemo, useState } from "react";

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
import { SUPPLY_CHAIN_EVENT_TYPE_LABELS } from "@/config/supply-chain-event-types";
import { getAllowedNextEventTypes } from "@/lib/supply-chain-event/validate-event-sequence";
import { isAppError } from "@/lib/errors";
import { showErrorToast, showSuccessToast } from "@/lib/toast/notify";
import { createSupplyChainEvent } from "@/services/supply-chain-events.service";
import type { ActorInterface } from "@/types/actor.interface";
import type { SupplyChainEventInterface } from "@/types/supply-chain-event.interface";
import type { SupplyChainEventType } from "@/config/supply-chain-event-types";

export interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplyChainId: string;
  existingEvents: SupplyChainEventInterface[];
  actors: ActorInterface[];
  onSaved: () => void;
}

/**
 * EventFormDialog
 *
 * Dialog for recording a new forward-only lifecycle event on a supply chain.
 */
export function EventFormDialog({
  open,
  onOpenChange,
  supplyChainId,
  existingEvents,
  actors,
  onSaved,
}: EventFormDialogProps): React.JSX.Element {
  const allowedTypes = useMemo(
    () => getAllowedNextEventTypes(existingEvents),
    [existingEvents],
  );

  const activeActors = useMemo(
    () => actors.filter((actor) => actor.status === "ACTIVE"),
    [actors],
  );

  const [type, setType] = useState<SupplyChainEventType>(allowedTypes[0] ?? "HARVEST");
  const [actorId, setActorId] = useState(activeActors[0]?.id ?? "");
  const [occurredAt, setOccurredAt] = useState(new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await createSupplyChainEvent(supplyChainId, {
        type,
        occurredAt: new Date(occurredAt).toISOString(),
        actorId,
        notes: notes.trim() || undefined,
      });
      showSuccessToast("Event recorded successfully.");
      onOpenChange(false);
      setNotes("");
      onSaved();
    } catch (err) {
      if (isAppError(err)) {
        showErrorToast(err.message);
      } else {
        showErrorToast("Failed to record event. Please try again.");
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
          <DialogTitle>Record event</DialogTitle>
          <DialogDescription>
            Add the next lifecycle milestone. Earlier steps may be skipped but order
            cannot go backwards.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="gap-section flex flex-col">
          <div className="gap-card flex flex-col">
            <Label>Event type</Label>
            <Select
              value={type}
              onValueChange={(value): void => {
                if (value !== null) {
                  setType(value);
                }
              }}
              disabled={isSubmitting || allowedTypes.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                {allowedTypes.map((option) => (
                  <SelectItem key={option} value={option}>
                    {SUPPLY_CHAIN_EVENT_TYPE_LABELS[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="gap-card flex flex-col">
            <Label>Actor</Label>
            <Select
              value={actorId}
              onValueChange={(value): void => {
                if (value !== null) {
                  setActorId(value);
                }
              }}
              disabled={isSubmitting || activeActors.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select actor" />
              </SelectTrigger>
              <SelectContent>
                {activeActors.map((actor) => (
                  <SelectItem key={actor.id} value={actor.id}>
                    {actor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="gap-card flex flex-col">
            <Label htmlFor="event-occurred-at">Occurred at</Label>
            <Input
              id="event-occurred-at"
              type="datetime-local"
              value={occurredAt}
              onChange={(event) => setOccurredAt(event.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="gap-card flex flex-col">
            <Label htmlFor="event-notes">Notes (optional)</Label>
            <Input
              id="event-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              disabled={isSubmitting}
            />
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
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                allowedTypes.length === 0 ||
                activeActors.length === 0 ||
                !actorId
              }
            >
              {isSubmitting ? "Saving…" : "Record event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
