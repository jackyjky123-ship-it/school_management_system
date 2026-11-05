import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Sparkles, TrendingUp } from "lucide-react";

interface GpaCardProps {
  gpa: number;
  averagePercentage: number;
  letterGrade: string;
}

export const GpaCard: React.FC<GpaCardProps> = ({
  gpa,
  averagePercentage,
  letterGrade,
}) => {
  const getAcademicStanding = (val: number) => {
    if (val >= 3.8) return { label: "Principal's Honor Roll", color: "text-amber-600 dark:text-amber-400", badgeBg: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800" };
    if (val >= 3.5) return { label: "Dean's Honors List", color: "text-emerald-600 dark:text-emerald-400", badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800" };
    if (val >= 3.0) return { label: "Good Academic Standing", color: "text-indigo-600 dark:text-indigo-400", badgeBg: "bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800" };
    if (val >= 2.0) return { label: "Satisfactory Standing", color: "text-blue-600 dark:text-blue-400", badgeBg: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800" };
    return { label: "Academic Guidance Required", color: "text-rose-600 dark:text-rose-400", badgeBg: "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800" };
  };

  const standing = getAcademicStanding(gpa);

  return (
    <Card className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
            Grade Point Average
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
            Academic Year 2026–2027 • Standard 4.0 Scale
          </CardDescription>
        </div>
        <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
          <Award className="h-5 w-5" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-4">
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl tabular-nums">
              {gpa.toFixed(2)}
            </span>
            <span className="text-sm font-semibold text-slate-400 dark:text-slate-500 tabular-nums">
              / 4.00
            </span>
          </div>

          <Badge className="bg-indigo-600 text-white font-bold text-xs px-2.5 py-0.5">
            Grade {letterGrade}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1 font-medium">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              Overall Mastery Percentage
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
              {averagePercentage.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, averagePercentage))}%` }}
            />
          </div>
        </div>

        {/* Academic Standing Pill */}
        <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${standing.badgeBg}`}>
          <Sparkles className={`h-4 w-4 shrink-0 ${standing.color}`} />
          <span>Status: {standing.label}</span>
        </div>
      </CardContent>
    </Card>
  );
};
