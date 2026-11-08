import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/axios";
import { ApiResponse } from "@/types/auth";
import { Schedule } from "@/types/academic";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  School,
  BookOpen,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

const DAYS_ORDER: Array<{ key: string; label: string }> = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

export const StudentSchedulePage: React.FC = () => {
  const [selectedTerm, setSelectedTerm] = useState<string>("Semester 1");

  const currentDayKey = new Date()
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();

  const {
    data: schedules = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Schedule[]>({
    queryKey: ["student-schedule", selectedTerm],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Schedule[]>>(
        `/schedules?term=${selectedTerm}`
      );
      return res.data.data;
    },
  });

  const totalSlots = schedules.length;
  const classroomName = schedules[0]?.classroom_name || "My Classroom";
  const gradeLevel = schedules[0]?.grade_level || "";
  const todaySlots = schedules.filter((s) => s.day_of_week === currentDayKey);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            My Learning Timetable
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Daily class routine, course timings, instructor details, and classroom assignments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 bg-white p-1 text-xs dark:border-slate-800 dark:bg-slate-900 shadow-xs">
            <button
              onClick={() => setSelectedTerm("Semester 1")}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                selectedTerm === "Semester 1"
                  ? "bg-indigo-600 text-white font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Semester 1
            </button>
            <button
              onClick={() => setSelectedTerm("Semester 2")}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                selectedTerm === "Semester 2"
                  ? "bg-indigo-600 text-white font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Semester 2
            </button>
          </div>
        </div>
      </div>

      {/* KPI Statistic Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Assigned Classroom
            </CardTitle>
            <School className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {classroomName}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {gradeLevel ? `${gradeLevel} Homeroom` : "Official Class"}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Weekly Learning Periods
            </CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {totalSlots}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Active class hours scheduled</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Today's Schedule
            </CardTitle>
            <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {todaySlots.length}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 capitalize">{currentDayKey} classes</p>
          </CardContent>
        </Card>
      </div>

      {isError && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>Unable to load learning timetable. Please retry.</p>
          </div>
          <Button
            variant="outline"
            size="xs"
            onClick={() => refetch()}
            className="self-start sm:self-auto gap-1 border-rose-300 text-rose-700 hover:bg-rose-100"
          >
            <RotateCcw className="h-3 w-3" /> Retry
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : schedules.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-12 text-center text-slate-400">
          <Calendar className="mx-auto mb-2 h-10 w-10 opacity-30 text-slate-500" />
          <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
            No class timetable published for {selectedTerm}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Your classroom schedule will appear here once finalized by school administration.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DAYS_ORDER.map(({ key, label }) => {
            const daySchedules = schedules.filter((s) => s.day_of_week === key);
            const isToday = key === currentDayKey;

            return (
              <Card
                key={key}
                className={`border transition-all shadow-xs ${
                  isToday
                    ? "border-indigo-400 bg-indigo-50/20 dark:border-indigo-600 dark:bg-indigo-950/20"
                    : "border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900"
                }`}
              >
                <CardHeader className="py-2.5 px-4 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      {label}
                    </CardTitle>
                    {isToday && (
                      <Badge className="bg-indigo-600 text-white text-[9px] px-1.5 py-0">
                        Today
                      </Badge>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {daySchedules.length} {daySchedules.length === 1 ? "class" : "classes"}
                  </Badge>
                </CardHeader>
                <CardContent className="p-3 space-y-3">
                  {daySchedules.length === 0 ? (
                    <p className="py-5 text-center text-[11px] text-slate-400">
                      No classes scheduled
                    </p>
                  ) : (
                    daySchedules.map((slot) => (
                      <div
                        key={slot.id}
                        className="rounded-lg border border-slate-200/90 bg-white p-3 hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-850 transition-all shadow-2xs space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                              {slot.subject_name || "Homeroom Advisory"}
                            </div>
                            {slot.subject_code && (
                              <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400">
                                {slot.subject_code}
                              </span>
                            )}
                          </div>
                          {slot.room && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-mono shrink-0">
                              {slot.room}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                          <span className="flex items-center gap-1 font-mono font-medium text-slate-600 dark:text-slate-300">
                            <Clock className="h-3 w-3 text-slate-400" />
                            {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <Avatar className="h-5 w-5 text-[9px]">
                              <AvatarFallback className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                {slot.teacher_name ? slot.teacher_name.substring(0, 2).toUpperCase() : "T"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                              {slot.teacher_name}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
