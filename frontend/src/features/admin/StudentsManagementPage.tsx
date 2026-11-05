import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/axios";
import { ApiResponse } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StudentFormSheet } from "./components/StudentFormSheet";
import { toast } from "sonner";
import { Search, Plus, Edit2, Trash2, GraduationCap, AlertCircle, ChevronDown } from "lucide-react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

interface Student {
  id: number;
  user_id: number;
  name: string;
  email: string;
  student_code: string;
  classroom_id: number;
  classroom?: { id: number; name: string; grade_level: string };
  gender: string;
  date_of_birth?: string;
  guardian_name?: string;
  guardian_phone?: string;
  address?: string;
}

export const StudentsManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm, 300);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Fetch Classrooms for dropdown filter
  const { data: classrooms = [] } = useQuery<Array<{ id: number; name: string }>>({
    queryKey: ["admin-classrooms-list"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<any[]>>("/admin/classrooms");
      return res.data.data.map((c) => ({ id: c.id, name: c.name }));
    },
  });

  // Fetch Students with search and filter
  const {
    data: students = [],
    isLoading,
    isError,
  } = useQuery<Student[]>({
    queryKey: ["admin-students", debouncedSearch, selectedClassroomId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (selectedClassroomId) params.append("classroom_id", selectedClassroomId);
      const res = await apiClient.get<ApiResponse<Student[]>>(`/admin/students?${params.toString()}`);
      return res.data.data;
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiClient.delete(`/admin/students/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
      toast.success("Student removed successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete student");
    },
  });

  const handleDelete = (student: Student) => {
    if (confirm(`Are you sure you want to remove student "${student.name}" (${student.student_code})?`)) {
      deleteMutation.mutate(student.id);
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setSheetOpen(true);
  };

  const handleCreate = () => {
    setEditingStudent(null);
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
            Student Directory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Enroll, organize, and monitor academic records of all school students
          </p>
        </div>
        <Button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium h-9 px-4 text-xs">
          <Plus className="mr-1.5 h-4 w-4" />
          Enroll New Student
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by student name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="relative sm:w-56">
          <select
            value={selectedClassroomId}
            onChange={(e) => setSelectedClassroomId(e.target.value)}
            className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="">All Classrooms</option>
            {classrooms.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
        </div>
      </div>

      {isError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Unable to load student directory. Please check database connectivity and refresh.</p>
        </div>
      )}

      {/* Students Data Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/90 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Classroom</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">Guardian Info</th>
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
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    <GraduationCap className="mx-auto mb-2 h-10 w-10 opacity-30" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No students found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try adjusting your search criteria or enroll a new student.</p>
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr
                    key={student.id}
                    className="transition-colors hover:bg-slate-50/75 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-3">
                      <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                        {student.student_code}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 font-semibold text-[11px] text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                          {getInitials(student.name)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {student.name}
                          </div>
                          <div className="text-[11px] text-slate-400">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 font-normal text-[11px]">
                        {student.classroom?.name || "Unassigned"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 capitalize text-slate-600 dark:text-slate-400">
                      {student.gender}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{student.guardian_name || "—"}</div>
                      <div className="text-[10px] text-slate-400 tabular-nums">{student.guardian_phone}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleEdit(student)}
                          title="Edit Student"
                          className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleDelete(student)}
                          className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Delete Student"
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

      <StudentFormSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        studentToEdit={editingStudent}
        classrooms={classrooms}
      />
    </div>
  );
};
