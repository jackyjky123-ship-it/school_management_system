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
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { BookOpen, Plus, Trash2, Edit2, Search, Loader2, AlertCircle, RotateCcw } from "lucide-react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

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
  const debouncedSearch = useDebouncedValue(searchTerm, 300);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [classroomId, setClassroomId] = useState<string>("");
  const [teacherId, setTeacherId] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

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
  const {
    data: subjects = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Subject[]>({
    queryKey: ["admin-subjects", debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      const res = await apiClient.get<ApiResponse<Subject[]>>(`/admin/subjects?${params.toString()}`);
      return res.data.data;
    },
  });

  const openCreateDialog = () => {
    setEditingSubject(null);
    setName("");
    setCode(`SUB-${Math.floor(100 + Math.random() * 900)}`);
    setClassroomId(classrooms[0] ? String(classrooms[0].id) : "");
    setTeacherId("");
    setFormError(null);
    setDialogOpen(true);
  };

  const openEditDialog = (s: Subject) => {
    setEditingSubject(s);
    setName(s.name);
    setCode(s.code);
    setClassroomId(String(s.classroom_id));
    setTeacherId(s.teacher_id ? String(s.teacher_id) : "");
    setFormError(null);
    setDialogOpen(true);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Subject title is required");
      if (!code.trim()) throw new Error("Subject code is required");
      if (!classroomId) throw new Error("Please select an assigned classroom");

      const payload = {
        name: name.trim(),
        code: code.trim().toUpperCase(),
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
      const msg = err.response?.data?.message || err.message || "Failed to save subject";
      setFormError(msg);
      toast.error(msg);
    },
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    mutation.mutate();
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      setDeletingId(id);
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
    onSettled: () => {
      setDeletingId(null);
    },
  });

  const handleDelete = (s: Subject) => {
    if (confirm(`Are you sure you want to delete subject "${s.name}" (${s.code})?`)) {
      deleteMutation.mutate(s.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Course Curriculum & Subjects
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Assign courses to classrooms and designate instructing faculty members
          </p>
        </div>
        <Button onClick={openCreateDialog} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium h-9 px-4 text-xs">
          <Plus className="mr-1.5 h-4 w-4" />
          Add Subject
        </Button>
      </div>

      {/* Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search subjects by name or code..."
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
            <p>Unable to load curriculum subjects. Please check database connectivity and retry.</p>
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

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Subject Name</TableHead>
              <TableHead>Assigned Classroom</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="p-8 text-center">
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                  </div>
                </TableCell>
              </TableRow>
            ) : subjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="p-12 text-center text-slate-400">
                  <BookOpen className="mx-auto mb-2 h-10 w-10 opacity-30 text-slate-500" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No subjects registered</p>
                  <p className="text-xs text-slate-400 mt-0.5">Add a subject to start building your academic curriculum.</p>
                </TableCell>
              </TableRow>
            ) : (
              subjects.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                      {s.code}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {s.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 font-normal text-[11px]">
                      {s.classroom_name || "Unassigned"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">
                    {s.teacher_name || <span className="text-slate-400 italic">None</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => openEditDialog(s)}
                        disabled={deletingId === s.id}
                        title="Edit Subject"
                        className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleDelete(s)}
                        disabled={deletingId === s.id}
                        className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Delete Subject"
                      >
                        {deletingId === s.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-500" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingSubject ? "Edit Subject" : "Create New Subject"}
        description="Configure course title, unique code, classroom link, and educator assignment."
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
              {formError}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="s-name" className="text-xs font-medium">Subject Title *</Label>
            <Input
              id="s-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setFormError(null);
              }}
              placeholder="e.g. Physics 10A"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="s-code" className="text-xs font-medium">Subject Code *</Label>
            <Input
              id="s-code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setFormError(null);
              }}
              placeholder="e.g. PHY-10A"
              className="h-9 text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="s-class" className="text-xs font-medium">Assigned Classroom *</Label>
            <Select
              value={classroomId}
              onValueChange={(val) => {
                setClassroomId(val);
                setFormError(null);
              }}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select a classroom..." />
              </SelectTrigger>
              <SelectContent>
                {classrooms.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {classrooms.length === 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                No classrooms available. Please create a classroom first.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="s-teacher" className="text-xs font-medium">Instructing Faculty Member</Label>
            <Select value={teacherId} onValueChange={setTeacherId}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Unassigned</SelectItem>
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDialogOpen(false)}
              disabled={mutation.isPending}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={mutation.isPending || !name.trim() || !code.trim() || !classroomId}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Subject"
              )}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
