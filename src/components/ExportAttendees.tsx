"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import QRCode from "qrcode";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  QrCode,
} from "lucide-react";

import type { Attendee, BadgeConfiguration } from "@/types/badge";

interface ExportAttendeesProps {
  attendees: Attendee[];
  configuration: BadgeConfiguration;
}

/* ============================================================
   HELPERS
============================================================ */

const normalize = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getFieldValue = (attendee: Attendee, possibleNames: string[]): string => {
  const keys = Object.keys(attendee);

  for (const wanted of possibleNames) {
    const exactKey = keys.find(
      (key) => key.trim().toLowerCase() === wanted.trim().toLowerCase(),
    );

    if (exactKey) {
      const value = attendee[exactKey];

      if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
      ) {
        return String(value).trim();
      }
    }
  }

  const normalizedWanted = possibleNames.map(normalize);

  const normalizedKey = keys.find((key) =>
    normalizedWanted.includes(normalize(key)),
  );

  if (normalizedKey) {
    return String(attendee[normalizedKey] ?? "").trim();
  }

  return "";
};

/* ============================================================
   QR VALUE
============================================================ */

const getQRValue = (
  attendee: Attendee,
  configuration: BadgeConfiguration,
): string => {
  if (!configuration.qr) {
    return "QR DISABLED";
  }

  switch (configuration.qrField) {
    case "registrationNumber": {
      return (
        getFieldValue(attendee, [
          "registrationNumber",
          "Registration No.",
          "Registration Number",
          "registration no",
          "registration number",
          "reg no",
          "reg number",
        ]) || "NO-REGISTRATION"
      );
    }

    case "name": {
      return (
        getFieldValue(attendee, ["name", "Name", "Full Name", "full name"]) ||
        "NO-NAME"
      );
    }

    case "code": {
      return (
        getFieldValue(attendee, ["code", "Code", "Event Code"]) || "NO-CODE"
      );
    }

    case "custom": {
      const customField = configuration.customQRField?.trim();

      if (!customField) {
        return "SELECT-CUSTOM-FIELD";
      }

      const value = getFieldValue(attendee, [customField]);

      return value || "NO-CUSTOM-VALUE";
    }

    default:
      return "PREVIEW-QR-001";
  }
};

/* ============================================================
   DOWNLOAD
============================================================ */

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;

  document.body.appendChild(anchor);

  anchor.click();

  document.body.removeChild(anchor);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1500);
};

/* ============================================================
   EXPORT COMPONENT
============================================================ */

export default function ExportAttendees({
  attendees,
  configuration,
}: ExportAttendeesProps) {
  const [exporting, setExporting] = useState<"excel" | "csv" | null>(null);

  /* ==========================================================
     BUILD CLEAN EXPORT DATA
  ========================================================== */

  const buildRows = async () => {
    return Promise.all(
      attendees.map(async (attendee) => {
        const name = getFieldValue(attendee, [
          "name",
          "Name",
          "Full Name",
          "full name",
        ]);

        const registrationNumber = getFieldValue(attendee, [
          "registrationNumber",
          "Registration No.",
          "Registration Number",
          "registration no",
          "registration number",
          "reg no",
          "reg number",
        ]);

        const code = getFieldValue(attendee, ["code", "Code", "Event Code"]);

        const category = getFieldValue(attendee, [
          "category",
          "Category",
          "Type",
        ]);

        const qrValue = getQRValue(attendee, configuration);

        const qrImage = await QRCode.toDataURL(qrValue, {
          width: 500,
          margin: 2,
          errorCorrectionLevel: "H",
        });

        return {
          name,
          registrationNumber,
          code,
          category,
          qrValue,
          qrImage,
        };
      }),
    );
  };

  /* ==========================================================
     EXCEL
  ========================================================== */

  const handleExcelExport = async () => {
    if (!attendees.length) {
      return;
    }

    try {
      setExporting("excel");

      const rows = await buildRows();

      /*
       * ExcelJS is required for
       * REAL embedded QR images.
       */

      const ExcelJS = await import("exceljs");

      const workbook = new ExcelJS.Workbook();

      const worksheet = workbook.addWorksheet("Attendees");

      /* ------------------------------------------------------
           EXACT COLUMNS
        ------------------------------------------------------ */

      worksheet.columns = [
        {
          header: "Name",
          key: "name",
          width: 32,
        },
        {
          header: "Registration No.",
          key: "registrationNumber",
          width: 22,
        },
        {
          header: "Code",
          key: "code",
          width: 18,
        },
        {
          header: "Category",
          key: "category",
          width: 18,
        },
        {
          header: "QR Value",
          key: "qrValue",
          width: 30,
        },
        {
          header: "QR Image",
          key: "qrImage",
          width: 18,
        },
      ];

      /* ------------------------------------------------------
           HEADER
        ------------------------------------------------------ */

      const header = worksheet.getRow(1);

      header.height = 28;

      header.font = {
        bold: true,
        size: 11,
      };

      header.alignment = {
        vertical: "middle",
        horizontal: "center",
      };

      /* ------------------------------------------------------
           DATA
        ------------------------------------------------------ */

      for (const item of rows) {
        const row = worksheet.addRow({
          name: item.name,
          registrationNumber: item.registrationNumber,
          code: item.code,
          category: item.category,
          qrValue: item.qrValue,
          qrImage: "",
        });

        row.height = 90;

        row.alignment = {
          vertical: "middle",
          wrapText: true,
        };

        /* ----------------------------------------------------
             ADD ACTUAL QR IMAGE
          ---------------------------------------------------- */

        const imageId = workbook.addImage({
          base64: item.qrImage,
          extension: "png",
        });

        /*
         * Column indexes:
         *
         * A = Name
         * B = Registration No.
         * C = Code
         * D = Category
         * E = QR Value
         * F = QR Image
         *
         * ExcelJS uses zero-based
         * column coordinates.
         */

        worksheet.addImage(imageId, {
          tl: {
            col: 5.1,
            row: row.number - 1 + 0.1,
          },
          ext: {
            width: 72,
            height: 72,
          },
        });
      }

      /* ------------------------------------------------------
           FREEZE HEADER
        ------------------------------------------------------ */

      worksheet.views = [
        {
          state: "frozen",
          ySplit: 1,
        },
      ];

      /* ------------------------------------------------------
           FILTER
        ------------------------------------------------------ */

      worksheet.autoFilter = {
        from: "A1",
        to: `F${worksheet.rowCount}`,
      };

      /* ------------------------------------------------------
           WRITE FILE
        ------------------------------------------------------ */

      const buffer = await workbook.xlsx.writeBuffer();

      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      downloadBlob(blob, `BadgeFlow-Attendees-${Date.now()}.xlsx`);
    } catch (error) {
      console.error("Excel export failed:", error);

      alert("Excel export failed. Make sure exceljs is installed.");
    } finally {
      setExporting(null);
    }
  };

  /* ==========================================================
     CSV
  ========================================================== */

  const handleCsvExport = async () => {
    if (!attendees.length) {
      return;
    }

    try {
      setExporting("csv");

      const rows = await buildRows();

      /*
       * CSV has no real image-cell
       * capability.
       *
       * We therefore include:
       *
       * QR Value
       * QR Image Data
       */

      const csvData = rows.map((item) => ({
        Name: item.name,
        "Registration No.": item.registrationNumber,
        Code: item.code,
        Category: item.category,
        "QR Value": item.qrValue,
        "QR Image": item.qrImage,
      }));

      const worksheet = XLSX.utils.json_to_sheet(csvData, {
        header: [
          "Name",
          "Registration No.",
          "Code",
          "Category",
          "QR Value",
          "QR Image",
        ],
      });

      const csv = XLSX.utils.sheet_to_csv(worksheet);

      const blob = new Blob(["\ufeff", csv], {
        type: "text/csv;charset=utf-8;",
      });

      downloadBlob(blob, `BadgeFlow-Attendees-${Date.now()}.csv`);
    } catch (error) {
      console.error("CSV export failed:", error);

      alert("CSV export failed.");
    } finally {
      setExporting(null);
    }
  };

  /* ==========================================================
     EMPTY
  ========================================================== */

  if (!attendees.length) {
    return null;
  }

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <div className="mt-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* TITLE */}

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            <QrCode className="h-5 w-5" />
          </div>

          <div>
            <h3 className="font-semibold">Export Attendee Data</h3>

            <p className="mt-1 text-xs text-zinc-500">
              Export attendee details with the exact QR value and generated QR
              image.
            </p>
          </div>
        </div>

        {/* BUTTONS */}

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={handleExcelExport}
            disabled={exporting !== null}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {exporting === "excel" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            Excel + QR Image
          </button>

          <button
            type="button"
            onClick={handleCsvExport}
            disabled={exporting !== null}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-xs font-bold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {exporting === "csv" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            CSV + QR Data
          </button>
        </div>
      </div>

      {/* INFO */}

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5 text-[11px] leading-5 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
        <Download className="mt-0.5 h-3.5 w-3.5 shrink-0" />

        <p>
          Excel contains the actual QR image inside the <b>QR Image</b> column.
          CSV contains the QR value and QR image data.
        </p>
      </div>
    </div>
  );
}
