import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/axios";
import { ApiResponse } from "@/types/auth";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Filter } from "lucide-react";

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

  const { data: grades = [], isLoading } = useQuery<GradeItem[]>({
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Official Academic Report Card
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Comprehensive transcript of term assessments, examinations, and instructor evaluations
          </p>
        </div>

        {/* Term Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={termFilter}
            onChange={(e) => setTermFilter(e.target.value)}
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <option value="">All Academic Terms</option>
            <option value="Semester 1">Semester 1</option>
            <option value="Semester 2">Semester 2</option>
          </select>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-slate-200 shadow-xs dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-medium">Recorded Assessments</CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {totalCount} Entries
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-slate-200 shadow-xs dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-medium">Term Average</CardDescription>
            <CardTitle className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {avgPercentage}%
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-slate-200 shadow-xs dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-medium">Grading Standard</CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              4.00 Max Scale
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Report Card Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
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
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
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
                    <BookOpen className="mx-auto mb-2 h-10 w-10 opacity-30" />
                    <p className="font-medium text-slate-600 dark:text-slate-300">No evaluations found for this term</p>
                  </td>
                </tr>
              ) : (
                filteredGrades.map((g) => (
                  <tr
                    key={g.id}
                    className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {g.subject_name}
                      </div>
                      <div className="text-xs font-mono text-slate-400">{g.subject_code}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{g.term}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">
                        {g.exam_type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{g.score}</span>
                      <span className="text-xs text-slate-400"> / {g.max_score}</span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {g.percentage}%
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          g.letter_grade === "A"
                            ? "default"
                            : g.letter_grade === "B"
                            ? "secondary"
                            : "outline"
                        }
                        className="font-bold font-mono"
                      >
                        {g.letter_grade}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-xs">
                      {g.remarks || <span className="text-slate-300 italic">No notes</span>}
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
