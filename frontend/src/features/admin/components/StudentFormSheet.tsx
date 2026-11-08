import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
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
    setValue,
    watch,
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

  const selectedGender = watch("gender");
  const selectedClassroomId = watch("classroom_id");
  const defaultClassroomId = classrooms[0] ? String(classrooms[0].id) : "";

  useEffect(() => {
    if (!isOpen) return;

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
        classroom_id: defaultClassroomId,
        gender: "male",
        date_of_birth: "2010-01-15",
        guardian_name: "",
        guardian_phone: "",
        address: "",
      });
    }
  }, [studentToEdit, isOpen, reset, defaultClassroomId]);

  const mutation = useMutation({
    mutationFn: async (data: StudentFormData) => {
      const payload = {
        ...data,
        classroom_id: Number(data.classroom_id),
        date_of_birth: data.date_of_birth || null,
        guardian_name: data.guardian_name?.trim() || null,
        guardian_phone: data.guardian_phone?.trim() || null,
        address: data.address?.trim() || null,
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs font-medium">Full Name *</Label>
          <Input id="name" placeholder="e.g. John Doe" {...register("name")} className="h-8.5 text-xs" />
          {errors.name && <p className="text-xs text-rose-600">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-medium">Email Address *</Label>
          <Input id="email" type="email" placeholder="john.doe@school.test" {...register("email")} className="h-8.5 text-xs" />
          {errors.email && <p className="text-xs text-rose-600">{errors.email.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="student_code" className="text-xs font-medium">Student Code *</Label>
            <Input id="student_code" {...register("student_code")} className="h-8.5 text-xs font-mono" />
            {errors.student_code && (
              <p className="text-xs text-rose-600">{errors.student_code.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gender" className="text-xs font-medium">Gender *</Label>
            <Select
              value={selectedGender}
              onValueChange={(val) => setValue("gender", val as "male" | "female" | "other")}
            >
              <SelectTrigger className="h-8.5 text-xs">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="classroom_id" className="text-xs font-medium">Classroom Allocation *</Label>
          <Select
            value={selectedClassroomId}
            onValueChange={(val) => setValue("classroom_id", val, { shouldValidate: true })}
          >
            <SelectTrigger className="h-8.5 text-xs">
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
          {errors.classroom_id && (
            <p className="text-xs text-rose-600">{errors.classroom_id.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="date_of_birth" className="text-xs font-medium">Date of Birth</Label>
          <Input id="date_of_birth" type="date" {...register("date_of_birth")} className="h-8.5 text-xs font-mono" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="guardian_name" className="text-xs font-medium">Guardian Name</Label>
            <Input id="guardian_name" placeholder="Parent / Guardian" {...register("guardian_name")} className="h-8.5 text-xs" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="guardian_phone" className="text-xs font-medium">Guardian Phone</Label>
            <Input id="guardian_phone" placeholder="+1-555-..." {...register("guardian_phone")} className="h-8.5 text-xs font-mono" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address" className="text-xs font-medium">Address</Label>
          <Input id="address" placeholder="Residential address" {...register("address")} className="h-8.5 text-xs" />
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
              "Save Student"
            )}
          </Button>
        </div>
      </form>
    </Sheet>
  );
};
