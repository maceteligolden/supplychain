import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import type { SupplyChainReportInterface } from "@/types/supply-chain-report.interface";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Downloads a supply chain traceability report as a PDF document. */
export function downloadSupplyChainReportPdf(report: SupplyChainReportInterface): void {
  const doc = new jsPDF();
  let y = 16;

  doc.setFontSize(16);
  doc.text("Traceability Report", 14, y);
  y += 10;

  doc.setFontSize(11);
  doc.text(report.name, 14, y);
  y += 6;
  doc.setFontSize(9);
  doc.text(`Code: ${report.code}`, 14, y);
  y += 5;
  doc.text(`Status: ${report.statusLabel}`, 14, y);
  y += 5;
  doc.text(`Commodity: ${report.commodityName}`, 14, y);
  y += 5;
  doc.text(`Generated: ${formatDateTime(report.generatedAt)}`, 14, y);
  y += 8;

  if (report.description) {
    const descriptionLines = doc.splitTextToSize(report.description, 180) as string[];
    doc.text(descriptionLines, 14, y);
    y += descriptionLines.length * 5 + 4;
  }

  doc.setFontSize(10);
  doc.text("Summary", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Metric", "Value"]],
    body: [
      ["Linked farms", String(report.stats.linkedFarmsCount)],
      ["Allocated batches", String(report.stats.allocatedBatchesCount)],
      ["Total quantity", report.stats.totalAllocatedQuantity.toLocaleString()],
      ["Events recorded", String(report.stats.eventsRecordedCount)],
    ],
    theme: "grid",
    styles: { fontSize: 9 },
    headStyles: { fillColor: [37, 99, 235] },
  });

  y =
    (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y;
  y += 8;

  doc.text("Allocations", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Farm", "Batch", "Quantity", "Unit"]],
    body:
      report.allocations.length > 0
        ? report.allocations.map((item) => [
            item.farmName,
            item.batchNumber,
            item.quantity.toLocaleString(),
            item.unit,
          ])
        : [["No allocations recorded", "", "", ""]],
    theme: "grid",
    styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 99, 235] },
  });

  y =
    (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y;
  y += 8;

  if (y > 240) {
    doc.addPage();
    y = 16;
  }

  doc.text("Lifecycle events", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Type", "Occurred", "Actor", "Notes"]],
    body:
      report.events.length > 0
        ? report.events.map((item) => [
            item.typeLabel,
            formatDateTime(item.occurredAt),
            item.actorName,
            item.notes ?? "",
          ])
        : [["No events recorded", "", "", ""]],
    theme: "grid",
    styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 99, 235] },
  });

  const filename = `${report.code.toLowerCase()}-traceability-report.pdf`;
  doc.save(filename);
}
