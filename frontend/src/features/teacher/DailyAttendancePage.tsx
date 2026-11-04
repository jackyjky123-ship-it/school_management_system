import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/axios";
import { ApiResponse } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  AttendanceRosterTable,
  AttendanceRow,
  AttendanceStatus,
} from "./components/AttendanceRosterTable";
import { toast } from "sonner";
import { Check, ClipboardCheck, Loader2, Calendar, AlertCircle } from "lucide-react";
import { toLocalDateInputValue } from "@/lib/date";

export const DailyAttendancePage: React.FC = () => {
  const queryClient = useQueryClient();
  const todayStr = toLocalDateInputValue();

  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [roster, setRoster] = useState<AttendanceRow[]>([]);

  // 1. Fetch Teacher's assigned homeroom classrooms
  const { data: dashboardData } = useQuery({
    queryKey: ["teacher-dashboard-stats"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<any>>("/dashboard/teacher");
      return res.data.data;
    },
  });

  const homeroomClassrooms = dashboardData?.assigned_classrooms || [];

  // Default to first classroom if not set
  useEffect(() => {
    if (!selectedClassroomId && homeroomClassrooms.length > 0) {
      setSelectedClassroomId(String(homeroomClassrooms[0].id));
    }
  }, [homeroomClassrooms, selectedClassroomId]);

  // 2. Fetch students through the classroom-scoped roster endpoint.
  // Teachers are not allowed to call the admin-only student directory.
  const {
    data: students = [],
    isLoading: loadingStudents,
    isError: studentsError,
  } = useQuery({
    queryKey: ["classroom-students", selectedClassroomId],
    enabled: !!selectedClassroomId,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<any[]>>(
        `/classrooms/${selectedClassroomId}/students`
      );
      return res.data.data;
    },
  });

  // 3. Fetch existing homeroom attendance for this date and class.
  // Subject-level records must not overwrite the homeroom status in this view.
  const {
    data: existingAttendance = [],
    isLoading: loadingAttendance,
    isError: attendanceError,
  } = useQuery({
    queryKey: ["classroom-attendance", selectedClassroomId, selectedDate],
    enabled: !!selectedClassroomId && !!selectedDate,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<any[]>>(
        `/attendances?classroom_id=${selectedClassroomId}&date=${selectedDate}&homeroom=1`
      );
      return res.data.data;
    },
  });

  // Merge students with existing attendance records
  useEffect(() => {
    // Clear stale rows when switching to an empty classroom.
    if (students.length === 0) {
      setRoster([]);
      return;
    }

    const attendanceMap = new Map<number, { status: AttendanceStatus; remarks: string }>();
    existingAttendance.forEach((att: any) => {
      attendanceMap.set(att.student_id, {
        status: att.status as AttendanceStatus,
        remarks: att.remarks || "",
      });
    });

    const rows: AttendanceRow[] = students.map((std: any) => {
      const existing = attendanceMap.get(std.id);
      return {
        student_id: std.id,
        student_code: std.student_code,
        name: std.name,
        status: existing ? existing.status : "present",
        remarks: existing ? existing.remarks : "",
      };
    });

    setRoster(rows);
  }, [students, existingAttendance]);

  const handleStatusChange = (studentId: number, status: AttendanceStatus) => {
    setRoster((prev) =>
      prev.map((r) => (r.student_id === studentId ? { ...r, status } : r))
    );
  };

  const handleRemarksChange = (studentId: number, remarks: string) => {
    setRoster((prev) =>
      prev.map((r) => (r.student_id === studentId ? { ...r, remarks } : r))
    );
  };

  const handleMarkAllPresent = () => {
    setRoster((prev) => prev.map((r) => ({ ...r, status: "present" })));
    toast.info("All students marked as Present");
  };

  // Submit Batch Attendance
  const submitMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        classroom_id: Number(selectedClassroomId),
        date: selectedDate,
        records: roster.map((r) => ({
          student_id: r.student_id,
          status: r.status,
          remarks: r.remarks || null,
        })),
      };
      return apiClient.post("/attendances/batch", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["classroom-attendance", selectedClassroomId, selectedDate],
      });
      queryClient.invalidateQueries({ queryKey: ["teacher-dashboard-stats"] });
      toast.success("Attendance roll call submitted successfully!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to submit attendance");
    },
  });

  // Counts
  const presentCount = roster.filter((r) => r.status === "present").length;
  const lateCount = roster.filter((r) => r.status === "late").length;
  const absentCount = roster.filter((r) => r.status === "absent").length;
  const excusedCount = roster.filter((r) => r.status === "excused").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Daily Attendance Roll Call
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Take morning attendance for your homeroom students with single-click actions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleMarkAllPresent}
            disabled={roster.length === 0}
          >
            <Check className="mr-1.5 h-4 w-4 text-emerald-600" />
            Mark All Present
          </Button>

          <Button
            onClick={() => submitMutation.mutate()}
            disabled={submitMutation.isPending || roster.length === 0}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Save Roll Call
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Selectors & Statistics Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <div className="space-y-1">
            <Label htmlFor="classroom" className="text-xs">
              Classroom Roster
            </Label>
            <select
              id="classroom"
              value={selectedClassroomId}
              onChange={(e) => setSelectedClassroomId(e.target.value)}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-800 dark:bg-slate-900"
            >
              {homeroomClassrooms.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.grade_level})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="date" className="text-xs">
              Roll Call Date
            </Label>
            <div className="relative">
              <Input
                id="date"
                type="date"
                value={selectedDate}
                max={todayStr}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-8.5 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Counter Badges & Status */}
        <div className="flex flex-wrap items-center gap-2">
          {existingAttendance.length > 0 ? (
            <Badge className="bg-emerald-600 text-white font-medium">
              Recorded
            </Badge>
          ) : (
            <Badge variant="secondary" className="font-medium text-slate-600 dark:text-slate-300">
              Not Recorded Yet
            </Badge>
          )}
          <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30">
            Present: {presentCount}
          </Badge>
          <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30">
            Late: {lateCount}
          </Badge>
          <Badge variant="outline" className="border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30">
            Absent: {absentCount}
          </Badge>
          <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30">
            Excused: {excusedCount}
          </Badge>
        </div>
      </div>

      {studentsError || attendanceError ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Unable to load this classroom roster. Please refresh the page or contact an administrator.</p>
        </div>
      ) : loadingStudents || loadingAttendance ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : roster.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-400">
          <Calendar className="mx-auto mb-2 h-10 w-10 opacity-30" />
          <p className="font-medium text-slate-600 dark:text-slate-300">No students enrolled in this classroom</p>
        </div>
      ) : (
        <AttendanceRosterTable
          roster={roster}
          onStatusChange={handleStatusChange}
          onRemarksChange={handleRemarksChange}
        />
      )}
    </div>
  );
};
