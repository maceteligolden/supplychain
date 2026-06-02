import type { SupplyChainReportInterface } from "@/types/supply-chain-report.interface";

function escapeCsvValue(value: string | number): string {
  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function csvRow(values: Array<string | number>): string {
  return values.map(escapeCsvValue).join(",");
}

function triggerDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

/** Downloads a supply chain traceability report as a CSV spreadsheet. */
export function downloadSupplyChainReportCsv(report: SupplyChainReportInterface): void {
  const lines: string[] = [
    csvRow(["Traceability Report"]),
    csvRow(["Name", report.name]),
    csvRow(["Code", report.code]),
    csvRow(["Status", report.statusLabel]),
    csvRow(["Commodity", report.commodityName]),
    csvRow(["Generated", report.generatedAt]),
    "",
    csvRow(["Summary"]),
    csvRow(["Linked farms", report.stats.linkedFarmsCount]),
    csvRow(["Allocated batches", report.stats.allocatedBatchesCount]),
    csvRow(["Total quantity", report.stats.totalAllocatedQuantity]),
    csvRow(["Events recorded", report.stats.eventsRecordedCount]),
    "",
    csvRow(["Allocations"]),
    csvRow(["Farm", "Batch", "Quantity", "Unit"]),
    ...report.allocations.map((item) =>
      csvRow([item.farmName, item.batchNumber, item.quantity, item.unit]),
    ),
    "",
    csvRow(["Events"]),
    csvRow(["Type", "Occurred at", "Actor", "Address", "Notes"]),
    ...report.events.map((item) =>
      csvRow([
        item.typeLabel,
        item.occurredAt,
        item.actorName,
        item.actorAddress,
        item.notes ?? "",
      ]),
    ),
  ];

  const filename = `${report.code.toLowerCase()}-traceability-report.csv`;
  triggerDownload(lines.join("\n"), filename, "text/csv;charset=utf-8;");
}
