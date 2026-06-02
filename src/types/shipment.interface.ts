export type ShipmentStatus =
  | "pending"
  | "in_transit"
  | "delivered"
  | "delayed"
  | "cancelled";

export interface ShipmentTimelineEventInterface {
  /** Event identifier. */
  id: string;
  /** Event description. */
  label: string;
  /** ISO timestamp of the event. */
  occurredAt: string;
  /** Whether this event has been completed. */
  completed: boolean;
}

export interface ShipmentInterface {
  /** Unique shipment identifier. */
  id: string;
  /** Tracking number assigned by carrier. */
  trackingNumber: string;
  /** Origin warehouse or location. */
  origin: string;
  /** Destination address or warehouse. */
  destination: string;
  /** Carrier company name. */
  carrier: string;
  /** Current shipment status. */
  status: ShipmentStatus;
  /** Number of items in the shipment. */
  itemCount: number;
  /** Estimated delivery date (ISO). */
  estimatedDelivery: string;
  /** Shipment creation date (ISO). */
  createdAt: string;
}

export interface ShipmentDetailInterface extends ShipmentInterface {
  /** Timeline of shipment milestones. */
  timeline: ShipmentTimelineEventInterface[];
}

export type GetShipmentsInput = {
  status?: ShipmentStatus;
};

export type GetShipmentsOutput = {
  shipments: ShipmentInterface[];
  total: number;
};

export type GetShipmentByIdOutput = ShipmentDetailInterface;
