"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import JSZip from "jszip";
import QRCode from "qrcode";
import {
  Download,
  FileArchive,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import type {
  Attendee,
  BadgeConfiguration,
} from "@/types/badge";

interface DownloadBadgesProps {
  attendees: Attendee[];
  badgeFile: File | null;
  configuration: BadgeConfiguration;
}

interface BadgeImage {
  dataUrl: string;
  width: number;
  height: number;
}

export default function DownloadBadges({
  attendees,
  badgeFile,
  configuration,
}: DownloadBadgesProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloadingIndex, setDownloadingIndex] =
    useState<number | null>(null);

  /*
   * ============================================================
   * NORMALIZE FIELD NAME
   * ============================================================
   */

  const normalizeFieldName = (value: string) => {
    return value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/[._-]+/g, " ")
      .trim();
  };

  /*
   * ============================================================
   * GET CUSTOM FIELD VALUE
   * ============================================================
   */

  const getCustomFieldValue = (
    attendee: Attendee,
    fieldName?: string
  ) => {
    const requestedField = fieldName?.trim();

    if (!requestedField) {
      return "";
    }

    // Exact field match first
    const exactValue = attendee[requestedField];

    if (exactValue?.trim()) {
      return exactValue.trim();
    }

    // Normalized field match
    const normalizedRequestedField =
      normalizeFieldName(requestedField);

    const matchedKey = Object.keys(attendee).find(
      (key) =>
        normalizeFieldName(key) ===
        normalizedRequestedField
    );

    if (matchedKey) {
      return attendee[matchedKey]?.trim() || "";
    }

    return "";
  };

  /*
   * ============================================================
   * QR VALUE
   * ============================================================
   */

  const getQRValue = (attendee: Attendee) => {
    switch (configuration.qrField) {
      /*
       * Registration Number
       */
      case "registrationNumber":
        return (
          attendee.registrationNumber?.trim() ||
          "PREVIEW-QR-001"
        );

      /*
       * Attendee Name
       */
      case "name":
        return (
          attendee.name?.trim() ||
          "PREVIEW-QR-001"
        );

      /*
       * Attendee Code
       */
      case "code":
        return (
          attendee.code?.trim() ||
          "PREVIEW-QR-001"
        );

      /*
       * Custom Excel Field
       */
      case "custom": {
        const customValue =
          getCustomFieldValue(
            attendee,
            configuration.customQRField
          );

        return (
          customValue ||
          "PREVIEW-QR-001"
        );
      }

      /*
       * Safety fallback
       */
      default:
        return "PREVIEW-QR-001";
    }
  };

  /*
   * ============================================================
   * SAFE FILE NAME
   * ============================================================
   */

  const safeFileName = (value: string) => {
    return value
      .replace(/[<>:"/\\|?*]/g, "")
      .replace(/\s+/g, "_")
      .trim()
      .slice(0, 80);
  };

  /*
   * ============================================================
   * FILE TO DATA URL
   * ============================================================
   */

  const fileToDataURL = (
    file: File
  ): Promise<string> => {
    return new Promise(
      (resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          resolve(
            reader.result as string
          );
        };

        reader.onerror = () => {
          reject(
            new Error(
              "Unable to read badge file."
            )
          );
        };

        reader.readAsDataURL(file);
      }
    );
  };

  /*
   * ============================================================
   * LOAD IMAGE
   * ============================================================
   */

  const loadImage = (
    src: string
  ): Promise<HTMLImageElement> => {
    return new Promise(
      (resolve, reject) => {
        const image = new Image();

        image.onload = () =>
          resolve(image);

        image.onerror = () =>
          reject(
            new Error(
              "Unable to load badge image."
            )
          );

        image.src = src;
      }
    );
  };

  /*
   * ============================================================
   * LOAD BADGE TEMPLATE
   * ============================================================
   */

  const loadBadgeTemplate =
    async (): Promise<BadgeImage> => {
      if (!badgeFile) {
        throw new Error(
          "Badge template is missing."
        );
      }

      const type =
        badgeFile.type.toLowerCase();

      /*
       * ========================================================
       * IMAGE TEMPLATE
       * ========================================================
       */

      if (
        type === "image/png" ||
        type === "image/jpeg" ||
        type === "image/jpg" ||
        type === "image/webp"
      ) {
        const dataUrl =
          await fileToDataURL(
            badgeFile
          );

        const image =
          await loadImage(
            dataUrl
          );

        return {
          dataUrl,
          width: image.naturalWidth,
          height: image.naturalHeight,
        };
      }

      /*
       * ========================================================
       * PDF TEMPLATE
       * ========================================================
       */

      if (
        type === "application/pdf" ||
        badgeFile.name
          .toLowerCase()
          .endsWith(".pdf")
      ) {
        const pdfjs =
          await import(
            "pdfjs-dist/legacy/build/pdf.mjs"
          );

        pdfjs.GlobalWorkerOptions.workerSrc =
          "/pdf.worker.min.mjs";

        const buffer =
          await badgeFile.arrayBuffer();

        const loadingTask =
          pdfjs.getDocument({
            data: new Uint8Array(
              buffer
            ),
          });

        const pdf =
          await loadingTask.promise;

        const page =
          await pdf.getPage(1);

        const viewport =
          page.getViewport({
            scale: 3,
          });

        const canvas =
          document.createElement(
            "canvas"
          );

        const context =
          canvas.getContext("2d");

        if (!context) {
          throw new Error(
            "Unable to create PDF canvas."
          );
        }

        canvas.width = Math.ceil(
          viewport.width
        );

        canvas.height = Math.ceil(
          viewport.height
        );

        await page.render({
          canvasContext: context,
          canvas,
          viewport,
        }).promise;

        return {
          dataUrl:
            canvas.toDataURL(
              "image/png"
            ),
          width: canvas.width,
          height: canvas.height,
        };
      }

      throw new Error(
        "Unsupported badge template."
      );
    };

  /*
   * ============================================================
   * GENERATE BADGE
   * ============================================================
   */

  const generateBadgePDF =
    async (
      attendee: Attendee,
      badge: BadgeImage
    ): Promise<Blob> => {
      const image =
        await loadImage(
          badge.dataUrl
        );

      /*
       * Badge dimensions
       */

      const width = 255;

      const height =
        (badge.height /
          badge.width) *
        width;

      const pdf =
        new jsPDF({
          orientation:
            width > height
              ? "landscape"
              : "portrait",

          unit: "pt",

          format: [
            width,
            height,
          ],

          compress: true,
        });

      /*
       * ========================================================
       * ORIGINAL BADGE
       * ========================================================
       */

      pdf.addImage(
        image,
        "PNG",
        0,
        0,
        width,
        height,
        undefined,
        "FAST"
      );

      /*
       * ========================================================
       * NAME
       * ========================================================
       */

      const name =
        attendee.name?.trim() ||
        "Attendee Name";

      const maxNameWidth =
        width * 0.78;

      let fontSize = 14;

      if (name.length > 32) {
        fontSize = 9;
      } else if (name.length > 27) {
        fontSize = 10;
      } else if (name.length > 20) {
        fontSize = 12;
      }

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(fontSize);

      pdf.setTextColor(
        0,
        0,
        0
      );

      /*
       * Split name based on
       * actual PDF width.
       */

      const nameLines =
        pdf.splitTextToSize(
          name,
          maxNameWidth
        );

      const lineCount =
        Array.isArray(nameLines)
          ? nameLines.length
          : 1;

      /*
       * Name position
       */

      const nameY =
        height * 0.545;

      pdf.text(
        nameLines,
        width / 2,
        nameY,
        {
          align: "center",
          lineHeightFactor: 1.12,
        }
      );

      /*
       * ========================================================
       * DYNAMIC SPACING
       * ========================================================
       */

      const extraSpacing =
        Math.min(
          Math.max(
            lineCount - 1,
            0
          ) * 12,
          24
        );

      /*
       * ========================================================
       * REGISTRATION NUMBER
       * ========================================================
       */

      if (
        configuration.registrationNumber
      ) {
        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(9);

        pdf.setTextColor(
          65,
          65,
          65
        );

        const registrationY =
          height * 0.615 +
          extraSpacing;

        pdf.text(
          attendee.registrationNumber ||
            "Registration No.",
          width / 2,
          registrationY,
          {
            align: "center",
          }
        );
      }

      /*
       * ========================================================
       * QR CODE
       * ========================================================
       */

      if (configuration.qr) {
        const qrValue =
          getQRValue(attendee);

        /*
         * Generate a NEW QR based
         * on the selected field.
         */

        const qrDataUrl =
          await QRCode.toDataURL(
            qrValue,
            {
              width: 600,
              margin: 2,
              errorCorrectionLevel:
                "H",
            }
          );

        const qrSize =
          width * 0.21;

        const qrX =
          (width - qrSize) / 2;

        const qrY =
          height * 0.645 +
          extraSpacing;

        /*
         * White QR background
         */

        pdf.setFillColor(
          255,
          255,
          255
        );

        pdf.rect(
          qrX,
          qrY,
          qrSize,
          qrSize,
          "F"
        );

        /*
         * Add QR
         */

        pdf.addImage(
          qrDataUrl,
          "PNG",
          qrX,
          qrY,
          qrSize,
          qrSize,
          undefined,
          "FAST"
        );
      }

      /*
       * ========================================================
       * CATEGORY
       * ========================================================
       */

      if (
        configuration.category &&
        attendee.category?.trim()
      ) {
        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(8);

        pdf.setTextColor(
          70,
          70,
          70
        );

        pdf.text(
          attendee.category
            .trim()
            .toUpperCase(),
          width / 2,
          height * 0.875,
          {
            align: "center",
          }
        );
      }

      /*
       * ========================================================
       * PDF BLOB
       * ========================================================
       */

      return pdf.output(
        "blob"
      );
    };

  /*
   * ============================================================
   * INDIVIDUAL DOWNLOAD
   * ============================================================
   */

  const handleIndividualDownload =
    async (
      attendee: Attendee,
      index: number
    ) => {
      if (!badgeFile) {
        alert(
          "Please upload a badge template first."
        );
        return;
      }

      try {
        setDownloadingIndex(index);

        /*
         * Load template
         */

        const badge =
          await loadBadgeTemplate();

        /*
         * Generate PDF
         */

        const blob =
          await generateBadgePDF(
            attendee,
            badge
          );

        /*
         * Create download
         */

        const url =
          URL.createObjectURL(
            blob
          );

        const anchor =
          document.createElement(
            "a"
          );

        const registration =
          attendee.registrationNumber ||
          attendee.code ||
          `badge-${index + 1}`;

        const name =
          attendee.name ||
          "attendee";

        anchor.href = url;

        anchor.download =
          `${safeFileName(
            registration
          )}_${safeFileName(
            name
          )}.pdf`;

        anchor.style.display =
          "none";

        document.body.appendChild(
          anchor
        );

        anchor.click();

        document.body.removeChild(
          anchor
        );

        /*
         * Give browser time to
         * start the download.
         */

        setTimeout(() => {
          URL.revokeObjectURL(
            url
          );
        }, 1000);
      } catch (error) {
        console.error(
          "Individual download error:",
          error
        );

        alert(
          error instanceof Error
            ? error.message
            : "Unable to download badge."
        );
      } finally {
        setDownloadingIndex(
          null
        );
      }
    };

  /*
   * ============================================================
   * DOWNLOAD ALL
   * ============================================================
   */

  const handleDownloadAll =
    async () => {
      if (!badgeFile) {
        alert(
          "Please upload a badge template first."
        );
        return;
      }

      if (!attendees.length) {
        alert(
          "No attendees available."
        );
        return;
      }

      try {
        setDownloading(true);

        /*
         * Load badge template ONLY ONCE.
         */

        const badge =
          await loadBadgeTemplate();

        const zip =
          new JSZip();

        /*
         * Generate every badge.
         */

        for (
          let index = 0;
          index < attendees.length;
          index++
        ) {
          const attendee =
            attendees[index];

          const blob =
            await generateBadgePDF(
              attendee,
              badge
            );

          const registration =
            attendee.registrationNumber ||
            attendee.code ||
            `badge-${index + 1}`;

          const name =
            attendee.name ||
            "attendee";

          const fileName =
            `${safeFileName(
              registration
            )}_${safeFileName(
              name
            )}.pdf`;

          zip.file(
            fileName,
            blob
          );
        }

        /*
         * Generate ZIP.
         */

        const zipBlob =
          await zip.generateAsync(
            {
              type: "blob",
              compression:
                "DEFLATE",
              compressionOptions: {
                level: 6,
              },
            }
          );

        /*
         * Download ZIP.
         */

        const url =
          URL.createObjectURL(
            zipBlob
          );

        const anchor =
          document.createElement(
            "a"
          );

        anchor.href = url;

        anchor.download =
          "generated-badges.zip";

        anchor.style.display =
          "none";

        document.body.appendChild(
          anchor
        );

        anchor.click();

        document.body.removeChild(
          anchor
        );

        setTimeout(() => {
          URL.revokeObjectURL(
            url
          );
        }, 1500);
      } catch (error) {
        console.error(
          "Download all error:",
          error
        );

        alert(
          error instanceof Error
            ? error.message
            : "Unable to generate badges."
        );
      } finally {
        setDownloading(false);
      }
    };

  /*
   * ============================================================
   * NO ATTENDEES
   * ============================================================
   */

  if (!attendees.length) {
    return null;
  }

  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">

      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900">
            <CheckCircle2 className="h-5 w-5" />
          </div>

          <div>

            <h2 className="font-semibold">
              Generated Badges
            </h2>

            <p className="text-xs text-zinc-500">
              {attendees.length} personalized{" "}
              {attendees.length === 1
                ? "badge"
                : "badges"}{" "}
              ready
            </p>

          </div>

        </div>

        {/* DOWNLOAD ALL */}

        <button
          type="button"
          onClick={handleDownloadAll}
          disabled={downloading}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-black px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >

          {downloading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileArchive className="h-4 w-4" />
              Download All
            </>
          )}

        </button>

      </div>

      {/* INFO */}

      <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">

        <p className="text-xs font-medium">
          Bulk download
        </p>

        <p className="mt-1 text-xs leading-5 text-zinc-500">
          Download All creates a ZIP containing
          one personalized PDF badge for every
          attendee.
        </p>

      </div>

      {/* ATTENDEE LIST */}

      <div className="mt-5 divide-y divide-zinc-100 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">

        {attendees.map(
          (
            attendee,
            index
          ) => (
            <div
              key={attendee.id}
              className="flex items-center justify-between gap-4 p-4"
            >

              {/* INFO */}

              <div className="flex min-w-0 items-center gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xs font-semibold dark:bg-zinc-900">
                  {index + 1}
                </div>

                <div className="min-w-0">

                  <p className="truncate text-sm font-medium">
                    {attendee.name ||
                      "Unnamed Attendee"}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-zinc-500">
                    {attendee.registrationNumber ||
                      attendee.code ||
                      "No registration number"}
                  </p>

                </div>

              </div>

              {/* DOWNLOAD */}

              <button
                type="button"
                onClick={() =>
                  handleIndividualDownload(
                    attendee,
                    index
                  )
                }
                disabled={
                  downloading ||
                  downloadingIndex ===
                    index
                }
                className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >

                {downloadingIndex ===
                index ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Creating
                  </>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </>
                )}

              </button>

            </div>
          )
        )}

      </div>

    </section>
  );
}