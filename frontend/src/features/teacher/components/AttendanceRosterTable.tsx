import React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type AttendanceStatus = "present" | "late" | "absent" | "excused";

export interface AttendanceRow {
  student_id: number;
  student_code: string;
  name: string;
  status: AttendanceStatus;
  remarks: string;
}

interface AttendanceRosterTableProps {
  roster: AttendanceRow[];
  onStatusChange: (studentId: number, status: AttendanceStatus) => void;
  onRemarksChange: (studentId: number, remarks: string) => void;
}

export const AttendanceRosterTable: React.FC<AttendanceRosterTableProps> = ({
  roster,
  onStatusChange,
  onRemarksChange,
}) => {
  const statusOptions: Array<{ value: AttendanceStatus; label: string; activeClass: string }> = [
    { value: "present", label: "Present", activeClass: "bg-emerald-600 text-white border-emerald-600" },
    { value: "late", label: "Late", activeClass: "bg-amber-600 text-white border-amber-600" },
    { value: "absent", label: "Absent", activeClass: "bg-rose-600 text-white border-rose-600" },
    { value: "excused", label: "Excused", activeClass: "bg-blue-600 text-white border-blue-600" },
  ];

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50/90 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Student Name</th>
              <th className="px-4 py-3">Attendance Status</th>
              <th className="px-4 py-3">Remarks / Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {roster.map((row) => (
              <tr key={row.student_id} className="transition-colors hover:bg-slate-50/75 dark:hover:bg-slate-800/40">
                <td className="px-4 py-3">
                  <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                    {row.student_code}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 font-semibold text-[11px] text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                      {getInitials(row.name)}
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {row.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {statusOptions.map((opt) => {
                      const isActive = row.status === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => onStatusChange(row.student_id, opt.value)}
                          className={cn(
                            "cursor-pointer rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors",
                            isActive
                              ? opt.activeClass
                              : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                          )}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Input
                    placeholder="Optional note (e.g. excused absence)..."
                    value={row.remarks}
                    onChange={(e) => onRemarksChange(row.student_id, e.target.value)}
                    className="h-8 text-xs bg-slate-50/50 dark:bg-slate-950/40"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
