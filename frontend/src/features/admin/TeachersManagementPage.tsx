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
import { Search, Plus, Edit2, Trash2, Users, BookOpen, AlertCircle, Loader2, RotateCcw } from "lucide-react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

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
  const debouncedSearch = useDebouncedValue(searchTerm, 300);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const {
    data: teachers = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Teacher[]>({
    queryKey: ["admin-teachers", debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      const res = await apiClient.get<ApiResponse<Teacher[]>>(`/admin/teachers?${params.toString()}`);
      return res.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      setDeletingId(id);
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
    onSettled: () => {
      setDeletingId(null);
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

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Faculty Directory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage academic instructors, department specializations, and homeroom appointments
          </p>
        </div>
        <Button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium h-9 px-4 text-xs">
          <Plus className="mr-1.5 h-4 w-4" />
          Add Faculty Member
        </Button>
      </div>

      {/* Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search teachers by name, specialization, or employee ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      {isError && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>Unable to load faculty directory. Please verify server connectivity and retry.</p>
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

      {/* Teachers Data Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/90 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Instructor</th>
                <th className="px-4 py-3">Specialization</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Assignments</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-3/4" />
                    </div>
                  </td>
                </tr>
              ) : teachers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    <Users className="mx-auto mb-2 h-10 w-10 opacity-30" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No faculty members found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try adjusting your search criteria or add a new faculty member.</p>
                  </td>
                </tr>
              ) : (
                teachers.map((t) => (
                  <tr
                    key={t.id}
                    className="transition-colors hover:bg-slate-50/75 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-3">
                      <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                        {t.employee_code}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 font-semibold text-[11px] text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                          {getInitials(t.name)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">{t.name}</div>
                          <div className="text-[11px] text-slate-400">{t.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 font-normal text-[11px]">
                        {t.specialization}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      <div className="tabular-nums">{t.phone || "—"}</div>
                      <div className="text-[10px] text-slate-400">Hired: {t.hire_date || "—"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {t.subjects && t.subjects.length > 0 ? (
                          <Badge variant="outline" className="text-[10px] gap-1 border-indigo-200 bg-indigo-50/70 text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
                            <BookOpen className="h-2.5 w-2.5" />
                            {t.subjects.length} Course(s)
                          </Badge>
                        ) : (
                          <span className="text-[11px] text-slate-400">No subjects assigned</span>
                        )}
                        {t.homeroom_classrooms && t.homeroom_classrooms.length > 0 && (
                          <Badge variant="outline" className="text-[10px] border-purple-200 bg-purple-50/70 text-purple-700 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-300">
                            Homeroom: {t.homeroom_classrooms[0].name}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleEdit(t)}
                          disabled={deletingId === t.id}
                          title="Edit Faculty Member"
                          className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleDelete(t)}
                          disabled={deletingId === t.id}
                          className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Delete Faculty Member"
                        >
                          {deletingId === t.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-500" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
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
