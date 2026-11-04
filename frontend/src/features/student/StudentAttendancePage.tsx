import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/axios";
import { ApiResponse } from "@/types/auth";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldAlert,
  AlertCircle,
} from "lucide-react";
import { formatDateOnly } from "@/lib/date";

interface AttendanceRecord {
  id: number;
  date: string;
  status: "present" | "late" | "absent" | "excused";
  subject_name?: string | null;
  remarks?: string;
  recorded_by_name?: string;
}

export const StudentAttendancePage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>("");

  const {
    data: attendanceList = [],
    isLoading,
    isError,
  } = useQuery<AttendanceRecord[]>({
    queryKey: ["student-full-attendance"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<AttendanceRecord[]>>("/attendances");
      return res.data.data;
    },
  });

  const filteredList = statusFilter
    ? attendanceList.filter((a) => a.status === statusFilter)
    : attendanceList;

  const totalSessions = attendanceList.length;
  const presentCount = attendanceList.filter(
    (a) => a.status === "present" || a.status === "late"
  ).length;
  const absentCount = attendanceList.filter((a) => a.status === "absent").length;
  const attendanceRate =
    totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 100;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return (
          <Badge className="bg-emerald-600 text-white font-medium">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Present
          </Badge>
        );
      case "late":
        return (
          <Badge className="bg-amber-500 text-white font-medium">
            <Clock className="mr-1 h-3 w-3" />
            Late
          </Badge>
        );
      case "absent":
        return (
          <Badge variant="destructive" className="font-medium">
            <XCircle className="mr-1 h-3 w-3" />
            Absent
          </Badge>
        );
      case "excused":
        return (
          <Badge variant="secondary" className="font-medium">
            <ShieldAlert className="mr-1 h-3 w-3 text-blue-500" />
            Excused
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Attendance Log & History
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Daily roll call records verified by homeroom educators
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <option value="">All Statuses</option>
          <option value="present">Present Only</option>
          <option value="late">Late Only</option>
          <option value="absent">Absent Only</option>
          <option value="excused">Excused Only</option>
        </select>
      </div>

      {isError && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Unable to load your attendance history. Please check your connection and refresh the page.</p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-slate-200 shadow-xs dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-medium">Attendance Rate</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {attendanceRate}%
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-slate-200 shadow-xs dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-medium">Sessions Attended</CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {presentCount} / {totalSessions} Days
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-slate-200 shadow-xs dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-medium">Unexcused Absences</CardDescription>
            <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
              {absentCount} Days
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Attendance History Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-3">Calendar Date</th>
                <th className="px-4 py-3">Recorded Status</th>
                <th className="px-4 py-3">Remarks / Reason</th>
                <th className="px-4 py-3">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center">
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-400">
                    <CalendarCheck className="mx-auto mb-2 h-10 w-10 opacity-30" />
                    <p className="font-medium text-slate-600 dark:text-slate-300">No attendance entries match this filter</p>
                  </td>
                </tr>
              ) : (
                filteredList.map((record) => {
                  const formattedDate = formatDateOnly(record.date, {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <tr
                      key={record.id}
                      className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                        {formattedDate}
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(record.status)}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {record.remarks || <span className="text-slate-300 italic">None</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {record.recorded_by_name || "Faculty"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
