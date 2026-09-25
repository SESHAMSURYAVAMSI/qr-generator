"use client";

import {
  CalendarDays,
  ChevronRight,
  Clock3,
  MapPin,
  Plus,
  QrCode,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import LogoutButton from "@/components/LogoutButton";

type EventItem = {
  id: string;
  name: string;
  code: string;
  date: string;
  location: string;
  description: string;
  attendees: number;
  status: "Active" | "Draft";
};

const INITIAL_EVENTS: EventItem[] = [
  {
    id: "rsacpcon-2026",
    name: "RSACPCON 2026",
    code: "RSACPCON26",
    date: "24 July 2026",
    location: "Hyderabad",
    description:
      "RSACPCON 2026 conference badge management workspace.",
    attendees: 0,
    status: "Active",
  },
  {
    id: "acvs-india-2026",
    name: "ACVS INDIA 2026",
    code: "ACVS26",
    date: "2026",
    location: "India",
    description:
      "ACVS INDIA 2026 event badge management workspace.",
    attendees: 0,
    status: "Active",
  },
];

export default function EventsPage() {
  const [events, setEvents] =
    useState<EventItem[]>(INITIAL_EVENTS);

  const [search, setSearch] = useState("");

  const [showCreateForm, setShowCreateForm] =
    useState(false);

  const [eventName, setEventName] = useState("");
  const [eventCode, setEventCode] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] =
    useState("");

  const filteredEvents = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return events;
    }

    return events.filter((event) => {
      return (
        event.name
          .toLowerCase()
          .includes(query) ||
        event.code
          .toLowerCase()
          .includes(query) ||
        event.location
          .toLowerCase()
          .includes(query)
      );
    });
  }, [events, search]);

  const resetForm = () => {
    setEventName("");
    setEventCode("");
    setEventDate("");
    setLocation("");
    setDescription("");
  };

  const handleCreateEvent = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!eventName.trim()) {
      return;
    }

    const newEvent: EventItem = {
      id: `${eventName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,

      name: eventName.trim(),

      code:
        eventCode.trim() ||
        eventName
          .trim()
          .toUpperCase()
          .replace(/[^A-Z0-9]+/g, "-"),

      date: eventDate
        ? new Date(
            `${eventDate}T00:00:00`
          ).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "Date not set",

      location:
        location.trim() || "Location not set",

      description:
        description.trim() ||
        "Event badge management workspace.",

      attendees: 0,
      status: "Draft",
    };

    setEvents((previous) => [
      newEvent,
      ...previous,
    ]);

    resetForm();
    setShowCreateForm(false);
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f6f8fb] text-zinc-950 dark:bg-[#09090b] dark:text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-300/20 blur-3xl dark:bg-emerald-500/10" />

        <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-cyan-300/20 blur-3xl dark:bg-cyan-500/10" />

        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-violet-300/10 blur-3xl dark:bg-violet-500/10" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/80 backdrop-blur-xl dark:border-zinc-800/70 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 text-white shadow-lg shadow-emerald-500/20">
              <QrCode className="h-5 w-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight sm:text-base">
                  BadgeFlow
                </h1>

                <span className="hidden rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700 sm:inline-flex dark:bg-emerald-500/10 dark:text-emerald-400">
                  PRO
                </span>
              </div>

              <p className="text-[11px] text-zinc-500">
                Event Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-600 shadow-sm sm:flex dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
              Secure workspace
            </div>

            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="relative z-10 mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Hero */}
        <section className="mb-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                <CalendarDays className="h-3.5 w-3.5" />
                Event workspace
              </div>

              <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Manage your events
                <span className="block bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
                  in one place.
                </span>
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500 sm:text-base dark:text-zinc-400">
                Create an event, open its badge
                workspace and generate personalized
                badges with unique QR codes.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowCreateForm(true)
              }
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-5 text-sm font-bold text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-emerald-600 dark:bg-white dark:text-black dark:hover:bg-emerald-400"
            >
              <Plus className="h-4 w-4" />
              Create Event
            </button>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon={<CalendarDays />}
            label="Total Events"
            value={events.length}
          />

          <StatCard
            icon={<Sparkles />}
            label="Active Events"
            value={
              events.filter(
                (event) =>
                  event.status === "Active"
              ).length
            }
          />

          <StatCard
            icon={<Users />}
            label="Attendees"
            value={events.reduce(
              (total, event) =>
                total + event.attendees,
              0
            )}
          />

          <StatCard
            icon={<QrCode />}
            label="Badge System"
            value="Ready"
          />
        </section>

        {/* Search */}
        <section className="mb-6">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search events, event codes or locations..."
              className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm outline-none shadow-sm transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-zinc-800 dark:bg-zinc-900"
            />
          </div>
        </section>

        {/* Event List */}
        {filteredEvents.length > 0 ? (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
              />
            ))}
          </section>
        ) : (
          <section className="rounded-3xl border border-dashed border-zinc-300 bg-white px-6 py-20 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
              <CalendarDays className="h-6 w-6 text-zinc-400" />
            </div>

            <h3 className="mt-5 text-lg font-bold">
              No events found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
              Try another search or create a new
              event to get started.
            </p>
          </section>
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div
            className="w-full max-w-2xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl sm:p-8 dark:border-zinc-800 dark:bg-zinc-950"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-event-title"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <Plus className="h-5 w-5" />
                </div>

                <h3
                  id="create-event-title"
                  className="text-xl font-black"
                >
                  Create new event
                </h3>

                <p className="mt-1 text-sm text-zinc-500">
                  Set up the basic event details.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowCreateForm(false);
                }}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
              >
                Close
              </button>
            </div>

            <form
              onSubmit={handleCreateEvent}
              className="space-y-5"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  label="Event Name"
                  value={eventName}
                  onChange={setEventName}
                  placeholder="Example: RSACPCON 2026"
                  required
                />

                <FormField
                  label="Event Code"
                  value={eventCode}
                  onChange={setEventCode}
                  placeholder="Example: RSACPCON26"
                />

                <div>
                  <label className="mb-2 block text-xs font-bold">
                    Event Date
                  </label>

                  <input
                    type="date"
                    value={eventDate}
                    onChange={(event) =>
                      setEventDate(
                        event.target.value
                      )
                    }
                    className="h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-zinc-800 dark:bg-zinc-900"
                  />
                </div>

                <FormField
                  label="Location"
                  value={location}
                  onChange={setLocation}
                  placeholder="Example: Hyderabad"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder="Describe the event..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-zinc-800 dark:bg-zinc-900"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowCreateForm(false);
                  }}
                  className="h-11 rounded-xl border border-zinc-200 px-5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-bold text-white transition hover:bg-emerald-600 dark:bg-white dark:text-black dark:hover:bg-emerald-400"
                >
                  <Plus className="h-4 w-4" />
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

/* ============================================================
   EVENT CARD
============================================================ */

function EventCard({
  event,
}: {
  event: EventItem;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-[0_15px_50px_-30px_rgba(0,0,0,0.3)] transition duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-500/30">
      <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-emerald-300/10 blur-3xl transition group-hover:bg-emerald-300/20" />

      <div className="relative">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 text-white shadow-lg shadow-emerald-500/20">
            <QrCode className="h-5 w-5" />
          </div>

          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
              event.status === "Active"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
            }`}
          >
            {event.status}
          </span>
        </div>

        <h3 className="text-lg font-black tracking-tight">
          {event.name}
        </h3>

        <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          {event.code}
        </p>

        <p className="mt-3 min-h-[40px] text-xs leading-5 text-zinc-500">
          {event.description}
        </p>

        <div className="mt-5 space-y-2.5 border-t border-zinc-100 pt-5 dark:border-zinc-800">
          <InfoRow
            icon={<CalendarDays />}
            value={event.date}
          />

          <InfoRow
            icon={<MapPin />}
            value={event.location}
          />

          <InfoRow
            icon={<Users />}
            value={`${event.attendees} attendees`}
          />
        </div>

        <Link
          href={`/events/${event.id}`}
          className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 text-sm font-bold text-white transition group-hover:bg-emerald-600 dark:bg-white dark:text-black dark:group-hover:bg-emerald-400"
        >
          Open Event
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

/* ============================================================
   INFO ROW
============================================================ */

function InfoRow({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5 text-xs text-zinc-500">
      <div className="text-emerald-500 [&>svg]:h-3.5 [&>svg]:w-3.5">
        {icon}
      </div>

      <span>{value}</span>
    </div>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
          <div className="[&>svg]:h-4 [&>svg]:w-4">
            {icon}
          </div>
        </div>

        <div className="min-w-0">
          <p className="truncate text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            {label}
          </p>

          <p className="mt-0.5 truncate text-lg font-black sm:text-xl">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   FORM FIELD
============================================================ */

function FormField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold">
        {label}
      </label>

      <input
        type="text"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        required={required}
        className="h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-zinc-800 dark:bg-zinc-900"
      />
    </div>
  );
}