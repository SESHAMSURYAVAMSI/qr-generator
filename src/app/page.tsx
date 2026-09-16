"use client";

import * as XLSX from "xlsx";
import { useMemo, useState } from "react";
import {
  FileSpreadsheet,
  QrCode,
  Settings2,
  Users,
  CheckCircle2,
} from "lucide-react";

import FileUpload from "@/components/FileUpload";
import AttendeeTable from "@/components/AttendeeTable";
import BadgePreview from "@/components/BadgePreview";
import DownloadBadges from "@/components/DownloadBadges";

import {
  Attendee,
  BadgeConfiguration,
} from "@/types/badge";

export default function Home() {
  const [badgeFile, setBadgeFile] =
    useState<File | null>(null);

  const [attendeeFile, setAttendeeFile] =
    useState<File | null>(null);

  const [attendees, setAttendees] =
    useState<Attendee[]>([]);

  const [selectedAttendeeIndex, setSelectedAttendeeIndex] =
    useState(0);

  const [configuration, setConfiguration] =
    useState<BadgeConfiguration>({
      name: true,
      registrationNumber: true,
      qr: true,
      category: false,
      qrField: "registrationNumber",
    });

  /*
   * ------------------------------------------------------------
   * GET CURRENTLY SELECTED ATTENDEE
   * ------------------------------------------------------------
   */

  const selectedAttendee = useMemo(() => {
    return attendees[selectedAttendeeIndex];
  }, [attendees, selectedAttendeeIndex]);

  /*
   * ------------------------------------------------------------
   * NORMALIZE EXCEL COLUMN NAMES
   * ------------------------------------------------------------
   */

  const normalizeColumnName = (value: string) => {
    return value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/[._-]+/g, " ")
      .trim();
  };

  /*
   * ------------------------------------------------------------
   * FIND COLUMN VALUE
   * ------------------------------------------------------------
   */

  const findColumnValue = (
    row: Record<string, unknown>,
    possibleNames: string[]
  ) => {
    const normalizedNames =
      possibleNames.map(normalizeColumnName);

    const entry = Object.entries(row).find(
      ([key]) => {
        const normalizedKey =
          normalizeColumnName(key);

        return normalizedNames.includes(
          normalizedKey
        );
      }
    );

    if (!entry) {
      return "";
    }

    return String(entry[1] ?? "").trim();
  };

  /*
   * ------------------------------------------------------------
   * UPLOAD EXCEL / CSV
   * ------------------------------------------------------------
   */

  const handleExcelUpload = async (
    file: File | null
  ) => {
    setAttendeeFile(file);
    setSelectedAttendeeIndex(0);

    if (!file) {
      setAttendees([]);
      return;
    }

    try {
      const buffer =
        await file.arrayBuffer();

      const workbook = XLSX.read(buffer, {
        type: "array",
        cellDates: false,
        raw: false,
      });

      const sheetName =
        workbook.SheetNames[0];

      if (!sheetName) {
        console.error(
          "No worksheet found."
        );

        setAttendees([]);
        return;
      }

      const worksheet =
        workbook.Sheets[sheetName];

      const rows =
        XLSX.utils.sheet_to_json<
          Record<string, unknown>
        >(worksheet, {
          defval: "",
          raw: false,
        });

      console.log(
        "Excel rows:",
        rows
      );

      const importedAttendees: Attendee[] =
        rows.map((row, index) => {
          /*
           * NAME
           */

          const name =
            findColumnValue(row, [
              "name",
              "full name",
              "fullname",
              "attendee name",
              "participant name",
            ]);

          /*
           * REGISTRATION NUMBER
           */

          const registrationNumber =
            findColumnValue(row, [
              "registration no.",
              "registration no",
              "registration number",
              "reg no.",
              "reg no",
              "reg number",
              "registration",
              "registration id",
            ]);

          /*
           * CODE
           */

          const code =
            findColumnValue(row, [
              "code",
              "attendee code",
              "participant code",
              "delegate code",
              "unique code",
            ]);

          /*
           * CATEGORY
           */

          const category =
            findColumnValue(row, [
              "category",
              "type",
              "attendee type",
              "participant type",
            ]);

          return {
            id: `attendee-${Date.now()}-${index}`,
            name,
            registrationNumber,
            code,
            category,
          };
        });

      console.log(
        "Imported attendees:",
        importedAttendees
      );

      setAttendees(
        importedAttendees
      );
    } catch (error) {
      console.error(
        "Failed to import Excel file:",
        error
      );

      setAttendees([]);
    }
  };

  /*
   * ------------------------------------------------------------
   * UPDATE BADGE CONFIGURATION
   * ------------------------------------------------------------
   */

  const updateConfig = (
    key: keyof BadgeConfiguration,
    value: boolean | string
  ) => {
    setConfiguration(
      (previous) => ({
        ...previous,
        [key]: value,
      })
    );
  };

  /*
   * ------------------------------------------------------------
   * SELECT ATTENDEE
   * ------------------------------------------------------------
   */

  const handleAttendeeSelect = (
    index: number
  ) => {
    setSelectedAttendeeIndex(index);
  };

  /*
   * ------------------------------------------------------------
   * PAGE
   * ------------------------------------------------------------
   */

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-white">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-black p-2.5 text-white dark:bg-white dark:text-black">
              <QrCode className="h-5 w-5" />
            </div>

            <div>
              <h1 className="font-semibold">
                Badge QR Generator
              </h1>

              <p className="text-xs text-zinc-500">
                Generate personalized event badges
              </p>
            </div>

          </div>

        </div>
      </header>

      {/* ======================================================
          MAIN
      ====================================================== */}

      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* ====================================================
            PAGE INTRO
        ==================================================== */}

        <div className="mb-8">

          <h2 className="text-3xl font-bold tracking-tight">
            Create Event Badges
          </h2>

          <p className="mt-2 max-w-2xl text-zinc-500">
            Upload your badge template and attendee list,
            choose the QR value, preview personalized
            badges, and download them individually or all
            together.
          </p>

        </div>

        {/* ====================================================
            UPLOAD SECTION
        ==================================================== */}

        <div className="grid gap-6 lg:grid-cols-2">

          {/* BADGE TEMPLATE */}

          <FileUpload
            title="Badge Template"
            description="Upload PDF, PNG or JPG badge design"
            accept=".pdf,.png,.jpg,.jpeg"
            file={badgeFile}
            onFileChange={setBadgeFile}
          />

          {/* ATTENDEE LIST */}

          <FileUpload
            title="Attendee List"
            description="Upload Excel or CSV attendee data"
            accept=".xlsx,.xls,.csv"
            file={attendeeFile}
            onFileChange={handleExcelUpload}
          />

        </div>

        {/* ====================================================
            IMPORT SUMMARY
        ==================================================== */}

        {attendees.length > 0 && (
          <div className="mt-6 grid gap-4 sm:grid-cols-3">

            {/* ATTENDEES */}

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-zinc-100 p-3 dark:bg-zinc-900">
                  <Users className="h-5 w-5" />
                </div>

                <div>

                  <p className="text-xs text-zinc-500">
                    Attendees
                  </p>

                  <p className="text-2xl font-bold">
                    {attendees.length}
                  </p>

                </div>

              </div>

            </div>

            {/* FILE */}

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-zinc-100 p-3 dark:bg-zinc-900">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>

                <div>

                  <p className="text-xs text-zinc-500">
                    File
                  </p>

                  <p className="max-w-[180px] truncate text-sm font-semibold">
                    {attendeeFile?.name}
                  </p>

                </div>

              </div>

            </div>

            {/* STATUS */}

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-zinc-100 p-3 dark:bg-zinc-900">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div>

                  <p className="text-xs text-zinc-500">
                    Status
                  </p>

                  <p className="text-sm font-semibold">
                    Data Loaded
                  </p>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* ====================================================
            ATTENDEE TABLE
        ==================================================== */}

        {attendees.length > 0 && (
          <div className="mt-8">

            <AttendeeTable
              attendees={attendees}
            />

          </div>
        )}

        {/* ====================================================
            CONFIGURATION + PREVIEW
        ==================================================== */}

        <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">

          {/* ==================================================
              SETTINGS
          ================================================== */}

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">

            {/* SETTINGS HEADER */}

            <div className="mb-6 flex items-center gap-3">

              <div className="rounded-lg bg-zinc-100 p-2 dark:bg-zinc-900">
                <Settings2 className="h-5 w-5" />
              </div>

              <div>

                <h2 className="font-semibold">
                  Badge Fields
                </h2>

                <p className="text-xs text-zinc-500">
                  Choose what appears on the badge
                </p>

              </div>

            </div>

            {/* =================================================
                NAME
            ================================================= */}

            <label className="flex min-h-11 items-center justify-between border-b border-zinc-100 dark:border-zinc-800">

              <span className="text-sm">
                Name
              </span>

              <input
                type="checkbox"
                checked={
                  configuration.name
                }
                onChange={(event) =>
                  updateConfig(
                    "name",
                    event.target.checked
                  )
                }
                className="h-4 w-4"
              />

            </label>

            {/* =================================================
                REGISTRATION NUMBER
            ================================================= */}

            <label className="flex min-h-11 items-center justify-between border-b border-zinc-100 dark:border-zinc-800">

              <span className="text-sm">
                Registration Number
              </span>

              <input
                type="checkbox"
                checked={
                  configuration.registrationNumber
                }
                onChange={(event) =>
                  updateConfig(
                    "registrationNumber",
                    event.target.checked
                  )
                }
                className="h-4 w-4"
              />

            </label>

            {/* =================================================
                QR CODE
            ================================================= */}

            <label className="flex min-h-11 items-center justify-between border-b border-zinc-100 dark:border-zinc-800">

              <span className="text-sm">
                QR Code
              </span>

              <input
                type="checkbox"
                checked={
                  configuration.qr
                }
                onChange={(event) =>
                  updateConfig(
                    "qr",
                    event.target.checked
                  )
                }
                className="h-4 w-4"
              />

            </label>

            {/* =================================================
                CATEGORY
            ================================================= */}

            <label className="flex min-h-11 items-center justify-between">

              <span className="text-sm">

                Category

                <span className="ml-1 text-xs text-zinc-400">
                  Optional
                </span>

              </span>

              <input
                type="checkbox"
                checked={
                  configuration.category
                }
                onChange={(event) =>
                  updateConfig(
                    "category",
                    event.target.checked
                  )
                }
                className="h-4 w-4"
              />

            </label>

            {/* =================================================
                QR SETTINGS
            ================================================= */}

            <div className="my-6 border-t border-zinc-200 dark:border-zinc-800" />

            <div>

              <label className="mb-2 block text-sm font-medium">
                QR Value
              </label>

              <p className="mb-3 text-xs text-zinc-500">
                Select which attendee field should be
                encoded inside the QR code.
              </p>

              <select
                value={
                  configuration.qrField
                }
                onChange={(event) =>
                  updateConfig(
                    "qrField",
                    event.target.value
                  )
                }
                className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-black dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-white"
              >

                <option value="registrationNumber">
                  Registration Number
                </option>

                <option value="code">
                  Attendee Code
                </option>

                <option value="custom">
                  Custom Field
                </option>

              </select>

            </div>

            {/* =================================================
                ATTENDEE SELECTOR
            ================================================= */}

            {attendees.length > 0 && (
              <div className="mt-6">

                <label className="mb-2 block text-sm font-medium">
                  Preview Attendee
                </label>

                <select
                  value={
                    selectedAttendeeIndex
                  }
                  onChange={(event) =>
                    handleAttendeeSelect(
                      Number(
                        event.target.value
                      )
                    )
                  }
                  className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-black dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-white"
                >

                  {attendees.map(
                    (
                      attendee,
                      index
                    ) => (
                      <option
                        key={
                          attendee.id
                        }
                        value={index}
                      >
                        {attendee.name ||
                          "Unnamed Attendee"}{" "}
                        —{" "}
                        {attendee.registrationNumber ||
                          "No Reg No."}
                      </option>
                    )
                  )}

                </select>

              </div>
            )}

            {/* =================================================
                CURRENT QR VALUE
            ================================================= */}

            <div className="mt-6 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">

              <p className="text-xs font-medium text-zinc-500">
                Current QR Value
              </p>

              <p className="mt-1 break-all font-mono text-sm font-semibold text-zinc-900 dark:text-white">

                {configuration.qrField ===
                "registrationNumber"
                  ? selectedAttendee
                      ?.registrationNumber ||
                    "PREVIEW-QR-001"
                  : configuration.qrField ===
                      "code"
                    ? selectedAttendee
                        ?.code ||
                      "PREVIEW-QR-001"
                    : "PREVIEW-QR-001"}

              </p>

            </div>

          </section>

          {/* ==================================================
              PREVIEW
          ================================================== */}

          <section className="rounded-2xl border border-zinc-200 bg-zinc-100 p-6 dark:border-zinc-800 dark:bg-zinc-900">

            <div className="mb-5">

              <h2 className="font-semibold">
                Badge Preview
              </h2>

              <p className="text-xs text-zinc-500">

                {selectedAttendee
                  ? `Previewing ${
                      selectedAttendee.name ||
                      "attendee"
                    }`
                  : "Preview using sample data"}

              </p>

            </div>

            <BadgePreview
              attendee={
                selectedAttendee
              }
              configuration={
                configuration
              }
              badgeFile={
                badgeFile
              }
            />

          </section>

        </div>

        {/* ====================================================
            DOWNLOAD BADGES
        ==================================================== */}

        {attendees.length > 0 &&
          badgeFile && (
            <DownloadBadges
              attendees={attendees}
              badgeFile={badgeFile}
              configuration={configuration
              }
            />
          )}

      </div>
    </main>
  );
}