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
    { value: "present", label: "Present", activeClass: "bg-emerald-600 text-white border-emerald-600 shadow-xs" },
    { value: "late", label: "Late", activeClass: "bg-amber-500 text-white border-amber-500 shadow-xs" },
    { value: "absent", label: "Absent", activeClass: "bg-red-600 text-white border-red-600 shadow-xs" },
    { value: "excused", label: "Excused", activeClass: "bg-blue-600 text-white border-blue-600 shadow-xs" },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Attendance Status</th>
              <th className="px-4 py-3">Remarks / Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {roster.map((row) => (
              <tr key={row.student_id} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                <td className="px-4 py-3 font-mono font-medium text-slate-500 dark:text-slate-400">
                  {row.student_code}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                  {row.name}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {statusOptions.map((opt) => {
                      const isActive = row.status === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => onStatusChange(row.student_id, opt.value)}
                          className={cn(
                            "cursor-pointer rounded-md border px-2.5 py-1 text-xs font-semibold transition-all",
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
                    placeholder="Optional note (e.g. sick leave, excused by parent)..."
                    value={row.remarks}
                    onChange={(e) => onRemarksChange(row.student_id, e.target.value)}
                    className="h-8 text-xs"
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
