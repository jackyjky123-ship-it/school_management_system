import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/axios";
import { ApiResponse } from "@/types/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  School,
  ClipboardCheck,
  Award,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

interface TeacherDashboardData {
  today_roll_call_completed: boolean;
  assigned_classrooms: Array<{
    id: number;
    name: string;
    grade_level: string;
    students_count: number;
  }>;
  assigned_subjects: Array<{
    id: number;
    name: string;
    code: string;
    classroom_name: string;
  }>;
  recent_grades: Array<{
    id: number;
    student_name: string;
    student_code: string;
    subject_name: string;
    term: string;
    exam_type: string;
    score: number;
    max_score: number;
    letter_grade: string;
  }>;
}

export const TeacherDashboardPage: React.FC = () => {
  const { data, isLoading, isError, refetch } = useQuery<TeacherDashboardData>({
    queryKey: ["teacher-dashboard-stats"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<TeacherDashboardData>>("/dashboard/teacher");
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-6 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
        <div>
          <h3 className="font-semibold text-sm">Failed to load teacher dashboard</h3>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Please check your network and try refreshing.</p>
        </div>
        <Button
          variant="outline"
          size="xs"
          onClick={() => refetch()}
          className="gap-1.5 border-rose-300 text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/40"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Roll-Call Status Banner */}
      <div
        className={`rounded-xl border p-5 shadow-xs transition-colors ${
          data.today_roll_call_completed
            ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/30"
            : "border-amber-200 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/30"
        }`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div
              className={`rounded-lg p-2.5 ${
                data.today_roll_call_completed
                  ? "bg-emerald-600 text-white"
                  : "bg-amber-600 text-white"
              }`}
            >
              {data.today_roll_call_completed ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {data.today_roll_call_completed
                    ? "Today's Attendance Recorded"
                    : "Daily Roll Call Pending"}
                </h2>
                <Badge
                  className={
                    data.today_roll_call_completed
                      ? "bg-emerald-600 text-white font-semibold text-[10px] uppercase"
                      : "bg-amber-600 text-white font-semibold text-[10px] uppercase"
                  }
                >
                  {data.today_roll_call_completed ? "Completed" : "Action Required"}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                {data.today_roll_call_completed
                  ? "All homeroom student attendance logs for today have been officially recorded."
                  : "You have not yet submitted today's daily homeroom attendance roll call."}
              </p>
            </div>
          </div>

          <Link
            to="/teacher/attendance"
            className={cn(
              buttonVariants({ size: "sm" }),
              "shrink-0 font-medium text-xs",
              data.today_roll_call_completed
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-amber-600 hover:bg-amber-700 text-white"
            )}
          >
            <ClipboardCheck className="mr-1.5 h-4 w-4" />
            {data.today_roll_call_completed ? "Review Roster" : "Open Roll Call"}
          </Link>
        </div>
      </div>

      {/* Main Grid: Academic Courses & Recent Evaluations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Assigned Subjects & Homeroom Classes */}
        <Card className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Assigned Courses & Homerooms</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Active instructional roster for current term
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                Course Catalog
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {data.assigned_subjects.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/40"
                  >
                    <div>
                      <p className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                        {sub.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                        {sub.classroom_name} • {sub.code}
                      </p>
                    </div>
                    <Link
                      to="/teacher/grades"
                      className={cn(buttonVariants({ variant: "ghost", size: "icon-xs" }), "text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40")}
                      title="Grade Subject"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {data.assigned_classrooms.length > 0 && (
              <div className="pt-2">
                <div className="mb-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Homeroom Designation
                </div>
                <div className="space-y-2">
                  {data.assigned_classrooms.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200/80 bg-indigo-50/40 p-3 dark:border-indigo-950/50 dark:bg-indigo-950/20"
                    >
                      <div className="flex items-center gap-2.5">
                        <School className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        <div>
                          <p className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                            {c.name}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{c.grade_level}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-indigo-200 bg-white text-indigo-700 dark:border-indigo-800 dark:bg-slate-900 dark:text-indigo-300 text-[11px] tabular-nums">
                        {c.students_count} Students
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Grading Ledger */}
        <Card className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Recent Grades</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Recently submitted assessments and exam marks
              </CardDescription>
            </div>
            <Link
              to="/teacher/grades"
              className={cn(buttonVariants({ variant: "ghost", size: "xs" }), "text-xs text-indigo-600 dark:text-indigo-400")}
            >
              Gradebook
            </Link>
          </CardHeader>
          <CardContent>
            {data.recent_grades.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <Award className="mx-auto mb-2 h-8 w-8 opacity-30 text-slate-500" />
                <p className="text-xs text-slate-500">No grades recorded yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.recent_grades.map((grade) => (
                  <div key={grade.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {grade.student_name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                        {grade.subject_name} • {grade.exam_type} ({grade.term})
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-mono text-xs font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                        {grade.score}/{grade.max_score} ({grade.letter_grade})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
