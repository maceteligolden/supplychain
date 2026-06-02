"use client";

import { useState } from "react";
import { DownloadIcon, FileSpreadsheetIcon, FileTextIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { downloadSupplyChainReportCsv } from "@/lib/export/download-csv";
import { downloadSupplyChainReportPdf } from "@/lib/export/download-pdf";
import { isAppError } from "@/lib/errors";
import { showErrorToast, showSuccessToast } from "@/lib/toast/notify";
import { getSupplyChainReport } from "@/services/supply-chains.service";

export interface SupplyChainExportMenuProps {
  /** Supply chain id to export. */
  supplyChainId: string;
}

/**
 * SupplyChainExportMenu
 *
 * Dropdown to download a traceability report as PDF or CSV spreadsheet.
 */
export function SupplyChainExportMenu({
  supplyChainId,
}: SupplyChainExportMenuProps): React.JSX.Element {
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport(format: "pdf" | "csv"): Promise<void> {
    setIsExporting(true);

    try {
      const report = await getSupplyChainReport(supplyChainId);

      if (format === "pdf") {
        downloadSupplyChainReportPdf(report);
      } else {
        downloadSupplyChainReportCsv(report);
      }

      showSuccessToast(
        format === "pdf" ? "PDF report downloaded" : "Spreadsheet report downloaded",
      );
    } catch (error) {
      const message = isAppError(error)
        ? error.message
        : "Failed to export report. Please try again.";
      showErrorToast(message);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" disabled={isExporting}>
            <DownloadIcon className="size-4" />
            {isExporting ? "Exporting…" : "Export report"}
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={(): void => void handleExport("pdf")}>
            <FileTextIcon className="size-4" />
            Download PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(): void => void handleExport("csv")}>
            <FileSpreadsheetIcon className="size-4" />
            Download CSV spreadsheet
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
