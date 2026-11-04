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

  return (
    <Card className="border-slate-200 shadow-xs dark:border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
            Attendance Rate
          </CardTitle>
          <CardDescription>Official school calendar log</CardDescription>
        </div>
        <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
          <CalendarCheck className="h-6 w-6" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
            {attendanceRate.toFixed(1)}%
          </span>
          <Badge
            variant={isSatisfactory ? "default" : "destructive"}
            className="text-xs uppercase"
          >
            {isSatisfactory ? "Compliant" : "Low Attendance"}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Sessions Attended</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {presentDays} / {totalDays} School Days
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isSatisfactory ? "bg-emerald-500" : "bg-red-500"
              }`}
              style={{ width: `${Math.min(100, Math.max(0, attendanceRate))}%` }}
            />
          </div>
        </div>

        {/* Quick Legend Indicators */}
        <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5 rounded-md bg-slate-50 p-2 dark:bg-slate-800/50">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>Present: {presentDays} days</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-md bg-slate-50 p-2 dark:bg-slate-800/50">
            {totalDays - presentDays === 0 ? (
              <Clock className="h-4 w-4 text-blue-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            )}
            <span>Absences: {totalDays - presentDays}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
