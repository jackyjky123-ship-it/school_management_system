import React from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Check, Clock, X, Info } from "lucide-react";

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
  const statusOptions: Array<{
    value: AttendanceStatus;
    label: string;
    icon: React.ElementType;
    activeClass: string;
    baseClass: string;
  }> = [
    {
      value: "present",
      label: "Present",
      icon: Check,
      activeClass: "bg-emerald-600 text-white border-emerald-600 shadow-xs",
      baseClass: "hover:border-emerald-300 hover:text-emerald-700 dark:hover:text-emerald-400",
    },
    {
      value: "late",
      label: "Late",
      icon: Clock,
      activeClass: "bg-amber-600 text-white border-amber-600 shadow-xs",
      baseClass: "hover:border-amber-300 hover:text-amber-700 dark:hover:text-amber-400",
    },
    {
      value: "absent",
      label: "Absent",
      icon: X,
      activeClass: "bg-rose-600 text-white border-rose-600 shadow-xs",
      baseClass: "hover:border-rose-300 hover:text-rose-700 dark:hover:text-rose-400",
    },
    {
      value: "excused",
      label: "Excused",
      icon: Info,
      activeClass: "bg-blue-600 text-white border-blue-600 shadow-xs",
      baseClass: "hover:border-blue-300 hover:text-blue-700 dark:hover:text-blue-400",
    },
  ];

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead className="w-32">Student Code</TableHead>
            <TableHead>Student Name</TableHead>
            <TableHead className="min-w-[280px]">Attendance Status</TableHead>
            <TableHead className="min-w-[200px]">Remarks / Note</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roster.map((row, idx) => (
            <TableRow key={row.student_id}>
              <TableCell className="text-xs text-slate-400 tabular-nums">
                {idx + 1}
              </TableCell>
              <TableCell>
                <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                  {row.student_code}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <Avatar size="sm">
                    <AvatarFallback className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                      {getInitials(row.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                    {row.name}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap items-center gap-1.5">
                  {statusOptions.map((opt) => {
                    const isActive = row.status === opt.value;
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => onStatusChange(row.student_id, opt.value)}
                        className={cn(
                          "inline-flex items-center gap-1 cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all select-none",
                          isActive
                            ? opt.activeClass
                            : cn(
                                "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400",
                                opt.baseClass
                              )
                        )}
                      >
                        <Icon className="h-3 w-3 shrink-0" />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </TableCell>
              <TableCell>
                <Input
                  value={row.remarks}
                  onChange={(e) => onRemarksChange(row.student_id, e.target.value)}
                  placeholder="Optional notes, illness, tardy reason..."
                  className="h-8 text-xs bg-transparent dark:bg-slate-800/40"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
