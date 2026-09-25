// "use client";

// import * as XLSX from "xlsx";
// import {
//   useMemo,
//   useState,
//   type ReactNode,
// } from "react";
// import { motion } from "framer-motion";

// import {
//   Check,
//   CheckCircle2,
//   ChevronDown,
//   FileSpreadsheet,
//   LayoutTemplate,
//   QrCode,
//   Settings2,
//   ShieldCheck,
//   Sparkles,
//   UploadCloud,
//   Users,
//   WandSparkles,
// } from "lucide-react";

// import FileUpload from "@/components/FileUpload";
// import AttendeeTable from "@/components/AttendeeTable";
// import BadgePreview from "@/components/BadgePreview";
// import DownloadBadges from "@/components/DownloadBadges";
// import LogoutButton from "@/components/LogoutButton";

// import type {
//   Attendee,
//   BadgeConfiguration,
// } from "@/types/badge";

// /*
//  * ============================================================
//  * DEFAULT CONFIGURATION
//  * ============================================================
//  */

// const DEFAULT_CONFIGURATION: BadgeConfiguration = {
//   name: true,
//   registrationNumber: true,
//   qr: true,
//   category: false,
//   qrField: "registrationNumber",
//   customQRField: "",
// };

// /*
//  * ============================================================
//  * HOME
//  * ============================================================
//  */

// export default function Home() {
//   const [badgeFile, setBadgeFile] =
//     useState<File | null>(null);

//   const [attendeeFile, setAttendeeFile] =
//     useState<File | null>(null);

//   const [attendees, setAttendees] =
//     useState<Attendee[]>([]);

//   const [selectedAttendeeIndex, setSelectedAttendeeIndex] =
//     useState(0);

//   /*
//    * IMPORTANT:
//    * configuration is ALWAYS initialized.
//    */

//   const [configuration, setConfiguration] =
//     useState<BadgeConfiguration>(
//       DEFAULT_CONFIGURATION
//     );

//   /*
//    * ============================================================
//    * SELECTED ATTENDEE
//    * ============================================================
//    */

//   const selectedAttendee = useMemo(() => {
//     if (!attendees.length) {
//       return undefined;
//     }

//     return (
//       attendees[selectedAttendeeIndex] ??
//       attendees[0]
//     );
//   }, [
//     attendees,
//     selectedAttendeeIndex,
//   ]);

//   /*
//    * ============================================================
//    * NORMALIZE COLUMN NAME
//    * ============================================================
//    */

//   const normalizeColumnName = (
//     value: string
//   ) => {
//     return value
//       .trim()
//       .toLowerCase()
//       .replace(/\s+/g, " ")
//       .replace(/[._-]+/g, " ")
//       .trim();
//   };

//   /*
//    * ============================================================
//    * FIND COLUMN VALUE
//    * ============================================================
//    */

//   const findColumnValue = (
//     row: Record<string, unknown>,
//     possibleNames: string[]
//   ) => {
//     const normalizedNames =
//       possibleNames.map(
//         normalizeColumnName
//       );

//     const entry =
//       Object.entries(row).find(
//         ([key]) =>
//           normalizedNames.includes(
//             normalizeColumnName(key)
//           )
//       );

//     if (!entry) {
//       return "";
//     }

//     return String(
//       entry[1] ?? ""
//     ).trim();
//   };

//   /*
//    * ============================================================
//    * HANDLE EXCEL / CSV UPLOAD
//    * ============================================================
//    */

//   const handleExcelUpload = async (
//     file: File | null
//   ) => {
//     setAttendeeFile(file);
//     setSelectedAttendeeIndex(0);

//     if (!file) {
//       setAttendees([]);
//       return;
//     }

//     try {
//       const buffer =
//         await file.arrayBuffer();

//       const workbook =
//         XLSX.read(buffer, {
//           type: "array",
//           cellDates: false,
//           raw: false,
//         });

//       const sheetName =
//         workbook.SheetNames[0];

//       if (!sheetName) {
//         setAttendees([]);
//         return;
//       }

//       const worksheet =
//         workbook.Sheets[sheetName];

//       const rows =
//         XLSX.utils.sheet_to_json<
//           Record<string, unknown>
//         >(worksheet, {
//           defval: "",
//           raw: false,
//         });

//       const importedAttendees: Attendee[] =
//         rows.map((row, index) => {
//           /*
//            * ======================================================
//            * PRESERVE ALL ORIGINAL EXCEL FIELDS
//            *
//            * This is REQUIRED for custom QR fields.
//            * ======================================================
//            */

//           const originalFields: Record<
//             string,
//             string
//           > = {};

//           Object.entries(row).forEach(
//             ([key, value]) => {
//               originalFields[key] =
//                 String(
//                   value ?? ""
//                 ).trim();
//             }
//           );

//           /*
//            * ======================================================
//            * NAME
//            * ======================================================
//            */

//           const name =
//             findColumnValue(
//               row,
//               [
//                 "name",
//                 "full name",
//                 "fullname",
//                 "attendee name",
//                 "participant name",
//               ]
//             );

//           /*
//            * ======================================================
//            * REGISTRATION NUMBER
//            * ======================================================
//            */

//           const registrationNumber =
//             findColumnValue(
//               row,
//               [
//                 "registration no.",
//                 "registration no",
//                 "registration number",
//                 "reg no.",
//                 "reg no",
//                 "reg number",
//                 "registration",
//               ]
//             );

//           /*
//            * ======================================================
//            * CODE
//            * ======================================================
//            */

//           const code =
//             findColumnValue(
//               row,
//               [
//                 "code",
//                 "attendee code",
//                 "participant code",
//                 "delegate code",
//                 "unique code",
//               ]
//             );

//           /*
//            * ======================================================
//            * CATEGORY
//            * ======================================================
//            */

//           const category =
//             findColumnValue(
//               row,
//               [
//                 "category",
//                 "type",
//                 "attendee type",
//                 "participant type",
//               ]
//             );

//           /*
//            * ======================================================
//            * IMPORTANT
//            *
//            * Original Excel fields are spread into attendee.
//            * Canonical fields are written AFTER them so Excel
//            * columns cannot accidentally overwrite id/name/etc.
//            * ======================================================
//            */

//           return {
//             ...originalFields,

//             id: `attendee-${Date.now()}-${index}`,

//             name,

//             registrationNumber,

//             code,

//             category,
//           };
//         });

//       setAttendees(
//         importedAttendees
//       );
//     } catch (error) {
//       console.error(
//         "Failed to import Excel file:",
//         error
//       );

//       setAttendees([]);

//       alert(
//         "Unable to read the attendee file. Please check the Excel/CSV format."
//       );
//     }
//   };

//   /*
//    * ============================================================
//    * UPDATE CONFIGURATION
//    * ============================================================
//    */

//   const updateConfig = (
//     key: keyof BadgeConfiguration,
//     value: boolean | string
//   ) => {
//     setConfiguration(
//       (previous) => ({
//         ...previous,
//         [key]: value,
//       })
//     );
//   };

//   /*
//    * ============================================================
//    * GET CUSTOM QR VALUE
//    * ============================================================
//    */

//   const getCustomQRValue = (
//     attendee: Attendee
//   ) => {
//     const customField =
//       configuration.customQRField?.trim();

//     if (!customField) {
//       return "";
//     }

//     /*
//      * Exact match first.
//      */

//     const exactValue =
//       attendee[customField];

//     if (exactValue?.trim()) {
//       return exactValue.trim();
//     }

//     /*
//      * Normalized match.
//      */

//     const normalizedTarget =
//       normalizeColumnName(
//         customField
//       );

//     const matchingKey =
//       Object.keys(attendee).find(
//         (key) =>
//           normalizeColumnName(
//             key
//           ) === normalizedTarget
//       );

//     if (matchingKey) {
//       return (
//         attendee[
//           matchingKey
//         ]?.trim() || ""
//       );
//     }

//     return "";
//   };

//   /*
//    * ============================================================
//    * CURRENT QR VALUE
//    * ============================================================
//    */

//   const getQRValue = () => {
//     if (!selectedAttendee) {
//       return "PREVIEW-QR-001";
//     }

//     switch (
//       configuration.qrField
//     ) {
//       case "registrationNumber":
//         return (
//           selectedAttendee.registrationNumber?.trim() ||
//           "NO-REGISTRATION"
//         );

//       case "name":
//         return (
//           selectedAttendee.name?.trim() ||
//           "NO-NAME"
//         );

//       case "code":
//         return (
//           selectedAttendee.code?.trim() ||
//           "NO-CODE"
//         );

//       case "custom": {
//         const value =
//           getCustomQRValue(
//             selectedAttendee
//           );

//         if (
//           !configuration.customQRField?.trim()
//         ) {
//           return "SELECT-CUSTOM-FIELD";
//         }

//         return (
//           value ||
//           "NO-CUSTOM-VALUE"
//         );
//       }

//       default:
//         return "PREVIEW-QR-001";
//     }
//   };

//   /*
//    * ============================================================
//    * RESET SELECTED ATTENDEE SAFELY
//    * ============================================================
//    */

//   const handleBadgeFileChange = (
//     file: File | null
//   ) => {
//     setBadgeFile(file);
//   };

//   /*
//    * ============================================================
//    * RENDER
//    * ============================================================
//    */

//   return (
//     <main className="min-h-screen overflow-x-hidden bg-[#f6f8fb] text-zinc-950 dark:bg-[#09090b] dark:text-white">

//       {/* ======================================================
//           BACKGROUND
//       ====================================================== */}

//       <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
//         <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-300/20 blur-3xl dark:bg-emerald-500/10" />

//         <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-cyan-300/20 blur-3xl dark:bg-cyan-500/10" />

//         <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-violet-300/10 blur-3xl dark:bg-violet-500/10" />
//       </div>

//       {/* ======================================================
//           HEADER
//       ====================================================== */}

//       <header className="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/80 backdrop-blur-xl dark:border-zinc-800/70 dark:bg-zinc-950/80">

//         <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

//           <div className="flex items-center gap-3">

//             <motion.div
//               initial={{
//                 scale: 0.8,
//                 opacity: 0,
//               }}
//               animate={{
//                 scale: 1,
//                 opacity: 1,
//               }}
//               className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 text-white shadow-lg shadow-emerald-500/20"
//             >
//               <QrCode className="h-5 w-5" />

//               <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-400 dark:border-zinc-950" />
//             </motion.div>

//             <div>
//               <div className="flex items-center gap-2">

//                 <h1 className="text-sm font-bold tracking-tight sm:text-base">
//                   BadgeFlow
//                 </h1>

//                 <span className="hidden rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700 sm:inline-flex dark:bg-emerald-500/10 dark:text-emerald-400">
//                   PRO
//                 </span>

//               </div>

//               <p className="text-[11px] text-zinc-500">
//                 Event Badge Generator
//               </p>
//             </div>

//           </div>

//           <div className="flex items-center gap-3">

//             <div className="hidden items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-600 shadow-sm sm:flex dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
//               <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
//               Secure workspace
//             </div>

//             <LogoutButton />

//           </div>

//         </div>

//       </header>

//       {/* ======================================================
//           MAIN CONTENT
//       ====================================================== */}

//       <div className="relative z-10 mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">

//         {/* ====================================================
//             HERO
//         ==================================================== */}

//         <motion.section
//           initial={{
//             opacity: 0,
//             y: 15,
//           }}
//           animate={{
//             opacity: 1,
//             y: 0,
//           }}
//           className="mb-8"
//         >

//           <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">

//             <div>

//               <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
//                 <Sparkles className="h-3.5 w-3.5" />
//                 Smart badge generation
//               </div>

//               <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
//                 Create event badges

//                 <span className="block bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
//                   in seconds.
//                 </span>
//               </h2>

//               <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500 sm:text-base dark:text-zinc-400">
//                 Upload your badge design and attendee
//                 spreadsheet. BadgeFlow automatically
//                 creates personalized badges with unique
//                 QR codes.
//               </p>

//             </div>

//             <div className="hidden rounded-2xl border border-zinc-200 bg-white/70 px-5 py-4 shadow-sm backdrop-blur lg:block dark:border-zinc-800 dark:bg-zinc-900/70">

//               <div className="flex items-center gap-3">

//                 <div className="rounded-xl bg-emerald-50 p-2.5 dark:bg-emerald-500/10">
//                   <WandSparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
//                 </div>

//                 <div>

//                   <p className="text-xs font-semibold">
//                     Ready to generate
//                   </p>

//                   <p className="text-[11px] text-zinc-500">
//                     Upload your files below
//                   </p>

//                 </div>

//               </div>

//             </div>

//           </div>

//         </motion.section>

//         {/* ====================================================
//             STATS
//         ==================================================== */}

//         <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">

//           <StatCard
//             icon={<Users />}
//             label="Attendees"
//             value={attendees.length}
//             accent="emerald"
//           />

//           <StatCard
//             icon={<LayoutTemplate />}
//             label="Badge template"
//             value={
//               badgeFile
//                 ? "Ready"
//                 : "Waiting"
//             }
//             accent="blue"
//           />

//           <StatCard
//             icon={<FileSpreadsheet />}
//             label="Data source"
//             value={
//               attendeeFile
//                 ? "Imported"
//                 : "Waiting"
//             }
//             accent="violet"
//           />

//           <StatCard
//             icon={<QrCode />}
//             label="QR status"
//             value={
//               attendees.length > 0
//                 ? "Ready"
//                 : "Waiting"
//             }
//             accent="cyan"
//           />

//         </div>

//         {/* ====================================================
//             STEP 01 - UPLOAD
//         ==================================================== */}

//         <motion.section
//           initial={{
//             opacity: 0,
//             y: 15,
//           }}
//           animate={{
//             opacity: 1,
//             y: 0,
//           }}
//           transition={{
//             delay: 0.05,
//           }}
//           className="mb-8"
//         >

//           <SectionHeading
//             number="01"
//             icon={<UploadCloud />}
//             title="Upload your files"
//             description="Add the badge template and attendee spreadsheet."
//           />

//           <div className="grid gap-5 lg:grid-cols-2">

//             {/* BADGE TEMPLATE */}

//             <PremiumUploadCard
//               icon={<LayoutTemplate />}
//               title="Badge Template"
//               description="PDF, PNG, JPG or JPEG"
//               uploadedFile={badgeFile}
//               color="emerald"
//             >
//               <FileUpload
//                 title="Badge Template"
//                 description="Upload PDF, PNG or JPG badge design"
//                 accept=".pdf,.png,.jpg,.jpeg,.webp"
//                 file={badgeFile}
//                 onFileChange={
//                   handleBadgeFileChange
//                 }
//               />
//             </PremiumUploadCard>

//             {/* ATTENDEE FILE */}

//             <PremiumUploadCard
//               icon={<FileSpreadsheet />}
//               title="Attendee List"
//               description="Excel or CSV spreadsheet"
//               uploadedFile={attendeeFile}
//               color="blue"
//             >
//               <FileUpload
//                 title="Attendee List"
//                 description="Upload Excel or CSV attendee data"
//                 accept=".xlsx,.xls,.csv"
//                 file={attendeeFile}
//                 onFileChange={
//                   handleExcelUpload
//                 }
//               />
//             </PremiumUploadCard>

//           </div>

//         </motion.section>

//         {/* ====================================================
//             STEP 02 - CONFIGURATION + PREVIEW
//         ==================================================== */}

//         <motion.section
//           initial={{
//             opacity: 0,
//             y: 15,
//           }}
//           animate={{
//             opacity: 1,
//             y: 0,
//           }}
//           transition={{
//             delay: 0.1,
//           }}
//           className="mb-8"
//         >

//           <SectionHeading
//             number="02"
//             icon={<Settings2 />}
//             title="Configure your badge"
//             description="Choose what appears on the badge and what your QR code contains."
//           />

//           <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">

//             {/* ==================================================
//                 SETTINGS PANEL
//             ================================================== */}

//             <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-[0_15px_50px_-25px_rgba(0,0,0,0.25)] sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">

//               <div className="mb-6 flex items-center justify-between">

//                 <div>

//                   <h3 className="font-bold">
//                     Badge settings
//                   </h3>

//                   <p className="mt-1 text-xs text-zinc-500">
//                     Control your badge fields
//                   </p>

//                 </div>

//                 <div className="rounded-xl bg-zinc-100 p-2.5 dark:bg-zinc-800">
//                   <Settings2 className="h-4 w-4" />
//                 </div>

//               </div>

//               {/* FIELD TOGGLES */}

//               <div className="space-y-3">

//                 <ToggleRow
//                   label="Attendee Name"
//                   description="Display attendee name"
//                   checked={
//                     configuration.name
//                   }
//                   onChange={(value) =>
//                     updateConfig(
//                       "name",
//                       value
//                     )
//                   }
//                 />

//                 <ToggleRow
//                   label="Registration Number"
//                   description="Display registration ID"
//                   checked={
//                     configuration.registrationNumber
//                   }
//                   onChange={(value) =>
//                     updateConfig(
//                       "registrationNumber",
//                       value
//                     )
//                   }
//                 />

//                 <ToggleRow
//                   label="QR Code"
//                   description="Generate unique QR code"
//                   checked={
//                     configuration.qr
//                   }
//                   onChange={(value) =>
//                     updateConfig(
//                       "qr",
//                       value
//                     )
//                   }
//                 />

//                 <ToggleRow
//                   label="Category"
//                   description="Display attendee category"
//                   checked={
//                     configuration.category
//                   }
//                   onChange={(value) =>
//                     updateConfig(
//                       "category",
//                       value
//                     )
//                   }
//                 />

//               </div>

//               {/* ==================================================
//                   QR SETTINGS
//               ================================================== */}

//               {configuration.qr && (
//                 <div className="mt-6 border-t border-zinc-100 pt-6 dark:border-zinc-800">

//                   <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
//                     QR Code Value
//                   </label>

//                   <div className="relative">

//                     <select
//                       value={
//                         configuration.qrField
//                       }
//                       onChange={(event) =>
//                         updateConfig(
//                           "qrField",
//                           event.target.value
//                         )
//                       }
//                       className="w-full appearance-none rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 pr-10 text-sm font-medium outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-zinc-700 dark:bg-zinc-800"
//                     >

//                       <option value="registrationNumber">
//                         Registration Number
//                       </option>

//                       <option value="name">
//                         Attendee Name
//                       </option>

//                       <option value="code">
//                         Attendee Code
//                       </option>

//                       <option value="custom">
//                         Custom Field
//                       </option>

//                     </select>

//                     <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

//                   </div>

//                   {/* ==================================================
//                       CUSTOM FIELD
//                   ================================================== */}

//                   {configuration.qrField ===
//                     "custom" && (
//                     <div className="mt-3">

//                       <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
//                         Excel Column Name
//                       </label>

//                       <input
//                         type="text"
//                         value={
//                           configuration.customQRField ??
//                           ""
//                         }
//                         onChange={(event) =>
//                           updateConfig(
//                             "customQRField",
//                             event.target.value
//                           )
//                         }
//                         placeholder="Example: Email Address"
//                         className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-zinc-700 dark:bg-zinc-800"
//                       />

//                       <p className="mt-2 text-[10px] leading-4 text-zinc-400">
//                         Enter the Excel column name whose
//                         value should be stored in the QR
//                         code. Column spacing and
//                         capitalization do not matter.
//                       </p>

//                     </div>
//                   )}

//                   {/* CURRENT QR VALUE */}

//                   <div className="mt-3 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/70">

//                     <div className="mb-1 flex items-center gap-2">

//                       <QrCode className="h-3.5 w-3.5 text-emerald-500" />

//                       <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
//                         Current QR value
//                       </span>

//                     </div>

//                     <p className="break-all font-mono text-xs font-semibold text-zinc-800 dark:text-zinc-200">
//                       {getQRValue()}
//                     </p>

//                   </div>

//                 </div>
//               )}

//               {/* ==================================================
//                   SMART SPACING
//               ================================================== */}

//               <div className="mt-6 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-cyan-50 p-4 dark:border-emerald-500/10 dark:from-emerald-500/5 dark:to-cyan-500/5">

//                 <div className="flex gap-3">

//                   <div className="mt-0.5">
//                     <CheckCircle2 className="h-4 w-4 text-emerald-600" />
//                   </div>

//                   <div>

//                     <p className="text-xs font-bold">
//                       Smart spacing enabled
//                     </p>

//                     <p className="mt-1 text-[11px] leading-5 text-zinc-500">
//                       Long attendee names automatically
//                       push the registration number and QR
//                       code down to maintain clean spacing.
//                     </p>

//                   </div>

//                 </div>

//               </div>

//             </div>

//             {/* ==================================================
//                 LIVE PREVIEW
//             ================================================== */}

//             <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-[0_15px_50px_-25px_rgba(0,0,0,0.25)] dark:border-zinc-800 dark:bg-zinc-900">

//               <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 sm:px-6 dark:border-zinc-800">

//                 <div>

//                   <h3 className="font-bold">
//                     Live badge preview
//                   </h3>

//                   <p className="mt-1 text-xs text-zinc-500">
//                     {selectedAttendee
//                       ? `Previewing ${
//                           selectedAttendee.name ||
//                           "attendee"
//                         }`
//                       : "Upload your files to begin"}
//                   </p>

//                 </div>

//                 <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 dark:border-emerald-500/20 dark:bg-emerald-500/10">

//                   <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />

//                   <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
//                     Live
//                   </span>

//                 </div>

//               </div>

//               {/* ATTENDEE SELECTOR */}

//               {attendees.length > 0 && (
//                 <div className="border-b border-zinc-100 px-5 py-4 sm:px-6 dark:border-zinc-800">

//                   <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
//                     Preview attendee
//                   </label>

//                   <div className="relative">

//                     <select
//                       value={
//                         selectedAttendeeIndex
//                       }
//                       onChange={(event) =>
//                         setSelectedAttendeeIndex(
//                           Number(
//                             event.target.value
//                           )
//                         )
//                       }
//                       className="w-full appearance-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 pr-10 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-zinc-700 dark:bg-zinc-800"
//                     >

//                       {attendees.map(
//                         (
//                           attendee,
//                           index
//                         ) => (
//                           <option
//                             key={
//                               attendee.id
//                             }
//                             value={index}
//                           >
//                             {attendee.name ||
//                               "Unnamed Attendee"}{" "}
//                             —{" "}
//                             {attendee.registrationNumber ||
//                               "No Reg No."}
//                           </option>
//                         )
//                       )}

//                     </select>

//                     <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

//                   </div>

//                 </div>
//               )}

//               {/* BADGE PREVIEW */}

//               <div className="min-h-[620px] bg-[radial-gradient(circle_at_center,_#ffffff_0%,_#f3f4f6_70%)] p-5 sm:p-8 dark:bg-[radial-gradient(circle_at_center,_#27272a_0%,_#18181b_70%)]">

//                 <BadgePreview
//                   attendee={
//                     selectedAttendee
//                   }
//                   configuration={
//                     configuration
//                   }
//                   badgeFile={
//                     badgeFile
//                   }
//                 />

//               </div>

//             </div>

//           </div>

//         </motion.section>

//         {/* ====================================================
//             STEP 03 - ATTENDEE DATA
//         ==================================================== */}

//         {attendees.length > 0 && (
//           <motion.section
//             initial={{
//               opacity: 0,
//               y: 15,
//             }}
//             animate={{
//               opacity: 1,
//               y: 0,
//             }}
//             transition={{
//               delay: 0.15,
//             }}
//             className="mb-8"
//           >

//             <SectionHeading
//               number="03"
//               icon={<Users />}
//               title="Imported attendees"
//               description={`${attendees.length} attendee${
//                 attendees.length ===
//                 1
//                   ? ""
//                   : "s"
//               } ready for badge generation.`}
//             />

//             <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

//               <AttendeeTable
//                 attendees={
//                   attendees
//                 }
//               />

//             </div>

//           </motion.section>
//         )}

//         {/* ====================================================
//             DOWNLOAD SECTION
//         ==================================================== */}

//         {attendees.length > 0 &&
//           badgeFile && (
//             <motion.section
//               initial={{
//                 opacity: 0,
//                 y: 15,
//               }}
//               animate={{
//                 opacity: 1,
//                 y: 0,
//               }}
//               transition={{
//                 delay: 0.2,
//               }}
//               className="mb-10"
//             >

//               <div className="relative overflow-hidden rounded-[28px] border border-emerald-200/60 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-6 shadow-[0_20px_60px_-30px_rgba(16,185,129,0.35)] sm:p-8 dark:border-emerald-500/10 dark:from-emerald-500/5 dark:via-zinc-900 dark:to-cyan-500/5">

//                 <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-emerald-300/20 blur-3xl" />

//                 <div className="relative">

//                   <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

//                     <div>

//                       <div className="mb-2 inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400">

//                         <Sparkles className="h-4 w-4" />

//                         <span className="text-[10px] font-bold uppercase tracking-widest">
//                           Ready to generate
//                         </span>

//                       </div>

//                       <h3 className="text-xl font-bold sm:text-2xl">
//                         Your badges are ready.
//                       </h3>

//                       <p className="mt-1 text-sm text-zinc-500">
//                         Generate individual PDFs or download
//                         all {attendees.length} badges as one ZIP.
//                       </p>

//                     </div>

//                     <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm sm:flex dark:bg-zinc-800">
//                       <QrCode className="h-6 w-6 text-emerald-500" />
//                     </div>

//                   </div>

//                   <DownloadBadges
//                     attendees={
//                       attendees
//                     }
//                     badgeFile={
//                       badgeFile
//                     }
//                     configuration={
//                       configuration
//                     }
//                   />

//                 </div>

//               </div>

//             </motion.section>
//           )}

//         {/* ====================================================
//             FOOTER
//         ==================================================== */}

//         <footer className="pb-6 text-center">

//           <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">

//             <ShieldCheck className="h-3.5 w-3.5" />

//             Your files are processed locally
//             in your browser.

//           </div>

//           <p className="mt-2 text-[10px] text-zinc-400">
//             BadgeFlow • Event Badge Generator
//           </p>

//         </footer>

//       </div>
//     </main>
//   );
// }

// /*
//  * ============================================================
//  * STAT CARD
//  * ============================================================
//  */

// function StatCard({
//   icon,
//   label,
//   value,
//   accent,
// }: {
//   icon: ReactNode;
//   label: string;
//   value: string | number;
//   accent:
//     | "emerald"
//     | "blue"
//     | "violet"
//     | "cyan";
// }) {
//   const styles = {
//     emerald:
//       "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",

//     blue:
//       "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",

//     violet:
//       "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",

//     cyan:
//       "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400",
//   };

//   return (
//     <motion.div
//       whileHover={{
//         y: -2,
//       }}
//       className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm transition dark:border-zinc-800 dark:bg-zinc-900 sm:p-5"
//     >

//       <div className="flex items-center gap-3">

//         <div
//           className={`rounded-xl p-2.5 ${styles[accent]}`}
//         >
//           <div className="h-4 w-4 [&>svg]:h-4 [&>svg]:w-4">
//             {icon}
//           </div>
//         </div>

//         <div className="min-w-0">

//           <p className="truncate text-[10px] font-bold uppercase tracking-wider text-zinc-400">
//             {label}
//           </p>

//           <p className="mt-0.5 truncate text-lg font-black sm:text-xl">
//             {value}
//           </p>

//         </div>

//       </div>

//     </motion.div>
//   );
// }

// /*
//  * ============================================================
//  * SECTION HEADING
//  * ============================================================
//  */

// function SectionHeading({
//   number,
//   icon,
//   title,
//   description,
// }: {
//   number: string;
//   icon: ReactNode;
//   title: string;
//   description: string;
// }) {
//   return (
//     <div className="mb-5 flex items-start gap-4">

//       <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-lg dark:bg-white dark:text-black">

//         <div className="h-4 w-4 [&>svg]:h-4 [&>svg]:w-4">
//           {icon}
//         </div>

//       </div>

//       <div>

//         <div className="flex items-center gap-2">

//           <span className="text-[10px] font-black tracking-widest text-emerald-500">
//             {number}
//           </span>

//           <h2 className="font-bold">
//             {title}
//           </h2>

//         </div>

//         <p className="mt-1 text-xs text-zinc-500">
//           {description}
//         </p>

//       </div>

//     </div>
//   );
// }

// /*
//  * ============================================================
//  * PREMIUM UPLOAD CARD
//  * ============================================================
//  */

// function PremiumUploadCard({
//   icon,
//   title,
//   description,
//   uploadedFile,
//   color,
//   children,
// }: {
//   icon: ReactNode;
//   title: string;
//   description: string;
//   uploadedFile: File | null;
//   color: "emerald" | "blue";
//   children: ReactNode;
// }) {
//   const colorClass =
//     color === "emerald"
//       ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
//       : "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400";

//   return (
//     <motion.div
//       whileHover={{
//         y: -2,
//       }}
//       className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-[0_15px_50px_-30px_rgba(0,0,0,0.3)] transition dark:border-zinc-800 dark:bg-zinc-900"
//     >

//       <div className="mb-4 flex items-center justify-between">

//         <div className="flex items-center gap-3">

//           <div
//             className={`rounded-xl p-2.5 ${colorClass}`}
//           >
//             <div className="h-5 w-5 [&>svg]:h-5 [&>svg]:w-5">
//               {icon}
//             </div>
//           </div>

//           <div>

//             <h3 className="text-sm font-bold">
//               {title}
//             </h3>

//             <p className="text-[11px] text-zinc-500">
//               {description}
//             </p>

//           </div>

//         </div>

//         {uploadedFile && (
//           <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
//             <Check className="h-3.5 w-3.5" />
//           </div>
//         )}

//       </div>

//       {children}

//     </motion.div>
//   );
// }

// /*
//  * ============================================================
//  * TOGGLE ROW
//  * ============================================================
//  */

// function ToggleRow({
//   label,
//   description,
//   checked,
//   onChange,
// }: {
//   label: string;
//   description: string;
//   checked: boolean;
//   onChange: (
//     value: boolean
//   ) => void;
// }) {
//   return (
//     <button
//       type="button"
//       onClick={() =>
//         onChange(!checked)
//       }
//       className="group flex w-full items-center justify-between rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50/40 dark:border-zinc-800 dark:bg-zinc-800/40 dark:hover:border-emerald-500/30 dark:hover:bg-emerald-500/5"
//     >

//       <div className="flex items-center gap-3">

//         <div
//           className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
//             checked
//               ? "bg-emerald-500 text-white"
//               : "bg-zinc-200 text-zinc-400 dark:bg-zinc-700"
//           }`}
//         >

//           {checked && (
//             <Check className="h-4 w-4" />
//           )}

//         </div>

//         <div>

//           <p className="text-sm font-semibold">
//             {label}
//           </p>

//           <p className="mt-0.5 text-[10px] text-zinc-500">
//             {description}
//           </p>

//         </div>

//       </div>

//       <div
//         className={`relative h-6 w-11 rounded-full transition ${
//           checked
//             ? "bg-emerald-500"
//             : "bg-zinc-300 dark:bg-zinc-700"
//         }`}
//       >

//         <div
//           className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
//             checked
//               ? "left-6"
//               : "left-1"
//           }`}
//         />

//       </div>

//     </button>
//   );
// }

import { redirect } from "next/navigation";

export default function Home() {
  redirect("/events");
}
