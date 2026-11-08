import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/axios";
import { ApiResponse } from "@/types/auth";
import { GpaCard } from "./components/GpaCard";
import { AttendanceGauge } from "./components/AttendanceGauge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BookOpen, Award, ArrowRight, UserCheck, RotateCcw } from "lucide-react";

interface StudentDashboardData {
  gpa: number;
  average_percentage: number;
  letter_grade: string;
  attendance_rate: number;
  total_attendance_days: number;
  total_present_days: number;
  recent_grades: Array<{
    id: number;
    subject_name: string;
    subject_code: string;
    term: string;
    exam_type: string;
    score: number;
    max_score: number;
    percentage: number;
    letter_grade: string;
  }>;
  enrolled_subjects: Array<{
    id: number;
    name: string;
    code: string;
    teacher_name?: string;
  }>;
}

export const StudentDashboardPage: React.FC = () => {
  const { data, isLoading, isError, refetch } = useQuery<StudentDashboardData>({
    queryKey: ["student-dashboard-stats"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<StudentDashboardData>>("/dashboard/student");
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
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
          <h3 className="font-semibold text-sm">Unable to load student metrics</h3>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Please verify your connection and try refreshing.</p>
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
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          Academic Standing & Overview
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Personalized dashboard tracking continuous GPA, examination results, and attendance records
        </p>
      </div>

      {/* Top Hero Cards: GPA & Attendance */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <GpaCard
          gpa={data.gpa}
          averagePercentage={data.average_percentage}
          letterGrade={data.letter_grade}
        />
        <AttendanceGauge
          attendanceRate={data.attendance_rate}
          totalDays={data.total_attendance_days}
          presentDays={data.total_present_days}
        />
      </div>

      {/* Two Columns: Recent Grades & Enrolled Subjects */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Grades */}
        <Card className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Recent Evaluations</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Published examination results and quiz scores
              </CardDescription>
            </div>
            <Link
              to="/student/report-card"
              className={cn(buttonVariants({ variant: "ghost", size: "xs" }), "text-xs text-indigo-600 dark:text-indigo-400")}
            >
              Full Transcript
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </CardHeader>

          <CardContent>
            {data.recent_grades.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                <Award className="mx-auto mb-2 h-8 w-8 opacity-30 text-slate-500" />
                <p className="text-xs text-slate-500">No exam evaluations recorded yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.recent_grades.map((grade) => (
                  <div key={grade.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                        {grade.subject_name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                        {grade.term} • {grade.exam_type}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                          {grade.score}
                        </span>
                        <span className="text-[11px] text-slate-400 tabular-nums"> / {grade.max_score}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          grade.letter_grade === "A"
                            ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold font-mono text-xs"
                            : grade.letter_grade === "B"
                            ? "border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300 font-bold font-mono text-xs"
                            : grade.letter_grade === "C"
                            ? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 font-bold font-mono text-xs"
                            : grade.letter_grade === "D"
                            ? "border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-300 font-bold font-mono text-xs"
                            : grade.letter_grade === "F"
                            ? "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 font-bold font-mono text-xs"
                            : "border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold font-mono text-xs"
                        }
                      >
                        {grade.letter_grade}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enrolled Courses */}
        <Card className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Enrolled Course Curriculum</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Current registered subjects and faculty instructors
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 font-normal text-xs tabular-nums">
              {data.enrolled_subjects.length} Courses
            </Badge>
          </CardHeader>

          <CardContent>
            {data.enrolled_subjects.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                <BookOpen className="mx-auto mb-2 h-8 w-8 opacity-30 text-slate-500" />
                <p className="text-xs text-slate-500">No course enrollments found</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.enrolled_subjects.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-semibold text-xs text-slate-900 dark:text-slate-100">{sub.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Code: {sub.code}</p>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <UserCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>{sub.teacher_name || "Faculty Unassigned"}</span>
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
