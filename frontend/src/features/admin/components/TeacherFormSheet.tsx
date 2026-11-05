import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { toLocalDateInputValue } from "@/lib/date";

const teacherSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please provide a valid email"),
  employee_code: z.string().min(3, "Employee ID is required"),
  specialization: z.string().min(2, "Department/Subject specialization is required"),
  phone: z.string().optional(),
  hire_date: z.string().optional(),
});

type TeacherFormData = z.infer<typeof teacherSchema>;

interface TeacherFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  teacherToEdit?: any | null;
}

export const TeacherFormSheet: React.FC<TeacherFormSheetProps> = ({
  isOpen,
  onClose,
  teacherToEdit,
}) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      name: "",
      email: "",
      employee_code: "",
      specialization: "",
      phone: "",
      hire_date: "",
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    if (teacherToEdit) {
      reset({
        name: teacherToEdit.name || "",
        email: teacherToEdit.email || "",
        employee_code: teacherToEdit.employee_code || "",
        specialization: teacherToEdit.specialization || "",
        phone: teacherToEdit.phone || "",
        hire_date: teacherToEdit.hire_date || "",
      });
    } else {
      reset({
        name: "",
        email: "",
        employee_code: `TCH-${Math.floor(100 + Math.random() * 900)}`,
        specialization: "",
        phone: "",
        hire_date: toLocalDateInputValue(),
      });
    }
  }, [teacherToEdit, isOpen, reset]);

  const mutation = useMutation({
    mutationFn: async (data: TeacherFormData) => {
      const payload = {
        ...data,
        phone: data.phone?.trim() || null,
        hire_date: data.hire_date || null,
      };
      if (teacherToEdit) {
        return apiClient.put(`/admin/teachers/${teacherToEdit.id}`, payload);
      }
      return apiClient.post("/admin/teachers", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-teachers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
      toast.success(
        teacherToEdit ? "Teacher profile updated" : "New faculty member appointed"
      );
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to save teacher record");
    },
  });

  const onSubmit = (data: TeacherFormData) => {
    mutation.mutate(data);
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={teacherToEdit ? "Edit Faculty Profile" : "Appoint New Teacher"}
      description="Enter educator credentials and academic department specialization."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs font-medium">Full Name *</Label>
          <Input id="name" placeholder="e.g. Dr. Robert Vance" {...register("name")} className="h-8.5 text-xs" />
          {errors.name && <p className="text-xs text-rose-600">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-medium">Work Email *</Label>
          <Input id="email" type="email" placeholder="faculty@school.test" {...register("email")} className="h-8.5 text-xs" />
          {errors.email && <p className="text-xs text-rose-600">{errors.email.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="employee_code" className="text-xs font-medium">Employee Code *</Label>
            <Input id="employee_code" {...register("employee_code")} className="h-8.5 text-xs font-mono" />
            {errors.employee_code && (
              <p className="text-xs text-rose-600">{errors.employee_code.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="hire_date" className="text-xs font-medium">Hire Date</Label>
            <Input id="hire_date" type="date" {...register("hire_date")} className="h-8.5 text-xs font-mono" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="specialization" className="text-xs font-medium">Academic Specialization *</Label>
          <Input
            id="specialization"
            placeholder="e.g. Mathematics, Organic Chemistry"
            {...register("specialization")}
            className="h-8.5 text-xs"
          />
          {errors.specialization && (
            <p className="text-xs text-rose-600">{errors.specialization.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-xs font-medium">Phone Contact</Label>
          <Input id="phone" placeholder="+1-555-..." {...register("phone")} className="h-8.5 text-xs font-mono" />
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
              "Save Faculty"
            )}
          </Button>
        </div>
      </form>
    </Sheet>
  );
};
