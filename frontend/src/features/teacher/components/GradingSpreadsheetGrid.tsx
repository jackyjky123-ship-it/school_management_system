import React from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface GradeRow {
  student_id: number;
  student_code: string;
  name: string;
  score: string;
  max_score: number;
  remarks: string;
}

interface GradingSpreadsheetGridProps {
  rows: GradeRow[];
  onScoreChange: (studentId: number, score: string) => void;
  onRemarksChange: (studentId: number, remarks: string) => void;
}

export const GradingSpreadsheetGrid: React.FC<GradingSpreadsheetGridProps> = ({
  rows,
  onScoreChange,
  onRemarksChange,
}) => {
  const getLetterBadge = (scoreStr: string, maxScore: number) => {
    const val = parseFloat(scoreStr);
    if (isNaN(val) || maxScore <= 0) return { letter: "—", className: "border-slate-300 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400" };
    if (val < 0 || val > maxScore) return { letter: "ERR", className: "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300" };
    const pct = (val / maxScore) * 100;
    if (pct >= 90) return { letter: "A", className: "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300" };
    if (pct >= 80) return { letter: "B", className: "border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300" };
    if (pct >= 70) return { letter: "C", className: "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300" };
    if (pct >= 60) return { letter: "D", className: "border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950/60 dark:text-orange-300" };
    return { letter: "F", className: "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300" };
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50/90 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Student Name</th>
              <th className="px-4 py-3 w-32">Score</th>
              <th className="px-4 py-3">Scale</th>
              <th className="px-4 py-3">Percentage</th>
              <th className="px-4 py-3">Letter Grade</th>
              <th className="px-4 py-3">Teacher Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {rows.map((row) => {
              const numScore = parseFloat(row.score);
              const isInvalid = !isNaN(numScore) && (numScore < 0 || numScore > row.max_score);
              const pct = !isNaN(numScore) ? Math.round((numScore / row.max_score) * 100) : null;
              const badgeInfo = getLetterBadge(row.score, row.max_score);

              return (
                <tr
                  key={row.student_id}
                  className={cn(
                    "transition-colors hover:bg-slate-50/75 dark:hover:bg-slate-800/40",
                    isInvalid && "bg-rose-50/40 dark:bg-rose-950/20"
                  )}
                >
                  <td className="px-4 py-3">
                    <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                      {row.student_code}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 font-semibold text-[11px] text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                        {getInitials(row.name)}
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {row.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      max={row.max_score}
                      value={row.score}
                      onChange={(e) => onScoreChange(row.student_id, e.target.value)}
                      placeholder="0.0"
                      className={cn(
                        "h-8 font-mono font-semibold text-xs",
                        isInvalid && "border-rose-500 bg-rose-50 text-rose-700 focus-visible:ring-rose-500/30 dark:border-rose-500 dark:bg-rose-950/50 dark:text-rose-300"
                      )}
                    />
                  </td>
                  <td className="px-4 py-3 text-slate-400 tabular-nums">/ {row.max_score}</td>
                  <td className={cn(
                    "px-4 py-3 font-mono text-xs font-bold tabular-nums",
                    isInvalid ? "text-rose-600 dark:text-rose-400" : "text-slate-800 dark:text-slate-200"
                  )}>
                    {pct !== null ? `${pct}%` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={cn("font-bold font-mono text-xs px-2.5 py-0.5", badgeInfo.className)}>
                      {badgeInfo.letter}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      placeholder="Optional assessment notes..."
                      value={row.remarks}
                      onChange={(e) => onRemarksChange(row.student_id, e.target.value)}
                      className="h-8 text-xs bg-slate-50/50 dark:bg-slate-950/40"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
