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
    if (val >= 3.8) return { label: "Principal's Honor Roll", color: "text-amber-500" };
    if (val >= 3.5) return { label: "Dean's Honors List", color: "text-emerald-500" };
    if (val >= 3.0) return { label: "Good Academic Standing", color: "text-indigo-500" };
    if (val >= 2.0) return { label: "Satisfactory Standing", color: "text-blue-500" };
    return { label: "Academic Guidance Required", color: "text-red-500" };
  };

  const standing = getAcademicStanding(gpa);

  return (
    <Card className="relative overflow-hidden border-indigo-200 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 shadow-xs dark:border-indigo-900/50 dark:from-indigo-950/20 dark:via-slate-900 dark:to-purple-950/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
            Cumulative Grade Point Average
          </CardTitle>
          <CardDescription>Academic Year 2026-2027 • Standard 4.0 Scale</CardDescription>
        </div>
        <div className="rounded-xl bg-indigo-600/10 p-2.5 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400">
          <Award className="h-6 w-6" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        <div className="flex items-baseline gap-4">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
              {gpa.toFixed(2)}
            </span>
            <span className="text-sm font-semibold text-slate-400">/ 4.00</span>
          </div>

          <Badge className="bg-indigo-600 text-sm font-bold uppercase tracking-wider text-white">
            Grade {letterGrade}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1 font-medium">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              Overall Mastery Percentage
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {averagePercentage.toFixed(1)}%
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200/60 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(0, averagePercentage))}%` }}
            />
          </div>
        </div>

        {/* Academic Standing Pill */}
        <div className="flex items-center gap-1.5 rounded-lg bg-white/70 px-3 py-2 text-xs font-semibold backdrop-blur-xs dark:bg-slate-800/60">
          <Sparkles className={`h-4 w-4 ${standing.color}`} />
          <span className="text-slate-700 dark:text-slate-300">Status: {standing.label}</span>
        </div>
      </CardContent>
    </Card>
  );
};
