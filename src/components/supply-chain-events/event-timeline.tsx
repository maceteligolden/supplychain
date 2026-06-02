"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, CircleIcon, PlusIcon } from "lucide-react";

import { EventFormDialog } from "@/components/supply-chain-events/event-form-dialog";
import { EventNotesDialog } from "@/components/supply-chain-events/event-notes-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatActorAddress } from "@/lib/actor/format-address";
import { SUPPLY_CHAIN_EVENT_TYPE_LABELS } from "@/config/supply-chain-event-types";
import { getEventTimelineStepStates } from "@/lib/supply-chain-event/validate-event-sequence";
import type { ActorInterface } from "@/types/actor.interface";
import type { SupplyChainEventInterface } from "@/types/supply-chain-event.interface";

export interface EventTimelineProps {
  /** Supply chain the timeline belongs to. */
  supplyChainId: string;
  /** Recorded lifecycle events. */
  events: SupplyChainEventInterface[];
  /** Actors available for display and event forms. */
  actors: ActorInterface[];
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getConnectorClass(
  currentStatus: "completed" | "skipped" | "upcoming" | "next",
  nextStatus?: "completed" | "skipped" | "upcoming" | "next",
): string {
  if (currentStatus === "completed" && nextStatus === "completed") {
    return "bg-primary";
  }
  if (currentStatus === "completed") {
    return "bg-muted";
  }
  return "bg-muted/40";
}

/**
 * EventTimeline
 *
 * Ecommerce-style vertical tracking timeline for supply chain lifecycle events.
 */
export function EventTimeline({
  supplyChainId,
  events,
  actors,
}: EventTimelineProps): React.JSX.Element {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<
    SupplyChainEventInterface | undefined
  >(undefined);

  const steps = getEventTimelineStepStates(events);
  const hasNextStep = steps.some((step) => step.status === "next");
  const actorsById = new Map(actors.map((actor) => [actor.id, actor]));

  function handleEventSaved(): void {
    router.refresh();
  }

  return (
    <div className="gap-section flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-foreground text-lg font-semibold">Event tracking</h3>
          <p className="text-muted-foreground text-sm">
            Lifecycle milestones for this supply chain journey.
          </p>
        </div>
        {hasNextStep ? (
          <Button size="sm" onClick={(): void => setFormOpen(true)}>
            <PlusIcon className="size-4" />
            Add event
          </Button>
        ) : null}
      </div>

      <ol className="flex flex-col">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const nextStep = steps[index + 1];
          const label = SUPPLY_CHAIN_EVENT_TYPE_LABELS[step.type];
          const actor = step.event ? actorsById.get(step.event.actorId) : undefined;

          return (
            <li key={step.type} className="flex gap-4">
              <div className="flex w-6 shrink-0 flex-col items-center">
                <span
                  className={cn(
                    "bg-background relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border",
                    step.status === "completed" &&
                      "border-primary bg-primary text-primary-foreground",
                    step.status === "next" && "border-primary",
                    step.status === "skipped" &&
                      "border-muted-foreground/40 border-dashed",
                    step.status === "upcoming" && "border-muted-foreground/30",
                  )}
                >
                  {step.status === "completed" ? (
                    <CheckIcon className="size-3.5" />
                  ) : (
                    <CircleIcon className="text-muted-foreground size-3" />
                  )}
                </span>
                {!isLast ? (
                  <span
                    className={cn(
                      "mt-1 min-h-8 w-0.5 flex-1 rounded-full",
                      getConnectorClass(step.status, nextStep?.status),
                    )}
                    aria-hidden
                  />
                ) : null}
              </div>

              <div className={cn("min-w-0 flex-1", !isLast && "pb-8")}>
                <div className="gap-card flex flex-col">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className={cn(
                        "font-medium",
                        step.status === "upcoming" && "text-muted-foreground",
                        step.status === "skipped" &&
                          "text-muted-foreground line-through",
                      )}
                    >
                      {label}
                    </p>
                    {step.status === "skipped" ? (
                      <span className="text-muted-foreground text-xs">Skipped</span>
                    ) : null}
                    {step.status === "next" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(): void => setFormOpen(true)}
                      >
                        Record
                      </Button>
                    ) : null}
                  </div>

                  {step.event ? (
                    <div className="gap-card flex flex-col rounded-lg border p-3">
                      <p className="text-muted-foreground text-xs">
                        {formatDateTime(step.event.occurredAt)}
                      </p>
                      {actor ? (
                        <div>
                          <p className="text-sm font-medium">{actor.name}</p>
                          <p className="text-muted-foreground text-sm">
                            {formatActorAddress(actor)}
                          </p>
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">Unknown actor</p>
                      )}
                      {step.event.notes ? (
                        <p className="text-muted-foreground text-sm">
                          {step.event.notes}
                        </p>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-fit"
                        onClick={(): void => {
                          setSelectedEvent(step.event);
                          setNotesOpen(true);
                        }}
                      >
                        Edit notes
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <EventFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        supplyChainId={supplyChainId}
        existingEvents={events}
        actors={actors}
        onSaved={handleEventSaved}
      />
      <EventNotesDialog
        open={notesOpen}
        onOpenChange={setNotesOpen}
        supplyChainId={supplyChainId}
        event={selectedEvent}
        actors={actors}
        onSaved={handleEventSaved}
      />
    </div>
  );
}
