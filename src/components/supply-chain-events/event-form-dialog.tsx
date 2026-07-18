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
import {
  SUPPLY_CHAIN_EVENT_TYPE_LABELS,
  type SupplyChainEventType,
} from "@/config/supply-chain-event-types";
import {
  getAllowedNextEventTypes,
  getImmediateNextEventType,
} from "@/lib/supply-chain-event/validate-event-sequence";
import { isAppError } from "@/lib/errors";
import { showErrorToast, showSuccessToast } from "@/lib/toast/notify";
import { createSupplyChainEvent } from "@/services/supply-chain-events.service";
import type { ActorInterface } from "@/types/actor.interface";
import type { SupplyChainEventInterface } from "@/types/supply-chain-event.interface";

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
 * Dialog for recording a lifecycle event. Defaults to the immediate next step;
 * choosing a later type skips intermediates.
 */
export function EventFormDialog({
  open,
  onOpenChange,
  supplyChainId,
  existingEvents,
  actors,
  onSaved,
}: EventFormDialogProps): React.JSX.Element {
  const formKey = `${supplyChainId}:${existingEvents.map((event) => event.type).join(",")}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record event</DialogTitle>
          <DialogDescription>
            Record the next lifecycle milestone, or choose a later step to skip
            intermediates.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <EventFormFields
            key={formKey}
            supplyChainId={supplyChainId}
            existingEvents={existingEvents}
            actors={actors}
            onCancel={(): void => onOpenChange(false)}
            onSaved={(): void => {
              onOpenChange(false);
              onSaved();
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

interface EventFormFieldsProps {
  supplyChainId: string;
  existingEvents: SupplyChainEventInterface[];
  actors: ActorInterface[];
  onCancel: () => void;
  onSaved: () => void;
}

function EventFormFields({
  supplyChainId,
  existingEvents,
  actors,
  onCancel,
  onSaved,
}: EventFormFieldsProps): React.JSX.Element {
  const allowedTypes = useMemo(
    () => getAllowedNextEventTypes(existingEvents),
    [existingEvents],
  );
  const immediateNextType = useMemo(
    () => getImmediateNextEventType(existingEvents),
    [existingEvents],
  );

  const activeActors = useMemo(
    () => actors.filter((actor) => actor.status === "ACTIVE"),
    [actors],
  );

  const [type, setType] = useState<SupplyChainEventType>(
    immediateNextType ?? allowedTypes[0] ?? "HARVEST",
  );
  const [actorId, setActorId] = useState(activeActors[0]?.id ?? "");
  const [occurredAt, setOccurredAt] = useState(new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedActor = activeActors.find((actor) => actor.id === actorId);
  const isSkipping =
    Boolean(immediateNextType) && Boolean(type) && type !== immediateNextType;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!type || allowedTypes.length === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createSupplyChainEvent(supplyChainId, {
        type,
        occurredAt: new Date(occurredAt).toISOString(),
        actorId,
        notes: notes.trim() || undefined,
      });
      showSuccessToast(
        isSkipping
          ? "Event recorded. Intermediate steps were skipped."
          : "Event recorded successfully.",
      );
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
            <SelectValue placeholder="Select event type">
              {SUPPLY_CHAIN_EVENT_TYPE_LABELS[type]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {allowedTypes.map((option) => (
              <SelectItem key={option} value={option}>
                {SUPPLY_CHAIN_EVENT_TYPE_LABELS[option]}
                {immediateNextType && option !== immediateNextType
                  ? " (skip ahead)"
                  : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isSkipping ? (
          <p className="text-muted-foreground text-sm">
            Intermediate steps between the current milestone and{" "}
            {SUPPLY_CHAIN_EVENT_TYPE_LABELS[type]} will be marked as skipped.
          </p>
        ) : null}
        {allowedTypes.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            All lifecycle events have been recorded.
          </p>
        ) : null}
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
            <SelectValue placeholder="Select actor">{selectedActor?.name}</SelectValue>
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
          onClick={onCancel}
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
  );
}
