import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/axios";
import { toast } from "sonner";
import { Loader2, ChevronDown } from "lucide-react";

const classroomSchema = z.object({
  name: z.string().min(2, "Classroom name is required"),
  grade_level: z.string().min(1, "Grade level is required"),
  academic_year: z.string().min(4, "Academic year is required"),
  homeroom_teacher_id: z.string().optional(),
});

type ClassroomFormData = z.infer<typeof classroomSchema>;

interface ClassroomDialogProps {
  isOpen: boolean;
  onClose: () => void;
  classroomToEdit?: any | null;
  teachers: Array<{ id: number; name: string }>;
}

export const ClassroomDialog: React.FC<ClassroomDialogProps> = ({
  isOpen,
  onClose,
  classroomToEdit,
  teachers,
}) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClassroomFormData>({
    resolver: zodResolver(classroomSchema),
    defaultValues: {
      name: "",
      grade_level: "Grade 10",
      academic_year: "2026-2027",
      homeroom_teacher_id: "",
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    if (classroomToEdit) {
      reset({
        name: classroomToEdit.name || "",
        grade_level: classroomToEdit.grade_level || "Grade 10",
        academic_year: classroomToEdit.academic_year || "2026-2027",
        homeroom_teacher_id: classroomToEdit.homeroom_teacher_id
          ? String(classroomToEdit.homeroom_teacher_id)
          : "",
      });
    } else {
      reset({
        name: "",
        grade_level: "Grade 10",
        academic_year: "2026-2027",
        homeroom_teacher_id: "",
      });
    }
  }, [classroomToEdit, isOpen, reset]);

  const mutation = useMutation({
    mutationFn: async (data: ClassroomFormData) => {
      const payload = {
        ...data,
        homeroom_teacher_id: data.homeroom_teacher_id ? Number(data.homeroom_teacher_id) : null,
      };
      if (classroomToEdit) {
        return apiClient.put(`/admin/classrooms/${classroomToEdit.id}`, payload);
      }
      return apiClient.post("/admin/classrooms", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-classrooms"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
      toast.success(classroomToEdit ? "Classroom updated" : "Classroom created successfully");
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to save classroom");
    },
  });

  const onSubmit = (data: ClassroomFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={classroomToEdit ? "Edit Classroom" : "Create New Classroom"}
      description="Define class division and designate a homeroom educator."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <div className="space-y-1.5">
          <Label htmlFor="c-name" className="text-xs font-medium">Classroom Name *</Label>
          <Input id="c-name" placeholder="e.g. Grade 10 - C" {...register("name")} className="h-8.5 text-xs" />
          {errors.name && <p className="text-xs text-rose-600">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="grade_level" className="text-xs font-medium">Grade Level *</Label>
            <Input id="grade_level" placeholder="Grade 10" {...register("grade_level")} className="h-8.5 text-xs" />
            {errors.grade_level && (
              <p className="text-xs text-rose-600">{errors.grade_level.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="academic_year" className="text-xs font-medium">Academic Year *</Label>
            <Input id="academic_year" placeholder="2026-2027" {...register("academic_year")} className="h-8.5 text-xs font-mono" />
            {errors.academic_year && (
              <p className="text-xs text-rose-600">{errors.academic_year.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="homeroom_teacher_id" className="text-xs font-medium">Designated Homeroom Teacher</Label>
          <div className="relative">
            <select
              id="homeroom_teacher_id"
              {...register("homeroom_teacher_id")}
              className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-1.5 pr-8 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="">None / Unassigned</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={mutation.isPending} className="text-xs">
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={mutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Classroom"
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
