import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/axios";
import { ApiResponse } from "@/types/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldAlert,
  AlertCircle,
  RotateCcw,
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
    refetch,
  } = useQuery<AttendanceRecord[]>({
    queryKey: ["student-full-attendance"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<AttendanceRecord[]>>("/attendances?homeroom=1");
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
    totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return (
          <Badge className="bg-emerald-600 text-white font-medium text-xs px-2 py-0.5">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Present
          </Badge>
        );
      case "late":
        return (
          <Badge className="bg-amber-600 text-white font-medium text-xs px-2 py-0.5">
            <Clock className="mr-1 h-3 w-3" />
            Late
          </Badge>
        );
      case "absent":
        return (
          <Badge className="bg-rose-600 text-white font-medium text-xs px-2 py-0.5">
            <XCircle className="mr-1 h-3 w-3" />
            Absent
          </Badge>
        );
      case "excused":
        return (
          <Badge className="bg-blue-600 text-white font-medium text-xs px-2 py-0.5">
            <ShieldAlert className="mr-1 h-3 w-3" />
            Excused
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Attendance Log & History
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Daily roll call records verified by homeroom educators
          </p>
        </div>

        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="present">Present Only</SelectItem>
              <SelectItem value="late">Late Only</SelectItem>
              <SelectItem value="absent">Absent Only</SelectItem>
              <SelectItem value="excused">Excused Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isError && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>Unable to load your attendance history. Please check your connection and retry.</p>
          </div>
          <Button
            variant="outline"
            size="xs"
            onClick={() => refetch()}
            className="self-start sm:self-auto gap-1 border-rose-300 text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/40"
          >
            <RotateCcw className="h-3 w-3" />
            Retry
          </Button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <CardContent className="pt-4 pb-4">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Overall Attendance Rate
            </div>
            <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {attendanceRate}%
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <CardContent className="pt-4 pb-4">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Sessions Attended
            </div>
            <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {presentCount} / {totalSessions} Days
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <CardContent className="pt-4 pb-4">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Unexcused Absences
            </div>
            <div className="mt-1 text-2xl font-bold text-rose-600 dark:text-rose-400 tabular-nums">
              {absentCount} Days
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance History Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Calendar Date</TableHead>
              <TableHead>Recorded Status</TableHead>
              <TableHead>Remarks / Reason</TableHead>
              <TableHead>Recorded By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="p-8 text-center">
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="p-12 text-center text-slate-400">
                  <CalendarCheck className="mx-auto mb-2 h-10 w-10 opacity-30 text-slate-500" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                    {statusFilter
                      ? "No attendance entries match this filter"
                      : "No attendance entries recorded yet"}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredList.map((record) => {
                const formattedDate = formatDateOnly(record.date, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
                return (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium text-slate-900 dark:text-slate-100 tabular-nums">
                      {formattedDate}
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {record.remarks || <span className="text-slate-400 italic">Official Roll Call</span>}
                    </TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400">
                      {record.recorded_by_name || "Homeroom Teacher"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
