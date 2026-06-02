export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderLineInterface {
  /** Line item identifier. */
  id: string;
  /** Product SKU. */
  sku: string;
  /** Product name. */
  productName: string;
  /** Ordered quantity. */
  quantity: number;
  /** Line item unit price in USD. */
  unitPrice: number;
}

export interface OrderInterface {
  /** Unique order identifier. */
  id: string;
  /** Customer or client name. */
  customerName: string;
  /** Current order fulfillment status. */
  status: OrderStatus;
  /** Order line items. */
  lines: OrderLineInterface[];
  /** Total order value in USD. */
  totalAmount: number;
  /** ISO timestamp of order creation. */
  createdAt: string;
  /** Expected delivery date (ISO). */
  expectedDelivery: string;
}

export type GetOrdersInput = {
  status?: OrderStatus;
};

export type GetOrdersOutput = {
  orders: OrderInterface[];
  total: number;
};
