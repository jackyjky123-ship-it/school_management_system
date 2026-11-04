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

const studentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please provide a valid email"),
  student_code: z.string().min(3, "Student ID code is required"),
  classroom_id: z.string().min(1, "Please select a classroom"),
  gender: z.enum(["male", "female", "other"]),
  date_of_birth: z.string().optional(),
  guardian_name: z.string().optional(),
  guardian_phone: z.string().optional(),
  address: z.string().optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  studentToEdit?: any | null;
  classrooms: Array<{ id: number; name: string }>;
}

export const StudentFormSheet: React.FC<StudentFormSheetProps> = ({
  isOpen,
  onClose,
  studentToEdit,
  classrooms,
}) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: "",
      email: "",
      student_code: "",
      classroom_id: "",
      gender: "male",
      date_of_birth: "",
      guardian_name: "",
      guardian_phone: "",
      address: "",
    },
  });

  useEffect(() => {
    if (studentToEdit) {
      reset({
        name: studentToEdit.name || "",
        email: studentToEdit.email || "",
        student_code: studentToEdit.student_code || "",
        classroom_id: studentToEdit.classroom_id ? String(studentToEdit.classroom_id) : "",
        gender: studentToEdit.gender || "male",
        date_of_birth: studentToEdit.date_of_birth || "",
        guardian_name: studentToEdit.guardian_name || "",
        guardian_phone: studentToEdit.guardian_phone || "",
        address: studentToEdit.address || "",
      });
    } else {
      reset({
        name: "",
        email: "",
        student_code: `STD-${Math.floor(1000 + Math.random() * 9000)}`,
        classroom_id: classrooms[0] ? String(classrooms[0].id) : "",
        gender: "male",
        date_of_birth: "2010-01-15",
        guardian_name: "",
        guardian_phone: "",
        address: "",
      });
    }
  }, [studentToEdit, reset, classrooms]);

  const mutation = useMutation({
    mutationFn: async (data: StudentFormData) => {
      const payload = {
        ...data,
        classroom_id: Number(data.classroom_id),
      };
      if (studentToEdit) {
        return apiClient.put(`/admin/students/${studentToEdit.id}`, payload);
      }
      return apiClient.post("/admin/students", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
      toast.success(
        studentToEdit ? "Student updated successfully" : "Student enrolled successfully"
      );
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to save student record");
    },
  });

  const onSubmit = (data: StudentFormData) => {
    mutation.mutate(data);
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={studentToEdit ? "Edit Student Details" : "Enroll New Student"}
      description="Enter the student's personal information and classroom allocation."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full Name *</Label>
          <Input id="name" placeholder="e.g. John Doe" {...register("name")} />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email Address *</Label>
          <Input id="email" type="email" placeholder="john.doe@school.test" {...register("email")} />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="student_code">Student Code *</Label>
            <Input id="student_code" {...register("student_code")} />
            {errors.student_code && (
              <p className="text-xs text-red-500">{errors.student_code.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gender">Gender *</Label>
            <select
              id="gender"
              {...register("gender")}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="classroom_id">Classroom Allocation *</Label>
          <select
            id="classroom_id"
            {...register("classroom_id")}
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <option value="">Select a classroom...</option>
            {classrooms.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.classroom_id && (
            <p className="text-xs text-red-500">{errors.classroom_id.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="date_of_birth">Date of Birth</Label>
          <Input id="date_of_birth" type="date" {...register("date_of_birth")} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="guardian_name">Guardian Name</Label>
            <Input id="guardian_name" placeholder="Parent / Guardian" {...register("guardian_name")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="guardian_phone">Guardian Phone</Label>
            <Input id="guardian_phone" placeholder="+1-555-..." {...register("guardian_phone")} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address">Address</Label>
          <Input id="address" placeholder="Residential address" {...register("address")} />
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
              "Save Student"
            )}
          </Button>
        </div>
      </form>
    </Sheet>
  );
};
