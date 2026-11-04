import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/axios";
import { ApiResponse } from "@/types/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import {
  School,
  ClipboardCheck,
  Award,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
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
  const { data, isLoading, isError } = useQuery<TeacherDashboardData>({
    queryKey: ["teacher-dashboard-stats"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<TeacherDashboardData>>("/dashboard/teacher");
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
        <h3 className="font-semibold">Failed to load teacher dashboard</h3>
        <p className="mt-1 text-sm">Please check your network and try refreshing.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Roll-Call Status Banner */}
      <div
        className={`rounded-2xl border p-6 shadow-xs transition-all ${
          data.today_roll_call_completed
            ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20"
            : "border-amber-200 bg-amber-50/60 dark:border-amber-900/50 dark:bg-amber-950/20"
        }`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={`rounded-xl p-3 ${
                data.today_roll_call_completed
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
              }`}
            >
              {data.today_roll_call_completed ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <AlertCircle className="h-6 w-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {data.today_roll_call_completed
                    ? "Today's Attendance Recorded"
                    : "Daily Roll Call Pending"}
                </h2>
                <Badge
                  variant={data.today_roll_call_completed ? "default" : "destructive"}
                  className="uppercase text-[10px]"
                >
                  {data.today_roll_call_completed ? "Completed" : "Action Required"}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {data.today_roll_call_completed
                  ? "All homeroom student attendance logs for today have been submitted."
                  : "You have not yet submitted attendance roll call for your homeroom classroom today."}
              </p>
            </div>
          </div>

          <Link to="/teacher/attendance">
            <Button
              className={
                data.today_roll_call_completed
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20"
              }
            >
              <ClipboardCheck className="mr-2 h-4 w-4" />
              {data.today_roll_call_completed ? "Review Attendance" : "Take Today's Roll Call"}
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Assigned Teaching Schedule */}
        <Card className="border-slate-200 shadow-xs dark:border-slate-800 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Assigned Teaching Schedule</CardTitle>
            <CardDescription>Courses and homeroom classrooms under your instruction</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Courses Under Instruction
              </h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {data.assigned_subjects.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 dark:border-slate-800"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {sub.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        Class: {sub.classroom_name} • Code: {sub.code}
                      </p>
                    </div>
                    <Link to="/teacher/grades">
                      <Button variant="ghost" size="xs">
                        Grade
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {data.assigned_classrooms.length > 0 && (
              <div className="pt-2">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Homeroom Responsibilities
                </h4>
                <div className="space-y-2">
                  {data.assigned_classrooms.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-xl bg-indigo-50/50 p-3 dark:bg-indigo-950/20"
                    >
                      <div className="flex items-center gap-2.5">
                        <School className="h-5 w-5 text-indigo-600" />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {c.name}
                          </p>
                          <p className="text-xs text-slate-500">{c.grade_level}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{c.students_count} Students</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Grading Ledger */}
        <Card className="border-slate-200 shadow-xs dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Recent Grades</CardTitle>
              <CardDescription>Recently recorded student evaluations</CardDescription>
            </div>
            <Link to="/teacher/grades">
              <Button variant="ghost" size="xs">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {data.recent_grades.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <Award className="mx-auto mb-2 h-8 w-8 opacity-30" />
                <p className="text-xs">No grades recorded yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.recent_grades.map((grade) => (
                  <div key={grade.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {grade.student_name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {grade.subject_name} • {grade.exam_type}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          grade.letter_grade === "A"
                            ? "default"
                            : grade.letter_grade === "B"
                            ? "secondary"
                            : "outline"
                        }
                        className="font-bold font-mono"
                      >
                        {grade.score} ({grade.letter_grade})
                      </Badge>
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
