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
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
        <h3 className="font-semibold text-base">Failed to load institutional metrics</h3>
        <p className="mt-1 text-sm text-rose-700 dark:text-rose-300">
          Please verify backend service and Neon database connectivity.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Administrative Command
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time institutional metrics, faculty allocation, and classroom enrollment distribution
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs px-2.5 py-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Neon Cluster
          </Badge>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Enrolled Students
            </span>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <GraduationCap className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
              {data.total_students}
            </div>
            <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <TrendingUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              <span>Active student profiles</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Active Faculty
            </span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
              {data.total_teachers}
            </div>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              Assigned across departments
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Active Classrooms
            </span>
            <div className="rounded-lg bg-purple-50 p-2 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <School className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
              {data.total_classrooms}
            </div>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {data.total_subjects} active courses
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Daily Attendance Rate
            </span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CalendarCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
              {data.today_attendance_rate}%
            </div>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              School-wide present rate today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Classroom Distribution Breakdown & Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Classroom Roster Distribution
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
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
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {classroom.name}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 tabular-nums text-xs">
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
        <Card className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Direct access to school management directories
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <Link to="/admin/students" className="block">
              <Button variant="outline" className="w-full justify-between h-10 border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200">
                <span className="flex items-center gap-2 text-xs font-semibold">
                  <GraduationCap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  Manage Students
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </Button>
            </Link>

            <Link to="/admin/teachers" className="block">
              <Button variant="outline" className="w-full justify-between h-10 border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200">
                <span className="flex items-center gap-2 text-xs font-semibold">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Manage Faculty
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </Button>
            </Link>

            <Link to="/admin/classrooms" className="block">
              <Button variant="outline" className="w-full justify-between h-10 border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200">
                <span className="flex items-center gap-2 text-xs font-semibold">
                  <School className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  Manage Classrooms
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </Button>
            </Link>

            <Link to="/admin/subjects" className="block">
              <Button variant="outline" className="w-full justify-between h-10 border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200">
                <span className="flex items-center gap-2 text-xs font-semibold">
                  <BookOpen className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  Course Catalog
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
