import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/axios";
import { ApiResponse } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ClassroomDialog } from "./components/ClassroomDialog";
import { toast } from "sonner";
import { School, Plus, Edit2, Trash2, BookOpen, GraduationCap } from "lucide-react";

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

  // Fetch teachers for dropdown
  const { data: teachers = [] } = useQuery<Array<{ id: number; name: string }>>({
    queryKey: ["admin-teachers-list"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<any[]>>("/admin/teachers");
      return res.data.data.map((t) => ({ id: t.id, name: t.name }));
    },
  });

  // Fetch Classrooms
  const { data: classrooms = [], isLoading } = useQuery<Classroom[]>({
    queryKey: ["admin-classrooms"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Classroom[]>>("/admin/classrooms");
      return res.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Classrooms & Sections
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage grade levels, academic years, and homeroom faculty designations
          </p>
        </div>
        <Button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="mr-2 h-4 w-4" />
          Create Classroom
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      ) : classrooms.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-400">
          <School className="mx-auto mb-2 h-10 w-10 opacity-30" />
          <p className="font-medium text-slate-600 dark:text-slate-300">No classrooms created yet</p>
          <Button onClick={handleCreate} variant="outline" className="mt-4">
            Create First Classroom
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classrooms.map((c) => (
            <Card key={c.id} className="border-slate-200 shadow-xs dark:border-slate-800 transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {c.name}
                  </CardTitle>
                  <p className="text-xs text-slate-500">{c.grade_level} • {c.academic_year}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon-xs" onClick={() => handleEdit(c)}>
                    <Edit2 className="h-3.5 w-3.5 text-slate-500" />
                  </Button>
                  <Button variant="ghost" size="icon-xs" onClick={() => handleDelete(c)} className="hover:text-red-600">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                <div className="rounded-lg bg-slate-50 p-2.5 text-xs dark:bg-slate-800/50">
                  <span className="text-slate-400">Homeroom Educator: </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {c.homeroom_teacher?.name || "Not assigned"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 text-indigo-500" />
                    {c.students_count ?? 0} Enrolled Students
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                    {c.subjects_count ?? 0} Subjects
                  </span>
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
