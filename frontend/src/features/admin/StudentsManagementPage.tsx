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
import { Search, Plus, Edit2, Trash2, GraduationCap } from "lucide-react";

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
  const { data: students = [], isLoading } = useQuery<Student[]>({
    queryKey: ["admin-students", searchTerm, selectedClassroomId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Student Directory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Enroll, organize, and monitor academic records of all school students
          </p>
        </div>
        <Button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="mr-2 h-4 w-4" />
          Enroll New Student
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by student name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <select
          value={selectedClassroomId}
          onChange={(e) => setSelectedClassroomId(e.target.value)}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <option value="">All Classrooms</option>
          {classrooms.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Students Data Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Classroom</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">Guardian Info</th>
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
                      <Skeleton className="h-6 w-3/4" />
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    <GraduationCap className="mx-auto mb-2 h-10 w-10 opacity-30" />
                    <p className="font-medium text-slate-600 dark:text-slate-300">No students found</p>
                    <p className="text-xs">Try adjusting your search criteria or enroll a new student.</p>
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr
                    key={student.id}
                    className="transition-colors hover:bg-slate-50/75 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-4 py-3 font-mono font-medium text-slate-600 dark:text-slate-300">
                      {student.student_code}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {student.name}
                      </div>
                      <div className="text-xs text-slate-400">{student.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="font-normal">
                        {student.classroom?.name || "Unassigned"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 capitalize text-slate-600 dark:text-slate-300">
                      {student.gender}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
                      <div>{student.guardian_name || "—"}</div>
                      <div className="text-slate-400">{student.guardian_phone}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleEdit(student)}
                          title="Edit Student"
                        >
                          <Edit2 className="h-3.5 w-3.5 text-slate-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleDelete(student)}
                          className="hover:text-red-600"
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

      {/* Slide-over sheet for Add/Edit */}
      <StudentFormSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        studentToEdit={editingStudent}
        classrooms={classrooms}
      />
    </div>
  );
};
