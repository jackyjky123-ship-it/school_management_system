import React from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

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
    if (isNaN(val) || maxScore <= 0) return { letter: "—", variant: "outline" as const };
    const pct = (val / maxScore) * 100;
    if (pct >= 90) return { letter: "A", variant: "default" as const };
    if (pct >= 80) return { letter: "B", variant: "secondary" as const };
    if (pct >= 70) return { letter: "C", variant: "outline" as const };
    if (pct >= 60) return { letter: "D", variant: "outline" as const };
    return { letter: "F", variant: "destructive" as const };
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Student Name</th>
              <th className="px-4 py-3 w-32">Score</th>
              <th className="px-4 py-3">Max</th>
              <th className="px-4 py-3">Percentage</th>
              <th className="px-4 py-3">Letter Grade</th>
              <th className="px-4 py-3">Teacher Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((row) => {
              const numScore = parseFloat(row.score);
              const pct = !isNaN(numScore) ? Math.round((numScore / row.max_score) * 100) : null;
              const badgeInfo = getLetterBadge(row.score, row.max_score);

              return (
                <tr
                  key={row.student_id}
                  className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                >
                  <td className="px-4 py-3 font-mono font-medium text-slate-500 dark:text-slate-400">
                    {row.student_code}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                    {row.name}
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
                      className="h-8 font-mono font-semibold"
                    />
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">/ {row.max_score}</td>
                  <td className="px-4 py-3 font-mono text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {pct !== null ? `${pct}%` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={badgeInfo.variant} className="font-bold">
                      {badgeInfo.letter}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      placeholder="Feedback remarks..."
                      value={row.remarks}
                      onChange={(e) => onRemarksChange(row.student_id, e.target.value)}
                      className="h-8 text-xs"
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
