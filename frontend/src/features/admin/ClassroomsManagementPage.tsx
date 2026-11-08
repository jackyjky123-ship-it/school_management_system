import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/axios";
import { ApiResponse } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ClassroomDialog } from "./components/ClassroomDialog";
import { toast } from "sonner";
import {
  School,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  GraduationCap,
  AlertCircle,
  Loader2,
  RotateCcw,
  ArrowRight,
} from "lucide-react";

interface Classroom {
  id: number;
  name: string;
  grade_level: string;
  academic_year: string;
  homeroom_teacher_id?: number | null;
  homeroom_teacher?: { id: number; name: string; employee_code: string };
  students_count?: number;
  subjects_count?: number;
}

export const ClassroomsManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch teachers for dropdown
  const { data: teachers = [] } = useQuery<Array<{ id: number; name: string }>>({
    queryKey: ["admin-teachers-list"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<any[]>>("/admin/teachers");
      return res.data.data.map((t) => ({ id: t.id, name: t.name }));
    },
  });

  // Fetch Classrooms
  const {
    data: classrooms = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Classroom[]>({
    queryKey: ["admin-classrooms"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Classroom[]>>("/admin/classrooms");
      return res.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      setDeletingId(id);
      return apiClient.delete(`/admin/classrooms/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-classrooms"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
      toast.success("Classroom deleted successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete classroom");
    },
    onSettled: () => {
      setDeletingId(null);
    },
  });

  const handleDelete = (classroom: Classroom) => {
    if (confirm(`Are you sure you want to delete classroom "${classroom.name}"?`)) {
      deleteMutation.mutate(classroom.id);
    }
  };

  const handleEdit = (classroom: Classroom) => {
    setEditingClassroom(classroom);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingClassroom(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Classrooms & Sections
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage grade levels, academic years, and homeroom faculty designations
          </p>
        </div>
        <Button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium h-9 px-4 text-xs">
          <Plus className="mr-1.5 h-4 w-4" />
          Create Classroom
        </Button>
      </div>

      {isError && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>Unable to load classrooms. Please check database connectivity and retry.</p>
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

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      ) : classrooms.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-12 text-center text-slate-400">
          <School className="mx-auto mb-2 h-10 w-10 opacity-30 text-slate-500" />
          <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No classrooms created yet</p>
          <Button onClick={handleCreate} variant="outline" className="mt-4 text-xs h-8">
            Create First Classroom
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classrooms.map((c) => (
            <Card key={c.id} className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs transition-colors hover:border-slate-300 dark:hover:border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {c.name}
                  </CardTitle>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {c.grade_level} • Academic Year {c.academic_year}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleEdit(c)}
                    disabled={deletingId === c.id}
                    title="Edit Classroom"
                    className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleDelete(c)}
                    disabled={deletingId === c.id}
                    className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Delete Classroom"
                  >
                    {deletingId === c.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-500" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                <div className="rounded-lg border border-slate-200/80 bg-slate-50 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800/60">
                  <span className="text-slate-500 dark:text-slate-400">Homeroom Educator: </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {c.homeroom_teacher?.name || "Not assigned"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5 tabular-nums">
                    <GraduationCap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    {c.students_count ?? 0} Students
                  </span>
                  <span className="flex items-center gap-1.5 tabular-nums">
                    <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    {c.subjects_count ?? 0} Subjects
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Link to={`/admin/classrooms/${c.id}`}>
                    <Button
                      variant="ghost"
                      size="xs"
                      className="w-full justify-between text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30"
                    >
                      <span>Classroom Hub</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ClassroomDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        classroomToEdit={editingClassroom}
        teachers={teachers}
      />
    </div>
  );
};
