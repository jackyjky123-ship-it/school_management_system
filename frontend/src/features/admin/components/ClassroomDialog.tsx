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
import { Loader2 } from "lucide-react";

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
  }, [classroomToEdit, reset]);

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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="c-name">Classroom Name *</Label>
          <Input id="c-name" placeholder="e.g. Grade 10 - C" {...register("name")} />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="grade_level">Grade Level *</Label>
            <Input id="grade_level" placeholder="Grade 10" {...register("grade_level")} />
            {errors.grade_level && (
              <p className="text-xs text-red-500">{errors.grade_level.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="academic_year">Academic Year *</Label>
            <Input id="academic_year" placeholder="2026-2027" {...register("academic_year")} />
            {errors.academic_year && (
              <p className="text-xs text-red-500">{errors.academic_year.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="homeroom_teacher_id">Designated Homeroom Teacher</Label>
          <select
            id="homeroom_teacher_id"
            {...register("homeroom_teacher_id")}
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <option value="">None / Unassigned</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
