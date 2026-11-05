import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

interface AttendanceGaugeProps {
  attendanceRate: number;
  totalDays: number;
  presentDays: number;
}

export const AttendanceGauge: React.FC<AttendanceGaugeProps> = ({
  attendanceRate,
  totalDays,
  presentDays,
}) => {
  const isSatisfactory = attendanceRate >= 85.0;
  const absences = Math.max(0, totalDays - presentDays);

  return (
    <Card className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
            Attendance Rate
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
            Official academic calendar records
          </CardDescription>
        </div>
        <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
          <CalendarCheck className="h-5 w-5" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl tabular-nums">
            {attendanceRate.toFixed(1)}%
          </span>
          <Badge
            variant={isSatisfactory ? "default" : "destructive"}
            className={
              isSatisfactory
                ? "bg-emerald-600 text-white font-semibold text-xs px-2.5 py-0.5"
                : "bg-rose-600 text-white font-semibold text-xs px-2.5 py-0.5"
            }
          >
            {isSatisfactory ? "Compliant" : "Low Attendance"}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Sessions Attended</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
              {presentDays} / {totalDays} School Days
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isSatisfactory ? "bg-emerald-600" : "bg-rose-600"
              }`}
              style={{ width: `${Math.min(100, Math.max(0, attendanceRate))}%` }}
            />
          </div>
        </div>

        {/* Quick Legend Indicators */}
        <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50 p-2 text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="tabular-nums font-medium">Present: {presentDays} days</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50 p-2 text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
            {absences === 0 ? (
              <Clock className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            )}
            <span className="tabular-nums font-medium">Absences: {absences}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
