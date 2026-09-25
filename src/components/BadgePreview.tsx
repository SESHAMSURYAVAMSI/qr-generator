"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import QRCode from "qrcode";

import {
  FileImage,
  Loader2,
} from "lucide-react";

import type {
  Attendee,
  BadgeConfiguration,
} from "@/types/badge";

interface BadgePreviewProps {
  attendee?: Attendee | null;
  configuration?: BadgeConfiguration;
  badgeFile: File | null;
}

/*
 * ============================================================
 * DEFAULT CONFIGURATION
 * ============================================================
 *
 * This prevents runtime errors if the parent temporarily
 * passes undefined configuration during rendering.
 */

const DEFAULT_CONFIGURATION: BadgeConfiguration = {
  name: true,
  registrationNumber: true,
  qr: true,
  category: false,
  qrField: "registrationNumber",
  customQRField: "",
};

export default function BadgePreview({
  attendee,
  configuration,
  badgeFile,
}: BadgePreviewProps) {
  /*
   * Always use a valid configuration.
   *
   * If the parent sends undefined for any reason,
   * the preview will safely use DEFAULT_CONFIGURATION.
   */

  const safeConfiguration =
    configuration ??
    DEFAULT_CONFIGURATION;

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
   * NORMALIZE FIELD NAME
   * ============================================================
   */

  const normalizeFieldName = (
    value: string
  ) => {
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
    currentAttendee: Attendee,
    fieldName?: string
  ) => {
    const requestedField =
      fieldName?.trim();

    if (!requestedField) {
      return "";
    }

    /*
     * First try exact field name.
     */

    const exactValue =
      currentAttendee[
        requestedField
      ];

    if (exactValue?.trim()) {
      return exactValue.trim();
    }

    /*
     * Then try normalized field name.
     *
     * Example:
     *
     * Excel:
     * "Email Address"
     *
     * Selected:
     * "email address"
     *
     * Both will match.
     */

    const normalizedTarget =
      normalizeFieldName(
        requestedField
      );

    const matchingKey =
      Object.keys(
        currentAttendee
      ).find(
        (key) =>
          normalizeFieldName(
            key
          ) === normalizedTarget
      );

    if (matchingKey) {
      return (
        currentAttendee[
          matchingKey
        ]?.trim() || ""
      );
    }

    return "";
  };

  /*
   * ============================================================
   * QR VALUE
   * ============================================================
   */

  const qrValue = useMemo(() => {
    /*
     * No attendee selected.
     */

    if (!attendee) {
      return "PREVIEW-QR-001";
    }

    /*
     * ========================================================
     * REGISTRATION NUMBER
     * ========================================================
     */

    if (
      safeConfiguration.qrField ===
      "registrationNumber"
    ) {
      return (
        attendee.registrationNumber?.trim() ||
        "NO-REGISTRATION"
      );
    }

    /*
     * ========================================================
     * ATTENDEE NAME
     * ========================================================
     */

    if (
      safeConfiguration.qrField ===
      "name"
    ) {
      return (
        attendee.name?.trim() ||
        "NO-NAME"
      );
    }

    /*
     * ========================================================
     * ATTENDEE CODE
     * ========================================================
     */

    if (
      safeConfiguration.qrField ===
      "code"
    ) {
      return (
        attendee.code?.trim() ||
        "NO-CODE"
      );
    }

    /*
     * ========================================================
     * CUSTOM FIELD
     * ========================================================
     */

    if (
      safeConfiguration.qrField ===
      "custom"
    ) {
      const customValue =
        getCustomFieldValue(
          attendee,
          safeConfiguration.customQRField
        );

      if (customValue) {
        return customValue;
      }

      if (
        !safeConfiguration.customQRField?.trim()
      ) {
        return "SELECT-CUSTOM-FIELD";
      }

      return "NO-CUSTOM-VALUE";
    }

    /*
     * Safety fallback.
     */

    return "PREVIEW-QR-001";
  }, [
    attendee,
    safeConfiguration.qrField,
    safeConfiguration.customQRField,
  ]);

  /*
   * ============================================================
   * GENERATE QR
   * ============================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function generateQR() {
      /*
       * QR disabled.
       */

      if (!safeConfiguration.qr) {
        setQrImage(null);
        return;
      }

      /*
       * Clear previous QR immediately.
       *
       * This prevents the old QR from remaining visible
       * while the new QR is being generated.
       */

      setQrImage(null);

      try {
        const dataUrl =
          await QRCode.toDataURL(
            qrValue,
            {
              width: 500,
              margin: 2,
              errorCorrectionLevel:
                "H",
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
    safeConfiguration.qr,
  ]);

  /*
   * ============================================================
   * LOAD BADGE TEMPLATE
   * ============================================================
   */

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null =
      null;

    async function loadBadge() {
      if (!badgeFile) {
        setBadgeImage(null);
        setPdfError(null);
        setLoadingBadge(false);
        return;
      }

      setLoadingBadge(true);
      setPdfError(null);
      setBadgeImage(null);

      try {
        const fileType =
          badgeFile.type.toLowerCase();

        /*
         * ======================================================
         * IMAGE TEMPLATE
         * ======================================================
         */

        if (
          fileType ===
            "image/png" ||
          fileType ===
            "image/jpeg" ||
          fileType ===
            "image/jpg" ||
          fileType ===
            "image/webp"
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
         * ======================================================
         * PDF TEMPLATE
         * ======================================================
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
            canvas,
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
   * NAME
   * ============================================================
   */

  const name =
    attendee?.name?.trim() ||
    "Attendee Name";

  /*
   * ============================================================
   * LONG NAME
   * ============================================================
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

          {safeConfiguration.name && (
            <div className="absolute left-[8%] top-[51%] w-[84%] text-center">
              <p className="break-words text-[clamp(13px,3vw,25px)] font-bold leading-[1.12] text-black">
                {name}
              </p>
            </div>
          )}

          {/* ==================================================
              REGISTRATION NUMBER
          ================================================== */}

          {safeConfiguration.registrationNumber && (
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
              <p className="text-[clamp(10px,2vw,17px)] font-medium leading-tight text-zinc-700">
                {attendee?.registrationNumber ||
                  "Registration No."}
              </p>
            </div>
          )}

          {/* ==================================================
              QR CODE
          ================================================== */}

          {safeConfiguration.qr &&
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
                    alt={`QR code containing ${qrValue}`}
                    className="block h-full w-full"
                    draggable={false}
                  />
                </div>
              </div>
            )}

          {/* ==================================================
              CATEGORY
          ================================================== */}

          {safeConfiguration.category &&
            attendee?.category?.trim() && (
              <div className="absolute left-[8%] top-[88%] w-[84%] text-center">
                <p className="text-[clamp(9px,1.7vw,15px)] font-semibold uppercase tracking-wide text-zinc-700">
                  {attendee.category}
                </p>
              </div>
            )}

        </div>

      </div>

      {/* ======================================================
          QR VALUE
      ====================================================== */}

      {safeConfiguration.qr && (
        <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-950">

          <div className="flex items-center justify-between gap-3">

            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
              QR Value
            </p>

            <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              {safeConfiguration.qrField ===
              "registrationNumber"
                ? "Registration"
                : safeConfiguration.qrField ===
                  "name"
                ? "Name"
                : safeConfiguration.qrField ===
                  "code"
                ? "Code"
                : "Custom"}
            </span>

          </div>

          <p className="mt-1 break-all font-mono text-sm font-semibold">
            {qrValue}
          </p>

        </div>
      )}

    </div>
  );
}