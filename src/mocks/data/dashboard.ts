import type { DashboardSummaryInterface } from "@/types/dashboard.interface";

export const mockDashboardSummary: DashboardSummaryInterface = {
  kpis: [
    {
      id: "kpi-orders",
      label: "Open Orders",
      value: 142,
      changePercent: 8.2,
      trend: "up",
    },
    {
      id: "kpi-shipments",
      label: "In Transit",
      value: 37,
      changePercent: -3.1,
      trend: "down",
    },
    {
      id: "kpi-inventory",
      label: "Low Stock Items",
      value: 18,
      changePercent: 12.5,
      trend: "up",
    },
    {
      id: "kpi-fulfillment",
      label: "Fulfillment Rate",
      value: 94,
      unit: "%",
      changePercent: 1.8,
      trend: "up",
    },
  ],
  recentActivity: [
    {
      id: "act-1",
      type: "order_created",
      description: "Order ORD-1042 created by Acme Corp",
      occurredAt: "2026-06-02T09:15:00Z",
      referenceId: "ORD-1042",
    },
    {
      id: "act-2",
      type: "shipment_dispatched",
      description: "Shipment SHP-883 dispatched from WH-NYC",
      occurredAt: "2026-06-02T08:42:00Z",
      referenceId: "SHP-883",
    },
    {
      id: "act-3",
      type: "inventory_low",
      description: "SKU-WDG-004 dropped below reorder level",
      occurredAt: "2026-06-02T07:30:00Z",
      referenceId: "SKU-WDG-004",
    },
    {
      id: "act-4",
      type: "supplier_added",
      description: "New supplier Pacific Parts Co. onboarded",
      occurredAt: "2026-06-01T16:00:00Z",
      referenceId: "SUP-019",
    },
    {
      id: "act-5",
      type: "shipment_dispatched",
      description: "Shipment SHP-881 delivered to Chicago DC",
      occurredAt: "2026-06-01T14:22:00Z",
      referenceId: "SHP-881",
    },
  ],
};
