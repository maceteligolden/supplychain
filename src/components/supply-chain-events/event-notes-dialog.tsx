"use client";

import { useState } from "react";

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
import { isAppError } from "@/lib/errors";
import { showErrorToast, showSuccessToast } from "@/lib/toast/notify";
import { updateSupplyChainEvent } from "@/services/supply-chain-events.service";
import type { ActorInterface } from "@/types/actor.interface";
import type { SupplyChainEventInterface } from "@/types/supply-chain-event.interface";

export interface EventNotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplyChainId: string;
  event?: SupplyChainEventInterface;
  actors: ActorInterface[];
  onSaved: () => void;
}

/**
 * EventNotesDialog
 *
 * Edits notes and actor on an existing event. Type and timestamp are locked.
 */
export function EventNotesDialog({
  open,
  onOpenChange,
  supplyChainId,
  event,
  actors,
  onSaved,
}: EventNotesDialogProps): React.JSX.Element {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit event</DialogTitle>
          <DialogDescription>
            Event type and timestamp cannot be changed after recording.
          </DialogDescription>
        </DialogHeader>
        {event ? (
          <EventNotesForm
            key={event.id}
            supplyChainId={supplyChainId}
            event={event}
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

interface EventNotesFormProps {
  supplyChainId: string;
  event: SupplyChainEventInterface;
  actors: ActorInterface[];
  onCancel: () => void;
  onSaved: () => void;
}

function EventNotesForm({
  supplyChainId,
  event,
  actors,
  onCancel,
  onSaved,
}: EventNotesFormProps): React.JSX.Element {
  const activeActors = actors.filter((actor) => actor.status === "ACTIVE");
  const [actorId, setActorId] = useState(event.actorId);
  const [notes, setNotes] = useState(event.notes ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(
    formEvent: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    formEvent.preventDefault();
    setIsSubmitting(true);

    try {
      await updateSupplyChainEvent(supplyChainId, event.id, {
        actorId,
        notes: notes.trim() || undefined,
      });
      showSuccessToast("Event updated.");
      onSaved();
    } catch (err) {
      if (isAppError(err)) {
        showErrorToast(err.message);
      } else {
        showErrorToast("Failed to update event. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function onSubmit(formEvent: React.FormEvent<HTMLFormElement>): void {
    void handleSubmit(formEvent);
  }

  return (
    <form onSubmit={onSubmit} className="gap-section flex flex-col">
      <div className="gap-card flex flex-col">
        <Label>Actor</Label>
        <Select
          value={actorId}
          onValueChange={(value): void => {
            if (value !== null) {
              setActorId(value);
            }
          }}
          disabled={isSubmitting}
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
        <Label htmlFor="edit-event-notes">Notes</Label>
        <Input
          id="edit-event-notes"
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
        <Button type="submit" disabled={isSubmitting || !actorId}>
          {isSubmitting ? "Saving…" : "Save changes"}
        </Button>
      </DialogFooter>
    </form>
  );
}
