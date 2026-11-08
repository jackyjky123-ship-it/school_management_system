import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/axios";
import { ApiResponse } from "@/types/auth";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  AttendanceRosterTable,
  AttendanceRow,
  AttendanceStatus,
} from "./components/AttendanceRosterTable";
import { toast } from "sonner";
import {
  Check,
  X,
  ClipboardCheck,
  Loader2,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { toLocalDateInputValue } from "@/lib/date";

export const DailyAttendancePage: React.FC = () => {
  const queryClient = useQueryClient();
  const { role } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const paramClassroomId = searchParams.get("classroom_id") || "";
  const paramSubjectId = searchParams.get("subject_id") || "";
  const paramScheduleId = searchParams.get("schedule_id") || "";
  const paramDate = searchParams.get("date") || "";

  const todayStr = toLocalDateInputValue();

  const [selectedClassroomId, setSelectedClassroomId] = useState<string>(paramClassroomId);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(paramSubjectId ? paramSubjectId : "homeroom");
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>(paramScheduleId);
  const [selectedDate, setSelectedDate] = useState<string>(paramDate || todayStr);
  const [roster, setRoster] = useState<AttendanceRow[]>([]);

  // 1. Fetch Classrooms available to this user
  // For Teacher: fetch dashboard data (homeroom classes + subject classes)
  const { data: teacherDashboard } = useQuery({
    queryKey: ["teacher-dashboard-stats"],
    enabled: role === "teacher",
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<any>>("/dashboard/teacher");
      return res.data.data;
    },
  });

  // For Admin: fetch all classrooms
  const { data: adminClassrooms = [] } = useQuery({
    queryKey: ["admin-classrooms"],
    enabled: role === "admin",
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<any[]>>("/admin/classrooms");
      return res.data.data;
    },
  });

  // Combined selectable classrooms
  const availableClassrooms = useMemo(() => {
    if (role === "admin") {
      return adminClassrooms.map((c: any) => ({
        id: c.id,
        name: c.name,
        grade_level: c.grade_level,
      }));
    }

    if (!teacherDashboard) return [];

    const list: Array<{ id: number; name: string; grade_level: string }> = [];
    const seen = new Set<number>();

    (teacherDashboard.assigned_classrooms || []).forEach((c: any) => {
      if (!seen.has(c.id)) {
        seen.add(c.id);
        list.push({ id: c.id, name: c.name, grade_level: c.grade_level });
      }
    });

    (teacherDashboard.assigned_subjects || []).forEach((s: any) => {
      if (s.classroom_id && !seen.has(s.classroom_id)) {
        seen.add(s.classroom_id);
        list.push({
          id: s.classroom_id,
          name: s.classroom_name || `Classroom #${s.classroom_id}`,
          grade_level: "",
        });
      }
    });

    return list;
  }, [role, adminClassrooms, teacherDashboard]);

  // Set default classroom if not in search params
  useEffect(() => {
    if (!selectedClassroomId && availableClassrooms.length > 0) {
      setSelectedClassroomId(String(availableClassrooms[0].id));
    }
  }, [availableClassrooms, selectedClassroomId]);

  // 2. Fetch Subjects taught in the selected classroom
  const { data: classroomSubjects = [] } = useQuery({
    queryKey: ["classroom-subjects", selectedClassroomId],
    enabled: !!selectedClassroomId,
    queryFn: async () => {
      // If admin or teacher, query subjects for this classroom
      const res = await apiClient.get<ApiResponse<any[]>>("/admin/subjects");
      return res.data.data.filter((s) => String(s.classroom_id) === selectedClassroomId);
    },
  });

  // Keep searchParams synchronized
  useEffect(() => {
    const params: Record<string, string> = {};
    if (selectedClassroomId) params.classroom_id = selectedClassroomId;
    if (selectedSubjectId && selectedSubjectId !== "homeroom") params.subject_id = selectedSubjectId;
    if (selectedScheduleId) params.schedule_id = selectedScheduleId;
    if (selectedDate) params.date = selectedDate;
    setSearchParams(params, { replace: true });
  }, [selectedClassroomId, selectedSubjectId, selectedScheduleId, selectedDate, setSearchParams]);

  // 3. Fetch students roster for the selected classroom
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

  // 4. Fetch existing attendance for this session (classroom + date + subject/homeroom)
  const isHomeroom = selectedSubjectId === "homeroom" || !selectedSubjectId;
  const {
    data: existingAttendance = [],
    isLoading: loadingAttendance,
    isError: attendanceError,
  } = useQuery({
    queryKey: [
      "attendance-records",
      selectedClassroomId,
      selectedDate,
      selectedSubjectId,
    ],
    enabled: !!selectedClassroomId && !!selectedDate,
    queryFn: async () => {
      const url = isHomeroom
        ? `/attendances?classroom_id=${selectedClassroomId}&date=${selectedDate}&homeroom=1`
        : `/attendances?classroom_id=${selectedClassroomId}&date=${selectedDate}&subject_id=${selectedSubjectId}`;

      const res = await apiClient.get<ApiResponse<any[]>>(url);
      return res.data.data;
    },
  });

  // Merge students with existing attendance records
  useEffect(() => {
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

  const handleMarkAllAbsent = () => {
    setRoster((prev) => prev.map((r) => ({ ...r, status: "absent" })));
    toast.info("All students marked as Absent");
  };

  // Submit Batch Attendance
  const submitMutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, any> = {
        classroom_id: Number(selectedClassroomId),
        date: selectedDate,
        records: roster.map((r) => ({
          student_id: r.student_id,
          status: r.status,
          remarks: r.remarks || null,
        })),
      };

      if (!isHomeroom && selectedSubjectId) {
        payload.subject_id = Number(selectedSubjectId);
      }
      if (selectedScheduleId) {
        payload.schedule_id = Number(selectedScheduleId);
      }

      return apiClient.post("/attendances/batch", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "attendance-records",
          selectedClassroomId,
          selectedDate,
          selectedSubjectId,
        ],
      });
      queryClient.invalidateQueries({ queryKey: ["teacher-dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["classroom-hub"] });
      queryClient.invalidateQueries({ queryKey: ["classroom-attendance-history"] });
      toast.success("Attendance roll call recorded successfully");
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message || "Failed to record attendance roll call"
      );
    },
  });

  // Calculate live statistics from roster
  const totalCount = roster.length;
  const presentCount = roster.filter((r) => r.status === "present").length;
  const lateCount = roster.filter((r) => r.status === "late").length;
  const absentCount = roster.filter((r) => r.status === "absent").length;
  const excusedCount = roster.filter((r) => r.status === "excused").length;
  const attendanceRate = totalCount > 0 ? Math.round(((presentCount + lateCount) / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Streamlined Daily Roll Call
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Fast 1-click roll call for daily course sessions and homeroom advisory
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllPresent}
            disabled={roster.length === 0}
            className="text-xs h-9 border-slate-200 dark:border-slate-800"
          >
            <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
            Mark All Present
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAbsent}
            disabled={roster.length === 0}
            className="text-xs h-9 border-slate-200 dark:border-slate-800 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
          >
            <X className="mr-1.5 h-3.5 w-3.5" />
            Mark All Absent
          </Button>

          <Button
            size="sm"
            onClick={() => submitMutation.mutate()}
            disabled={submitMutation.isPending || roster.length === 0}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs h-9"
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <ClipboardCheck className="mr-1.5 h-3.5 w-3.5" />
                Save Roll Call
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-1">
          <Label htmlFor="classroom" className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Classroom Roster
          </Label>
          <Select value={selectedClassroomId} onValueChange={setSelectedClassroomId}>
            <SelectTrigger id="classroom" className="h-8 text-xs">
              <SelectValue placeholder="Select classroom..." />
            </SelectTrigger>
            <SelectContent>
              {availableClassrooms.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name} {c.grade_level ? `(${c.grade_level})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="course_session" className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Course / Subject Session
          </Label>
          <Select
            value={selectedSubjectId}
            onValueChange={(val) => {
              setSelectedSubjectId(val);
              setSelectedScheduleId("");
            }}
          >
            <SelectTrigger id="course_session" className="h-8 text-xs">
              <SelectValue placeholder="Select course..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="homeroom">
                Homeroom / Advisory Period
              </SelectItem>
              {classroomSubjects.map((sub: any) => (
                <SelectItem key={sub.id} value={String(sub.id)}>
                  {sub.code} • {sub.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="date" className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Roll Call Date
          </Label>
          <Input
            id="date"
            type="date"
            value={selectedDate}
            max={todayStr}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-8 text-xs font-mono"
          />
        </div>
      </div>

      {/* Counter Badges & Live Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 text-xs dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center gap-2">
          {existingAttendance.length > 0 ? (
            <Badge className="bg-emerald-600 text-white font-medium text-xs">
              Recorded in Database
            </Badge>
          ) : (
            <Badge variant="outline" className="border-slate-300 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 font-medium text-xs">
              Not Yet Recorded
            </Badge>
          )}

          <span className="text-slate-500 font-medium">
            Turnout Rate:{" "}
            <strong className="text-slate-900 dark:text-slate-100 font-bold tabular-nums">
              {attendanceRate}%
            </strong>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 tabular-nums text-xs">
            Present: {presentCount}
          </Badge>
          <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 tabular-nums text-xs">
            Late: {lateCount}
          </Badge>
          <Badge variant="outline" className="border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 tabular-nums text-xs">
            Absent: {absentCount}
          </Badge>
          <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300 tabular-nums text-xs">
            Excused: {excusedCount}
          </Badge>
        </div>
      </div>

      {studentsError || attendanceError ? (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Unable to load classroom roster. Please refresh or verify permissions.</p>
        </div>
      ) : loadingStudents || loadingAttendance ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : roster.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-12 text-center text-slate-400">
          <Calendar className="mx-auto mb-2 h-10 w-10 opacity-30 text-slate-500" />
          <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
            {availableClassrooms.length === 0
              ? "You do not have any classrooms or courses assigned."
              : "No students enrolled in this classroom"}
          </p>
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
