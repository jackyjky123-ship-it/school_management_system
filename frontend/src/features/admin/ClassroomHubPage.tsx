import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/axios";
import { ApiResponse } from "@/types/auth";
import { ClassroomHubData, AttendanceHistoryItem, Schedule } from "@/types/academic";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { ScheduleDialog } from "./components/ScheduleDialog";
import { toast } from "sonner";
import {
  ArrowLeft,
  GraduationCap,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  CalendarCheck,
  UserCheck,
  RotateCcw,
} from "lucide-react";

type HubTab = "roster" | "subjects" | "schedule" | "attendance";

const DAYS_ORDER: Array<{ key: string; label: string }> = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

export const ClassroomHubPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<HubTab>("roster");
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  // Fetch Hub Data
  const {
    data: hub,
    isLoading,
    isError,
    refetch,
  } = useQuery<ClassroomHubData>({
    queryKey: ["classroom-hub", id],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<ClassroomHubData>>(`/admin/classrooms/${id}/hub`);
      return res.data.data;
    },
    enabled: !!id,
  });

  // Fetch Attendance History for Tab 4
  const { data: attendanceHistory = [], isLoading: historyLoading } = useQuery<AttendanceHistoryItem[]>({
    queryKey: ["classroom-attendance-history", id],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<{ items: AttendanceHistoryItem[] }>>(
        `/admin/classrooms/${id}/attendance-history`
      );
      return res.data.data.items;
    },
    enabled: !!id && activeTab === "attendance",
  });

  // Fetch teachers for schedule dialog
  const { data: teachers = [] } = useQuery<Array<{ id: number; name: string }>>({
    queryKey: ["admin-teachers-list"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<any[]>>("/admin/teachers");
      return res.data.data.map((t) => ({ id: t.id, name: t.name }));
    },
  });

  // Delete Schedule Slot Mutation
  const deleteScheduleMutation = useMutation({
    mutationFn: async (scheduleId: number) => {
      return apiClient.delete(`/admin/schedules/${scheduleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classroom-hub", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-schedules"] });
      toast.success("Schedule slot removed");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to remove schedule slot");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !hub) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
        <AlertCircle className="mx-auto mb-3 h-8 w-8 text-rose-500" />
        <h3 className="font-semibold text-lg">Unable to load Classroom Hub</h3>
        <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
          The classroom may not exist or database is currently unavailable.
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Link to="/admin/classrooms">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Classrooms
            </Button>
          </Link>
          <Button variant="default" size="sm" onClick={() => refetch()}>
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  const { classroom, counts, students, subjects, schedules, attendance_stats } = hub;

  const attendanceRate = attendance_stats.attendance_rate;
  const rateVariant =
    attendanceRate >= 90 ? "success" : attendanceRate >= 75 ? "warning" : "destructive";

  return (
    <div className="space-y-6">
      {/* Top Navigation & Classroom Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Link
              to="/admin/classrooms"
              className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="h-3 w-3" /> Classrooms
            </Link>
            <span>/</span>
            <span>Classroom Hub</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {classroom.name}
            </h1>
            <Badge variant="outline" className="font-medium text-xs">
              {classroom.grade_level}
            </Badge>
            <Badge variant="secondary" className="font-medium text-xs">
              AY {classroom.academic_year}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Homeroom Advisor:{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {classroom.homeroom_teacher?.name || "Unassigned"}
            </span>
            {classroom.homeroom_teacher?.specialization && (
              <span className="text-slate-400"> ({classroom.homeroom_teacher.specialization})</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditingSchedule(null);
              setScheduleDialogOpen(true);
            }}
            className="gap-1.5 text-xs h-8"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Timetable Slot
          </Button>
          <Link to={`/teacher/attendance?classroom_id=${classroom.id}`}>
            <Button size="sm" className="gap-1.5 text-xs h-8 bg-indigo-600 hover:bg-indigo-700 text-white">
              <CalendarCheck className="h-3.5 w-3.5" />
              Take Roll Call
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Statistic Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Enrolled Students
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {counts.students}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Registered roster</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Active Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {counts.subjects}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Assigned subjects</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Timetable Slots
            </CardTitle>
            <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {counts.schedules}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Weekly schedule periods</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Attendance Performance
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {attendanceRate}%
              </span>
              <Badge variant={rateVariant as any} className="text-[10px] uppercase font-bold">
                {rateVariant}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {attendance_stats.present_count} present • {attendance_stats.absent_count} absent •{" "}
              {attendance_stats.late_count} late
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Navigation Header */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab("roster")}
          className={`pb-3 text-xs font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === "roster"
              ? "border-indigo-600 text-indigo-600 font-semibold dark:border-indigo-400 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          Student Roster ({students.length})
        </button>

        <button
          onClick={() => setActiveTab("subjects")}
          className={`pb-3 text-xs font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === "subjects"
              ? "border-indigo-600 text-indigo-600 font-semibold dark:border-indigo-400 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Courses & Teachers ({subjects.length})
        </button>

        <button
          onClick={() => setActiveTab("schedule")}
          className={`pb-3 text-xs font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === "schedule"
              ? "border-indigo-600 text-indigo-600 font-semibold dark:border-indigo-400 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Calendar className="h-4 w-4" />
          Weekly Timetable ({schedules.length})
        </button>

        <button
          onClick={() => setActiveTab("attendance")}
          className={`pb-3 text-xs font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === "attendance"
              ? "border-indigo-600 text-indigo-600 font-semibold dark:border-indigo-400 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <UserCheck className="h-4 w-4" />
          Attendance Records ({attendance_stats.total_sessions_recorded} Sessions)
        </button>
      </div>

      {/* Tab 1: Student Roster */}
      {activeTab === "roster" && (
        <Card className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Classroom Student Roster
              </CardTitle>
              <p className="text-xs text-slate-500">
                All students currently registered in {classroom.name}.
              </p>
            </div>
            <Link to="/admin/students">
              <Button variant="outline" size="xs" className="h-8 gap-1 text-xs">
                Manage Students
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {students.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No students enrolled in this classroom yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Student Code</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Email Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((st, idx) => (
                      <TableRow key={st.id}>
                        <TableCell className="text-xs text-slate-400 tabular-nums">{idx + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-7 w-7 text-[11px]">
                              <AvatarFallback>{st.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-xs text-slate-900 dark:text-slate-100">
                              {st.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-300">
                          {st.student_code}
                        </TableCell>
                        <TableCell className="capitalize text-xs text-slate-600 dark:text-slate-300">
                          {st.gender || "—"}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">{st.email}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Courses & Teachers */}
      {activeTab === "subjects" && (
        <Card className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Course Curriculum & Instructors
              </CardTitle>
              <p className="text-xs text-slate-500">
                Subjects taught in {classroom.name} alongside assigned faculty.
              </p>
            </div>
            <Link to="/admin/subjects">
              <Button variant="outline" size="xs" className="h-8 gap-1 text-xs">
                Manage Subjects
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {subjects.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No courses assigned to this classroom yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course Code</TableHead>
                      <TableHead>Course Name</TableHead>
                      <TableHead>Assigned Instructor</TableHead>
                      <TableHead>Instructor Email</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-mono font-medium text-xs text-indigo-600 dark:text-indigo-400">
                          {sub.code}
                        </TableCell>
                        <TableCell className="font-medium text-xs text-slate-900 dark:text-slate-100">
                          {sub.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6 text-[10px]">
                              <AvatarFallback>
                                {sub.teacher?.name ? sub.teacher.name.substring(0, 2).toUpperCase() : "NA"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                              {sub.teacher?.name || "Unassigned"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {sub.teacher?.email || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            to={`/teacher/attendance?classroom_id=${classroom.id}&subject_id=${sub.id}`}
                          >
                            <Button variant="ghost" size="xs" className="h-7 text-xs gap-1 text-indigo-600 hover:text-indigo-700">
                              <CalendarCheck className="h-3.5 w-3.5" />
                              Roll Call
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Weekly Timetable Schedule */}
      {activeTab === "schedule" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Weekly Class Routine
              </h3>
              <p className="text-xs text-slate-500">
                Daily time slots, course sessions, and classroom assignments.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setEditingSchedule(null);
                setScheduleDialogOpen(true);
              }}
              className="gap-1.5 text-xs h-8"
            >
              <Plus className="h-3.5 w-3.5" /> Add Slot
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DAYS_ORDER.map(({ key, label }) => {
              const daySchedules = schedules.filter((s) => s.day_of_week === key);

              return (
                <Card
                  key={key}
                  className="border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs"
                >
                  <CardHeader className="py-2.5 px-4 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      {label}
                    </CardTitle>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {daySchedules.length} {daySchedules.length === 1 ? "period" : "periods"}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-3 space-y-2.5">
                    {daySchedules.length === 0 ? (
                      <p className="py-4 text-center text-[11px] text-slate-400">
                        No scheduled classes
                      </p>
                    ) : (
                      daySchedules.map((slot) => (
                        <div
                          key={slot.id}
                          className="group relative rounded-lg border border-slate-200/80 bg-slate-50/60 p-2.5 hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-800/40 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                                {slot.subject_name || "Homeroom Advisory"}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                {slot.teacher_name}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => {
                                  setEditingSchedule(slot);
                                  setScheduleDialogOpen(true);
                                }}
                                className="h-6 w-6 text-slate-500 hover:text-slate-900"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => {
                                  if (confirm("Remove this timetable slot?")) {
                                    deleteScheduleMutation.mutate(slot.id);
                                  }
                                }}
                                className="h-6 w-6 text-slate-500 hover:text-rose-600"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                            <span className="flex items-center gap-1 font-mono font-medium">
                              <Clock className="h-3 w-3 text-slate-400" />
                              {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                            </span>
                            {slot.room && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                                {slot.room}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Attendance Records & History */}
      {activeTab === "attendance" && (
        <Card className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Daily Roll Call History
              </CardTitle>
              <p className="text-xs text-slate-500">
                Aggregated records of daily subject and homeroom roll call sessions.
              </p>
            </div>
            <Link to={`/teacher/attendance?classroom_id=${classroom.id}`}>
              <Button size="xs" className="h-8 gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                <Plus className="h-3.5 w-3.5" /> Take New Roll Call
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {historyLoading ? (
              <div className="p-8 space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : attendanceHistory.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No attendance sessions recorded for this classroom yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Course / Session</TableHead>
                      <TableHead className="text-center">Present</TableHead>
                      <TableHead className="text-center">Late</TableHead>
                      <TableHead className="text-center">Absent</TableHead>
                      <TableHead className="text-center">Excused</TableHead>
                      <TableHead className="text-center">Turnout Rate</TableHead>
                      <TableHead>Recorded By</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceHistory.map((item, idx) => {
                      const rate = item.attendance_rate;
                      const badgeVariant =
                        rate >= 90 ? "success" : rate >= 75 ? "warning" : "destructive";

                      return (
                        <TableRow key={`${item.date}-${item.subject_id}-${idx}`}>
                          <TableCell className="font-mono text-xs font-medium text-slate-900 dark:text-slate-100">
                            {item.date}
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                              {item.subject_name}
                            </span>
                            {item.subject_code && (
                              <span className="text-[11px] text-slate-400 ml-1">
                                ({item.subject_code})
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-center font-mono text-xs text-emerald-600 font-semibold">
                            {item.present_count}
                          </TableCell>
                          <TableCell className="text-center font-mono text-xs text-amber-600 font-semibold">
                            {item.late_count}
                          </TableCell>
                          <TableCell className="text-center font-mono text-xs text-rose-600 font-semibold">
                            {item.absent_count}
                          </TableCell>
                          <TableCell className="text-center font-mono text-xs text-slate-500">
                            {item.excused_count}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={badgeVariant as any} className="text-[10px] font-bold">
                              {rate}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-slate-500">
                            {item.recorded_by_name}
                          </TableCell>
                          <TableCell className="text-right">
                            <Link
                              to={`/teacher/attendance?classroom_id=${classroom.id}${
                                item.subject_id ? `&subject_id=${item.subject_id}` : ""
                              }&date=${item.date}`}
                            >
                              <Button variant="ghost" size="xs" className="h-7 text-xs text-indigo-600">
                                View / Edit
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Schedule Dialog for Add/Edit */}
      <ScheduleDialog
        isOpen={scheduleDialogOpen}
        onClose={() => setScheduleDialogOpen(false)}
        classroomId={classroom.id}
        scheduleToEdit={editingSchedule}
        subjects={subjects}
        teachers={teachers}
      />
    </div>
  );
};
