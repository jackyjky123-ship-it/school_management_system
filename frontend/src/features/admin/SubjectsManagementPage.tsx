import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/axios";
import { ApiResponse } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { BookOpen, Plus, Trash2, Edit2, Search, Loader2 } from "lucide-react";

interface Subject {
  id: number;
  name: string;
  code: string;
  classroom_id: number;
  classroom_name?: string;
  teacher_id?: number | null;
  teacher_name?: string;
}

export const SubjectsManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [classroomId, setClassroomId] = useState<string>("");
  const [teacherId, setTeacherId] = useState<string>("");

  // Fetch Classrooms & Teachers for form dropdowns
  const { data: classrooms = [] } = useQuery<Array<{ id: number; name: string }>>({
    queryKey: ["admin-classrooms-list"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<any[]>>("/admin/classrooms");
      return res.data.data.map((c) => ({ id: c.id, name: c.name }));
    },
  });

  const { data: teachers = [] } = useQuery<Array<{ id: number; name: string }>>({
    queryKey: ["admin-teachers-list"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<any[]>>("/admin/teachers");
      return res.data.data.map((t) => ({ id: t.id, name: t.name }));
    },
  });

  // Fetch Subjects
  const { data: subjects = [], isLoading } = useQuery<Subject[]>({
    queryKey: ["admin-subjects", searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      const res = await apiClient.get<ApiResponse<Subject[]>>(`/admin/subjects?${params.toString()}`);
      return res.data.data;
    },
  });

  const openCreateDialog = () => {
    setEditingSubject(null);
    setName("");
    setCode(`SUB-${Math.floor(100 + Math.random() * 900)}`);
    setClassroomId(classrooms[0] ? String(classrooms[0].id) : "");
    setTeacherId(teachers[0] ? String(teachers[0].id) : "");
    setDialogOpen(true);
  };

  const openEditDialog = (s: Subject) => {
    setEditingSubject(s);
    setName(s.name);
    setCode(s.code);
    setClassroomId(String(s.classroom_id));
    setTeacherId(s.teacher_id ? String(s.teacher_id) : "");
    setDialogOpen(true);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name,
        code,
        classroom_id: Number(classroomId),
        teacher_id: teacherId ? Number(teacherId) : null,
      };
      if (editingSubject) {
        return apiClient.put(`/admin/subjects/${editingSubject.id}`, payload);
      }
      return apiClient.post("/admin/subjects", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subjects"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
      toast.success(editingSubject ? "Subject updated" : "Subject registered successfully");
      setDialogOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to save subject");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiClient.delete(`/admin/subjects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subjects"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
      toast.success("Subject deleted successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete subject");
    },
  });

  const handleDelete = (s: Subject) => {
    if (confirm(`Are you sure you want to delete subject "${s.name}" (${s.code})?`)) {
      deleteMutation.mutate(s.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Course Curriculum & Subjects
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Assign courses to classrooms and designate instructing faculty members
          </p>
        </div>
        <Button onClick={openCreateDialog} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Subject
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search subjects by name or code..."
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
                <th className="px-4 py-3">Subject Name</th>
                <th className="px-4 py-3">Assigned Classroom</th>
                <th className="px-4 py-3">Instructor</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  </td>
                </tr>
              ) : subjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    <BookOpen className="mx-auto mb-2 h-10 w-10 opacity-30" />
                    <p className="font-medium text-slate-600 dark:text-slate-300">No subjects registered</p>
                  </td>
                </tr>
              ) : (
                subjects.map((s) => (
                  <tr
                    key={s.id}
                    className="transition-colors hover:bg-slate-50/75 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-4 py-3 font-mono font-medium text-slate-600 dark:text-slate-300">
                      {s.code}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                      {s.name}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{s.classroom_name || "Unassigned"}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {s.teacher_name || <span className="text-slate-400 italic">None</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-xs" onClick={() => openEditDialog(s)} title="Edit">
                          <Edit2 className="h-3.5 w-3.5 text-slate-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleDelete(s)}
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

      <Dialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingSubject ? "Edit Subject" : "Create New Subject"}
        description="Configure course title, unique code, classroom link, and educator assignment."
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="s-name">Subject Title *</Label>
            <Input id="s-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Physics 10A" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="s-code">Subject Code *</Label>
            <Input id="s-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. PHY-10A" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="s-class">Assigned Classroom *</Label>
            <select
              id="s-class"
              value={classroomId}
              onChange={(e) => setClassroomId(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <option value="">Select a classroom...</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="s-teacher">Instructing Faculty Member</Label>
            <select
              id="s-teacher"
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <option value="">Unassigned</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || !name || !code || !classroomId}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Subject"
              )}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
