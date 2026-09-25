import Link from "next/link";
import { ArrowLeft, CalendarDays, ChevronRight, QrCode } from "lucide-react";

import BadgeGenerator from "@/components/BadgeGenerator";

type EventPageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export default async function EventPage({ params }: EventPageProps) {
  const { eventId } = await params;

  /*
   * Convert the event ID into a readable event name.
   *
   * Example:
   * rsacpcon-2026
   * →
   * Rsacpcon 2026
   */
  const eventName = eventId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f6f8fb] text-zinc-950 dark:bg-[#09090b] dark:text-white">
      {/* ======================================================
          EVENT HEADER
      ======================================================= */}

      <header className="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/85 backdrop-blur-xl dark:border-zinc-800/70 dark:bg-zinc-950/85">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          {/* BACK TO EVENTS */}

          <Link
            href="/events"
            className="group inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-600 shadow-sm transition-all duration-200 hover:-translate-x-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-emerald-500/30 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />

            <span className="hidden sm:inline">Back to Events</span>

            <span className="sm:hidden">Events</span>
          </Link>

          {/* EVENT INFORMATION */}

          <div className="flex min-w-0 items-center gap-3">
            {/* ICON */}

            <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 text-white shadow-lg shadow-emerald-500/20 sm:flex">
              <QrCode className="h-5 w-5" />
            </div>

            {/* NAME */}

            <div className="min-w-0 text-right sm:text-left">
              <div className="flex items-center justify-end gap-2 sm:justify-start">
                <p className="truncate text-sm font-black tracking-tight text-zinc-900 dark:text-white sm:text-base">
                  {eventName}
                </p>

                <span className="hidden rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700 sm:inline-flex dark:bg-emerald-500/10 dark:text-emerald-400">
                  Active
                </span>
              </div>

              <p className="mt-0.5 flex items-center justify-end gap-1 text-[10px] text-zinc-500 sm:justify-start dark:text-zinc-400">
                <CalendarDays className="h-3 w-3" />
                Event Badge Workspace
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ======================================================
          EVENT WORKSPACE INTRO
      ======================================================= */}

      <section className="border-b border-zinc-200/70 bg-white dark:border-zinc-800/70 dark:bg-zinc-950">
        <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* LEFT */}

            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                <QrCode className="h-3.5 w-3.5" />
                Badge Generator
              </div>

              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                {eventName}
              </h1>

              <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-500 sm:text-sm dark:text-zinc-400">
                Upload your badge template and attendee data, configure the QR
                code and generate personalized event badges.
              </p>
            </div>

            {/* EVENT ID */}

            <div className="shrink-0 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                Event ID
              </p>

              <div className="mt-1 flex items-center gap-2">
                <span className="max-w-[240px] truncate font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {eventId}
                </span>

                <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          BADGE GENERATOR
      ======================================================= */}

      <section className="relative">
        {/* Background decoration */}

        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-32 top-40 h-96 w-96 rounded-full bg-emerald-300/10 blur-3xl dark:bg-emerald-500/5" />

          <div className="absolute right-0 top-72 h-96 w-96 rounded-full bg-cyan-300/10 blur-3xl dark:bg-cyan-500/5" />
        </div>

        {/* Existing Badge Generator */}

        <BadgeGenerator />
      </section>
    </main>
  );
}
