import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/axios";
import { ApiResponse } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GradingSpreadsheetGrid,
  GradeRow,
} from "./components/GradingSpreadsheetGrid";
import { toast } from "sonner";
import { Save, Loader2, BookOpen, AlertCircle } from "lucide-react";

export const BulkGradingPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedTerm, setSelectedTerm] = useState<string>("Semester 1");
  const [selectedExamType, setSelectedExamType] = useState<string>("Midterm");
  const [maxScore, setMaxScore] = useState<number>(100);
  const [rows, setRows] = useState<GradeRow[]>([]);

  // 1. Fetch Teacher's assigned subjects
  const { data: dashboardData } = useQuery({
    queryKey: ["teacher-dashboard-stats"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<any>>("/dashboard/teacher");
      return res.data.data;
    },
  });

  const assignedSubjects = dashboardData?.assigned_subjects || [];

  // Default subject selection
  useEffect(() => {
    if (!selectedSubjectId && assignedSubjects.length > 0) {
      setSelectedSubjectId(String(assignedSubjects[0].id));
    }
  }, [assignedSubjects, selectedSubjectId]);

  // Find the selected subject's classroom directly from the dashboard payload.
  // This avoids calling the admin-only subject detail endpoint as a teacher.
  const activeSubject = assignedSubjects.find(
    (s: any) => String(s.id) === selectedSubjectId
  );

  const classroomId = activeSubject?.classroom_id;

  // Fetch students through the classroom-scoped roster endpoint.
  const {
    data: students = [],
    isLoading: loadingStudents,
    isError: studentsError,
  } = useQuery({
    queryKey: ["classroom-students", classroomId],
    enabled: !!classroomId,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<any[]>>(
        `/classrooms/${classroomId}/students`
      );
      return res.data.data;
    },
  });

  // 4. Fetch existing grades for this subject + term + exam type
  const {
    data: existingGrades = [],
    isLoading: loadingGrades,
    isError: gradesError,
  } = useQuery({
    queryKey: ["subject-grades", selectedSubjectId, selectedTerm, selectedExamType],
    enabled: !!selectedSubjectId,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<any[]>>(
        `/grades?subject_id=${selectedSubjectId}&term=${selectedTerm}&exam_type=${selectedExamType}`
      );
      return res.data.data;
    },
  });

  // Keep the latest scale available to the merge effect without making the
  // effect rebuild (and wipe) rows whenever the scale input changes.
  const maxScoreRef = useRef(maxScore);
  useEffect(() => {
    maxScoreRef.current = maxScore;
  }, [maxScore]);

  // Merge students and existing grades
  useEffect(() => {
    // Clear stale rows when switching to a subject with no students.
    if (students.length === 0) {
      setRows([]);
      return;
    }

    const gradeMap = new Map<number, { score: number; max_score: number; remarks: string }>();
    existingGrades.forEach((g: any) => {
      gradeMap.set(g.student_id, {
        score: g.score,
        max_score: g.max_score,
        remarks: g.remarks || "",
      });
    });

    const newRows: GradeRow[] = students.map((std: any) => {
      const existing = gradeMap.get(std.id);
      return {
        student_id: std.id,
        student_code: std.student_code,
        name: std.name,
        score: existing ? String(existing.score) : "",
        max_score: existing ? existing.max_score : maxScoreRef.current,
        remarks: existing ? existing.remarks : "",
      };
    });

    setRows(newRows);
  }, [students, existingGrades]);

  const handleMaxScoreChange = (value: string) => {
    const parsed = Number(value);
    const nextMaxScore = Number.isFinite(parsed) && parsed > 0 ? parsed : 100;
    setMaxScore(nextMaxScore);
    setRows((previous) =>
      previous.map((row) => ({ ...row, max_score: nextMaxScore }))
    );
  };

  const handleScoreChange = (studentId: number, score: string) => {
    setRows((prev) =>
      prev.map((r) => (r.student_id === studentId ? { ...r, score } : r))
    );
  };

  const handleRemarksChange = (studentId: number, remarks: string) => {
    setRows((prev) =>
      prev.map((r) => (r.student_id === studentId ? { ...r, remarks } : r))
    );
  };

  // Submit Bulk Grades
  const submitMutation = useMutation({
    mutationFn: async () => {
      const validRecords = rows
        .filter((r) => r.score.trim() !== "")
        .map((r) => ({
          student_id: r.student_id,
          score: parseFloat(r.score),
          max_score: r.max_score,
          remarks: r.remarks || null,
        }));

      if (validRecords.length === 0) {
        throw new Error("Please enter at least one student grade before saving.");
      }

      for (const rec of validRecords) {
        if (isNaN(rec.score)) {
          throw new Error("One or more scores are not valid numbers.");
        }
        if (rec.score < 0) {
          throw new Error("Scores cannot be negative.");
        }
        if (rec.score > rec.max_score) {
          throw new Error(`Score (${rec.score}) exceeds maximum scaled score (${rec.max_score}).`);
        }
      }

      const payload = {
        subject_id: Number(selectedSubjectId),
        term: selectedTerm,
        exam_type: selectedExamType,
        records: validRecords,
      };

      return apiClient.post("/grades/batch", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subject-grades", selectedSubjectId, selectedTerm, selectedExamType],
      });
      queryClient.invalidateQueries({ queryKey: ["teacher-dashboard-stats"] });
      toast.success("Exam grades recorded successfully!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to record grades");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Bulk Spreadsheet Grading
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Enter and publish exam and assessment scores for your assigned courses
          </p>
        </div>

        <Button
          onClick={() => submitMutation.mutate()}
          disabled={submitMutation.isPending || rows.length === 0}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {submitMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving Grades...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save All Grades
            </>
          )}
        </Button>
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <Label htmlFor="subject" className="text-xs">
            Course Subject
          </Label>
          <select
            id="subject"
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-800 dark:bg-slate-900"
          >
            {assignedSubjects.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.classroom_name})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="term" className="text-xs">
            Academic Term
          </Label>
          <select
            id="term"
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <option value="Semester 1">Semester 1</option>
            <option value="Semester 2">Semester 2</option>
          </select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="exam-type" className="text-xs">
            Evaluation Type
          </Label>
          <select
            id="exam-type"
            value={selectedExamType}
            onChange={(e) => setSelectedExamType(e.target.value)}
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <option value="Midterm">Midterm Examination</option>
            <option value="Final">Final Examination</option>
            <option value="Quiz 1">Quiz 1</option>
            <option value="Quiz 2">Quiz 2</option>
          </select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="max-score" className="text-xs">
            Max Scaled Score
          </Label>
          <Input
            id="max-score"
            type="number"
            min="1"
            max="999.99"
            step="0.5"
            value={maxScore}
            onChange={(e) => handleMaxScoreChange(e.target.value)}
            className="h-8.5 text-sm"
          />
        </div>
      </div>

      {studentsError || gradesError ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Unable to load this grading sheet. Please refresh the page or contact an administrator.</p>
        </div>
      ) : loadingStudents || loadingGrades ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-400">
          <BookOpen className="mx-auto mb-2 h-10 w-10 opacity-30" />
          <p className="font-medium text-slate-600 dark:text-slate-300">
            No students found in the classroom assigned to {activeSubject?.name || "this course"}
          </p>
        </div>
      ) : (
        <GradingSpreadsheetGrid
          rows={rows}
          onScoreChange={handleScoreChange}
          onRemarksChange={handleRemarksChange}
        />
      )}
    </div>
  );
};
