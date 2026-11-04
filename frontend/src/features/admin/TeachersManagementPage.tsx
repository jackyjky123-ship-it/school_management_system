import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/axios";
import { ApiResponse } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TeacherFormSheet } from "./components/TeacherFormSheet";
import { toast } from "sonner";
import { Search, Plus, Edit2, Trash2, Users, BookOpen } from "lucide-react";

interface Teacher {
  id: number;
  user_id: number;
  name: string;
  email: string;
  employee_code: string;
  specialization: string;
  phone?: string;
  hire_date?: string;
  homeroom_classrooms?: Array<{ id: number; name: string }>;
  subjects?: Array<{ id: number; name: string }>;
}

export const TeachersManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const { data: teachers = [], isLoading } = useQuery<Teacher[]>({
    queryKey: ["admin-teachers", searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      const res = await apiClient.get<ApiResponse<Teacher[]>>(`/admin/teachers?${params.toString()}`);
      return res.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiClient.delete(`/admin/teachers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-teachers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
      toast.success("Faculty member record removed");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete teacher");
    },
  });

  const handleDelete = (teacher: Teacher) => {
    if (confirm(`Are you sure you want to delete "${teacher.name}" (${teacher.employee_code})?`)) {
      deleteMutation.mutate(teacher.id);
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setSheetOpen(true);
  };

  const handleCreate = () => {
    setEditingTeacher(null);
    setSheetOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Faculty Directory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage academic instructors, department specializations, and homeroom appointments
          </p>
        </div>
        <Button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Faculty Member
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search teachers by name, specialization, or employee ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 bg-white dark:bg-slate-900"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Instructor</th>
                <th className="px-4 py-3">Specialization</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Subjects / Homeroom</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  </td>
                </tr>
              ) : teachers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    <Users className="mx-auto mb-2 h-10 w-10 opacity-30" />
                    <p className="font-medium text-slate-600 dark:text-slate-300">No faculty members found</p>
                  </td>
                </tr>
              ) : (
                teachers.map((t) => (
                  <tr
                    key={t.id}
                    className="transition-colors hover:bg-slate-50/75 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-4 py-3 font-mono font-medium text-slate-600 dark:text-slate-300">
                      {t.employee_code}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 dark:text-slate-100">{t.name}</div>
                      <div className="text-xs text-slate-400">{t.email}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                      {t.specialization}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      <div>{t.phone || "—"}</div>
                      <div>Hired: {t.hire_date || "—"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {t.subjects && t.subjects.length > 0 ? (
                          <Badge variant="outline" className="text-xs gap-1">
                            <BookOpen className="h-3 w-3" />
                            {t.subjects.length} Course(s)
                          </Badge>
                        ) : (
                          <span className="text-xs text-slate-400">No subjects assigned</span>
                        )}
                        {t.homeroom_classrooms && t.homeroom_classrooms.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            Homeroom: {t.homeroom_classrooms[0].name}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-xs" onClick={() => handleEdit(t)} title="Edit">
                          <Edit2 className="h-3.5 w-3.5 text-slate-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleDelete(t)}
                          className="hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TeacherFormSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        teacherToEdit={editingTeacher}
      />
    </div>
  );
};
