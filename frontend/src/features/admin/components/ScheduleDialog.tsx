import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog } from "@/components/ui/dialog";
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
import { Schedule } from "@/types/academic";

const scheduleSchema = z.object({
  subject_id: z.string().optional(),
  teacher_id: z.string().min(1, "Teacher is required"),
  term: z.string().min(1, "Academic term is required"),
  day_of_week: z.enum([
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ]),
  start_time: z.string().min(4, "Start time is required"),
  end_time: z.string().min(4, "End time is required"),
  room: z.string().optional(),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

interface ScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  classroomId: number;
  scheduleToEdit?: Schedule | null;
  subjects: Array<{ id: number; name: string; teacher?: { id: number; name: string } | null }>;
  teachers: Array<{ id: number; name: string }>;
}

export const ScheduleDialog: React.FC<ScheduleDialogProps> = ({
  isOpen,
  onClose,
  classroomId,
  scheduleToEdit,
  subjects,
  teachers,
}) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      subject_id: "none",
      teacher_id: "",
      term: "Semester 1",
      day_of_week: "monday",
      start_time: "08:00",
      end_time: "09:30",
      room: "",
    },
  });

  const selectedSubjectId = watch("subject_id");
  const selectedTeacherId = watch("teacher_id");
  const selectedDayOfWeek = watch("day_of_week");

  useEffect(() => {
    if (scheduleToEdit) {
      reset({
        subject_id: scheduleToEdit.subject_id ? String(scheduleToEdit.subject_id) : "none",
        teacher_id: String(scheduleToEdit.teacher_id),
        term: scheduleToEdit.term || "Semester 1",
        day_of_week: scheduleToEdit.day_of_week,
        start_time: scheduleToEdit.start_time.substring(0, 5),
        end_time: scheduleToEdit.end_time.substring(0, 5),
        room: scheduleToEdit.room || "",
      });
    } else {
      reset({
        subject_id: "none",
        teacher_id: teachers.length > 0 ? String(teachers[0].id) : "",
        term: "Semester 1",
        day_of_week: "monday",
        start_time: "08:00",
        end_time: "09:30",
        room: "",
      });
    }
  }, [scheduleToEdit, isOpen, reset, teachers]);

  const mutation = useMutation({
    mutationFn: async (data: ScheduleFormData) => {
      const payload = {
        classroom_id: classroomId,
        subject_id: data.subject_id && data.subject_id !== "none" ? Number(data.subject_id) : null,
        teacher_id: Number(data.teacher_id),
        term: data.term,
        day_of_week: data.day_of_week,
        start_time: data.start_time,
        end_time: data.end_time,
        room: data.room || null,
      };

      if (scheduleToEdit) {
        return apiClient.put(`/admin/schedules/${scheduleToEdit.id}`, payload);
      }
      return apiClient.post("/admin/schedules", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classroom-hub", String(classroomId)] });
      queryClient.invalidateQueries({ queryKey: ["admin-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-schedule"] });
      toast.success(
        scheduleToEdit
          ? "Timetable slot updated successfully"
          : "Timetable slot scheduled successfully"
      );
      onClose();
    },
    onError: (err: any) => {
      const errRes = err.response?.data;
      if (errRes?.errors) {
        const firstErrorKey = Object.keys(errRes.errors)[0];
        toast.error(errRes.errors[firstErrorKey][0]);
      } else {
        toast.error(errRes?.message || "Failed to save timetable slot");
      }
    },
  });

  const onSubmit = (data: ScheduleFormData) => {
    mutation.mutate(data);
  };

  const handleSubjectChange = (val: string) => {
    setValue("subject_id", val);
    if (val !== "none") {
      const sub = subjects.find((s) => String(s.id) === val);
      if (sub?.teacher?.id) {
        setValue("teacher_id", String(sub.teacher.id));
      }
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={scheduleToEdit ? "Edit Timetable Slot" : "Add Timetable Slot"}
      description="Configure subject, instructor, and timing for this classroom's weekly schedule."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <div className="space-y-1.5">
          <Label htmlFor="subject_id">Subject / Class Type</Label>
          <Select value={selectedSubjectId} onValueChange={handleSubjectChange}>
            <SelectTrigger id="subject_id">
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Homeroom / Advisory Period</SelectItem>
              {subjects.map((sub) => (
                <SelectItem key={sub.id} value={String(sub.id)}>
                  {sub.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="teacher_id">Assigned Instructor *</Label>
          <Select
            value={selectedTeacherId}
            onValueChange={(val) => setValue("teacher_id", val)}
          >
            <SelectTrigger id="teacher_id">
              <SelectValue placeholder="Select teacher" />
            </SelectTrigger>
            <SelectContent>
              {teachers.map((t) => (
                <SelectItem key={t.id} value={String(t.id)}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.teacher_id && (
            <p className="text-xs text-rose-600">{errors.teacher_id.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="term">Academic Term</Label>
            <Input id="term" {...register("term")} placeholder="Semester 1" />
            {errors.term && (
              <p className="text-xs text-rose-600">{errors.term.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="day_of_week">Day of Week *</Label>
            <Select
              value={selectedDayOfWeek}
              onValueChange={(val: any) => setValue("day_of_week", val)}
            >
              <SelectTrigger id="day_of_week">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monday">Monday</SelectItem>
                <SelectItem value="tuesday">Tuesday</SelectItem>
                <SelectItem value="wednesday">Wednesday</SelectItem>
                <SelectItem value="thursday">Thursday</SelectItem>
                <SelectItem value="friday">Friday</SelectItem>
                <SelectItem value="saturday">Saturday</SelectItem>
                <SelectItem value="sunday">Sunday</SelectItem>
              </SelectContent>
            </Select>
            {errors.day_of_week && (
              <p className="text-xs text-rose-600">{errors.day_of_week.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="start_time">Start Time *</Label>
            <Input id="start_time" type="time" {...register("start_time")} />
            {errors.start_time && (
              <p className="text-xs text-rose-600">{errors.start_time.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="end_time">End Time *</Label>
            <Input id="end_time" type="time" {...register("end_time")} />
            {errors.end_time && (
              <p className="text-xs text-rose-600">{errors.end_time.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="room">Assigned Room / Facility (Optional)</Label>
          <Input id="room" {...register("room")} placeholder="e.g. Room 204 or Science Lab A" />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {scheduleToEdit ? "Save Changes" : "Create Slot"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
