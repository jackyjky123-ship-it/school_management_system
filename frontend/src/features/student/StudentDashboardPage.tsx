import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/axios";
import { ApiResponse } from "@/types/auth";
import { GpaCard } from "./components/GpaCard";
import { AttendanceGauge } from "./components/AttendanceGauge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { BookOpen, Award, ArrowRight, UserCheck } from "lucide-react";

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
  const { data, isLoading, isError } = useQuery<StudentDashboardData>({
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
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
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
        <h3 className="font-semibold">Unable to load student metrics</h3>
        <p className="mt-1 text-sm">Please verify your connection and refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Academic Standing & Report Card
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
        <Card className="border-slate-200 shadow-xs dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Recent Evaluations</CardTitle>
              <CardDescription>Published examination results and quiz scores</CardDescription>
            </div>
            <Link to="/student/report-card">
              <Button variant="ghost" size="xs">
                Full Report
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>

          <CardContent>
            {data.recent_grades.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                <Award className="mx-auto mb-2 h-8 w-8 opacity-30" />
                <p className="text-xs">No exam evaluations recorded yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.recent_grades.map((grade) => (
                  <div key={grade.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {grade.subject_name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {grade.term} • {grade.exam_type}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200">
                          {grade.score}
                        </span>
                        <span className="text-xs text-slate-400"> / {grade.max_score}</span>
                      </div>
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
        <Card className="border-slate-200 shadow-xs dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Enrolled Course Curriculum</CardTitle>
              <CardDescription>Current registered subjects and faculty instructors</CardDescription>
            </div>
            <Badge variant="outline" className="font-normal text-xs">
              {data.enrolled_subjects.length} Courses
            </Badge>
          </CardHeader>

          <CardContent>
            {data.enrolled_subjects.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                <BookOpen className="mx-auto mb-2 h-8 w-8 opacity-30" />
                <p className="text-xs">No course enrollments found</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.enrolled_subjects.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{sub.name}</p>
                      <p className="text-xs text-slate-400">Course Code: {sub.code}</p>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <UserCheck className="h-3.5 w-3.5 text-indigo-500" />
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
