"use client";

import { Attendee } from "@/types/badge";

interface AttendeeTableProps {
  attendees: Attendee[];
}

export default function AttendeeTable({ attendees }: AttendeeTableProps) {
  if (!attendees.length) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 p-5 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-zinc-900 dark:text-white">
              Attendee List
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              {attendees.length} attendee
              {attendees.length === 1 ? "" : "s"} loaded
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-900">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Registration No.</th>
              <th className="px-5 py-3">Code</th>
              <th className="px-5 py-3">Category</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {attendees.slice(0, 10).map((attendee) => (
              <tr key={attendee.id}>
                <td className="px-5 py-4 font-medium text-zinc-900 dark:text-white">
                  {attendee.name || "—"}
                </td>

                <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400">
                  {attendee.registrationNumber || "—"}
                </td>

                <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400">
                  {attendee.code || "—"}
                </td>

                <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400">
                  {attendee.category || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {attendees.length > 10 && (
        <div className="border-t border-zinc-200 px-5 py-3 text-xs text-zinc-500 dark:border-zinc-800">
          Showing first 10 attendees.
        </div>
      )}
    </div>
  );
}
