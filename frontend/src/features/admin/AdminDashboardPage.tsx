import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/axios";
import { ApiResponse } from "@/types/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Users,
  GraduationCap,
  School,
  BookOpen,
  CalendarCheck,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface AdminDashboardData {
  total_students: number;
  total_teachers: number;
  total_classrooms: number;
  total_subjects: number;
  today_attendance_rate: number;
  classroom_distribution: Array<{
    id: number;
    name: string;
    grade_level: string;
    students_count: number;
  }>;
}

export const AdminDashboardPage: React.FC = () => {
  const { data, isLoading, isError } = useQuery<AdminDashboardData>({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<AdminDashboardData>>("/dashboard/admin");
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
        <h3 className="font-semibold">Failed to load institutional metrics</h3>
        <p className="mt-1 text-sm">Please verify backend service and Neon database connectivity.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Administrative Command
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time overview of school academic performance and enrollment statistics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live PostgreSQL Neon Cluster
          </Badge>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200 shadow-xs dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-slate-500">
              Total Students
            </CardTitle>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <GraduationCap className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {data.total_students}
            </div>
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <span>Active enrollments</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-slate-500">
              Active Faculty
            </CardTitle>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {data.total_teachers}
            </div>
            <p className="mt-1 text-xs text-slate-500">Assigned across departments</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-slate-500">
              Classrooms
            </CardTitle>
            <div className="rounded-lg bg-purple-50 p-2 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
              <School className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {data.total_classrooms}
            </div>
            <p className="mt-1 text-xs text-slate-500">{data.total_subjects} active subjects</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-slate-500">
              Today's Attendance
            </CardTitle>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <CalendarCheck className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {data.today_attendance_rate}%
            </div>
            <p className="mt-1 text-xs text-slate-500">School-wide attendance rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Classroom Distribution Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border-slate-200 shadow-xs dark:border-slate-800 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Classroom Roster Distribution
            </CardTitle>
            <CardDescription>
              Student population density across active classrooms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.classroom_distribution.map((classroom) => {
                const percentage = data.total_students > 0 
                  ? Math.round((classroom.students_count / data.total_students) * 100)
                  : 0;
                return (
                  <div key={classroom.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {classroom.name}
                      </span>
                      <span className="text-slate-500">
                        {classroom.students_count} students ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Operations Guide */}
        <Card className="border-slate-200 shadow-xs dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
            <CardDescription>Direct navigation to administrative workflows</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/admin/students" className="block">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-indigo-600" />
                  Manage Students
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Button>
            </Link>

            <Link to="/admin/teachers" className="block">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  Manage Faculty
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Button>
            </Link>

            <Link to="/admin/classrooms" className="block">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <School className="h-4 w-4 text-purple-600" />
                  Manage Classrooms
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Button>
            </Link>

            <Link to="/admin/subjects" className="block">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-amber-600" />
                  Course Catalog
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
