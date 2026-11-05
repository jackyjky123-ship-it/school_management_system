import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/axios";
import { ApiResponse } from "@/types/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Filter, AlertCircle, RotateCcw, Printer, ChevronDown } from "lucide-react";

interface GradeItem {
  id: number;
  subject_name: string;
  subject_code: string;
  term: string;
  exam_type: string;
  score: number;
  max_score: number;
  percentage: number;
  letter_grade: string;
  remarks?: string;
  graded_by_name?: string;
}

export const StudentReportCardPage: React.FC = () => {
  const [termFilter, setTermFilter] = useState<string>("");

  const {
    data: grades = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<GradeItem[]>({
    queryKey: ["student-full-grades"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<GradeItem[]>>("/grades");
      return res.data.data;
    },
  });

  const filteredGrades = termFilter
    ? grades.filter((g) => g.term === termFilter)
    : grades;

  // Compute summary
  const totalCount = filteredGrades.length;
  const avgPercentage =
    totalCount > 0
      ? Math.round(
          filteredGrades.reduce((sum, g) => sum + g.percentage, 0) / totalCount
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Academic Report Card
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Comprehensive transcript of term assessments, examinations, and instructor evaluations
          </p>
        </div>

        {/* Filter and Print Actions */}
        <div className="flex items-center gap-2 print:hidden">
          <div className="relative">
            <select
              value={termFilter}
              onChange={(e) => setTermFilter(e.target.value)}
              className="appearance-none rounded-lg border border-slate-200 bg-white pl-8 pr-8 py-1.5 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="">All Academic Terms</option>
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
            </select>
            <Filter className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <ChevronDown className="pointer-events-none absolute right-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5 text-xs h-8 border-slate-200 dark:border-slate-800"
            title="Print Official Report Card"
          >
            <Printer className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Print Report</span>
          </Button>
        </div>
      </div>

      {isError && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>Unable to load your academic report card. Please check your connection and retry.</p>
          </div>
          <Button
            variant="outline"
            size="xs"
            onClick={() => refetch()}
            className="self-start sm:self-auto gap-1 border-rose-300 text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/40"
          >
            <RotateCcw className="h-3 w-3" />
            Retry
          </Button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <CardContent className="pt-4 pb-4">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Recorded Assessments
            </div>
            <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {totalCount} Entries
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <CardContent className="pt-4 pb-4">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Term Mastery Average
            </div>
            <div className="mt-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
              {avgPercentage}%
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <CardContent className="pt-4 pb-4">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Grading Standard
            </div>
            <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              4.00 Max Scale
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Card Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/90 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Term</th>
                <th className="px-4 py-3">Evaluation Type</th>
                <th className="px-4 py-3">Raw Score</th>
                <th className="px-4 py-3">Percentage</th>
                <th className="px-4 py-3">Grade</th>
                <th className="px-4 py-3">Instructor Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  </td>
                </tr>
              ) : filteredGrades.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <BookOpen className="mx-auto mb-2 h-10 w-10 opacity-30 text-slate-500" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No evaluations found for this term</p>
                  </td>
                </tr>
              ) : (
                filteredGrades.map((g) => (
                  <tr
                    key={g.id}
                    className="transition-colors hover:bg-slate-50/75 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {g.subject_name}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400">{g.subject_code}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{g.term}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 text-[11px] font-normal">
                        {g.exam_type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono tabular-nums">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{g.score}</span>
                      <span className="text-slate-400 text-[11px]"> / {g.max_score}</span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                      {g.percentage}%
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={
                          g.letter_grade === "A"
                            ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold font-mono text-xs"
                            : g.letter_grade === "B"
                            ? "border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300 font-bold font-mono text-xs"
                            : g.letter_grade === "F"
                            ? "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 font-bold font-mono text-xs"
                            : "border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold font-mono text-xs"
                        }
                      >
                        {g.letter_grade}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-xs">
                      {g.remarks || <span className="text-slate-400 italic">No notes</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
