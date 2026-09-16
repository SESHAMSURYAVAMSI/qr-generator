"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { FileImage, Loader2 } from "lucide-react";

import type {
  Attendee,
  BadgeConfiguration,
} from "@/types/badge";

interface BadgePreviewProps {
  attendee?: Attendee;
  configuration: BadgeConfiguration;
  badgeFile: File | null;
}

export default function BadgePreview({
  attendee,
  configuration,
  badgeFile,
}: BadgePreviewProps) {
  const [badgeImage, setBadgeImage] =
    useState<string | null>(null);

  const [qrImage, setQrImage] =
    useState<string | null>(null);

  const [loadingBadge, setLoadingBadge] =
    useState(false);

  const [pdfError, setPdfError] =
    useState<string | null>(null);

  /*
   * ============================================================
   * QR VALUE
   * ============================================================
   */

  const qrValue = useMemo(() => {
    if (!attendee) {
      return "PREVIEW-QR-001";
    }

    if (
      configuration.qrField ===
      "registrationNumber"
    ) {
      return (
        attendee.registrationNumber?.trim() ||
        "PREVIEW-QR-001"
      );
    }

    if (
      configuration.qrField === "code"
    ) {
      return (
        attendee.code?.trim() ||
        "PREVIEW-QR-001"
      );
    }

    if (
      configuration.qrField === "custom"
    ) {
      const customField =
        configuration.customQRField?.trim();

      if (customField) {
        return (
          attendee[customField]?.trim() ||
          "PREVIEW-QR-001"
        );
      }
    }

    return "PREVIEW-QR-001";
  }, [attendee, configuration]);

  /*
   * ============================================================
   * GENERATE QR
   * ============================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function generateQR() {
      if (!configuration.qr) {
        setQrImage(null);
        return;
      }

      try {
        const dataUrl =
          await QRCode.toDataURL(
            qrValue,
            {
              width: 500,
              margin: 2,
              errorCorrectionLevel: "H",
            }
          );

        if (!cancelled) {
          setQrImage(dataUrl);
        }
      } catch (error) {
        console.error(
          "QR generation error:",
          error
        );

        if (!cancelled) {
          setQrImage(null);
        }
      }
    }

    generateQR();

    return () => {
      cancelled = true;
    };
  }, [
    qrValue,
    configuration.qr,
  ]);

  /*
   * ============================================================
   * LOAD BADGE
   * ============================================================
   */

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    async function loadBadge() {
      if (!badgeFile) {
        setBadgeImage(null);
        return;
      }

      setLoadingBadge(true);
      setPdfError(null);
      setBadgeImage(null);

      try {
        const fileType =
          badgeFile.type.toLowerCase();

        /*
         * IMAGE
         */

        if (
          fileType === "image/png" ||
          fileType === "image/jpeg" ||
          fileType === "image/jpg" ||
          fileType === "image/webp"
        ) {
          objectUrl =
            URL.createObjectURL(
              badgeFile
            );

          if (!cancelled) {
            setBadgeImage(
              objectUrl
            );
          }

          return;
        }

        /*
         * PDF
         */

        if (
          fileType ===
            "application/pdf" ||
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
              scale: 2.5,
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

          canvas.width =
            Math.ceil(
              viewport.width
            );

          canvas.height =
            Math.ceil(
              viewport.height
            );

          await page.render({
            canvasContext: context,
            viewport,
          }).promise;

          const dataUrl =
            canvas.toDataURL(
              "image/png"
            );

          if (!cancelled) {
            setBadgeImage(
              dataUrl
            );
          }

          return;
        }

        throw new Error(
          "Unsupported badge format."
        );
      } catch (error) {
        console.error(
          "Badge preview error:",
          error
        );

        if (!cancelled) {
          setPdfError(
            error instanceof Error
              ? error.message
              : "Unable to preview badge."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingBadge(false);
        }
      }
    }

    loadBadge();

    return () => {
      cancelled = true;

      if (objectUrl) {
        URL.revokeObjectURL(
          objectUrl
        );
      }
    };
  }, [badgeFile]);

  /*
   * ============================================================
   * DETECT LONG NAME
   * ============================================================
   */

  const name =
    attendee?.name?.trim() ||
    "Attendee Name";

  /*
   * This controls whether the name
   * is likely to occupy two lines.
   *
   * Long names get extra vertical
   * space below them.
   */

  const isLongName =
    name.length > 27;

  /*
   * ============================================================
   * NO FILE
   * ============================================================
   */

  if (!badgeFile) {
    return (
      <div className="flex min-h-[600px] items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-zinc-800">
            <FileImage className="h-7 w-7 text-zinc-400" />
          </div>

          <h3 className="text-sm font-semibold">
            Badge Preview
          </h3>

          <p className="mt-1 text-xs text-zinc-500">
            Upload your badge template to
            preview it here.
          </p>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loadingBadge) {
    return (
      <div className="flex min-h-[600px] items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-zinc-500" />

          <p className="mt-3 text-sm font-medium">
            Loading badge...
          </p>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * ERROR
   * ============================================================
   */

  if (pdfError) {
    return (
      <div className="flex min-h-[600px] items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/20">
        <div className="text-center">
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">
            Unable to preview badge
          </p>

          <p className="mt-2 text-xs text-red-600 dark:text-red-400">
            {pdfError}
          </p>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * PREVIEW
   * ============================================================
   */

  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">

      <div className="flex justify-center">

        <div className="relative w-full max-w-[520px] overflow-hidden rounded-xl bg-white shadow-xl">

          {/* ORIGINAL BADGE */}

          {badgeImage && (
            <img
              src={badgeImage}
              alt="Badge template"
              className="block h-auto w-full select-none"
              draggable={false}
            />
          )}

          {/* ==================================================
              NAME
          ================================================== */}

          {configuration.name && (
            <div
              className="
                absolute
                left-[8%]
                top-[51%]
                w-[84%]
                text-center
              "
            >
              <p
                className="
                  break-words
                  text-[clamp(13px,3vw,25px)]
                  font-bold
                  leading-[1.12]
                  text-black
                "
              >
                {name}
              </p>
            </div>
          )}

          {/* ==================================================
              REGISTRATION NUMBER
          ================================================== */}

          {configuration.registrationNumber && (
            <div
              className={`
                absolute
                left-[8%]
                w-[84%]
                text-center
                ${
                  isLongName
                    ? "top-[65%]"
                    : "top-[61%]"
                }
              `}
            >
              <p
                className="
                  text-[clamp(10px,2vw,17px)]
                  font-medium
                  leading-tight
                  text-zinc-700
                "
              >
                {attendee?.registrationNumber ||
                  "Registration No."}
              </p>
            </div>
          )}

          {/* ==================================================
              QR
          ================================================== */}

          {configuration.qr &&
            qrImage && (
              <div
                className={`
                  absolute
                  left-1/2
                  w-[21%]
                  -translate-x-1/2
                  ${
                    isLongName
                      ? "top-[72%]"
                      : "top-[67%]"
                  }
                `}
              >
                <div className="aspect-square w-full bg-white p-[2%]">
                  <img
                    src={qrImage}
                    alt={`QR code for ${qrValue}`}
                    className="block h-full w-full"
                    draggable={false}
                  />
                </div>
              </div>
            )}

          {/* ==================================================
              CATEGORY
          ================================================== */}

          {configuration.category &&
            attendee?.category?.trim() && (
              <div
                className="
                  absolute
                  left-[8%]
                  top-[88%]
                  w-[84%]
                  text-center
                "
              >
                <p
                  className="
                    text-[clamp(9px,1.7vw,15px)]
                    font-semibold
                    uppercase
                    tracking-wide
                    text-zinc-700
                  "
                >
                  {attendee.category}
                </p>
              </div>
            )}

        </div>

      </div>

      {/* QR VALUE */}

      {configuration.qr && (
        <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-950">

          <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
            QR Value
          </p>

          <p className="mt-1 truncate font-mono text-sm font-semibold">
            {qrValue}
          </p>

        </div>
      )}

    </div>
  );
}