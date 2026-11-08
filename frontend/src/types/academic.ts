export type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export interface Schedule {
  id: number;
  classroom_id: number;
  classroom_name?: string;
  grade_level?: string;
  academic_year?: string;
  subject_id: number | null;
  subject_name?: string;
  subject_code?: string;
  teacher_id: number;
  teacher_name?: string;
  teacher_email?: string;
  term: string;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  room?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ClassroomHubData {
  classroom: {
    id: number;
    name: string;
    grade_level: string;
    academic_year: string;
    homeroom_teacher: {
      id: number;
      name: string;
      email: string;
      specialization: string;
    } | null;
  };
  counts: {
    students: number;
    subjects: number;
    schedules: number;
  };
  students: Array<{
    id: number;
    user_id: number;
    name: string;
    email: string;
    student_code: string;
    gender?: string | null;
  }>;
  subjects: Array<{
    id: number;
    name: string;
    code: string;
    teacher: {
      id: number;
      name: string;
      email: string;
    } | null;
  }>;
  schedules: Schedule[];
  attendance_stats: {
    total_sessions_recorded: number;
    total_records: number;
    attendance_rate: number;
    present_count: number;
    late_count: number;
    absent_count: number;
    excused_count: number;
  };
}

export interface AttendanceHistoryItem {
  date: string;
  subject_id: number | null;
  subject_name: string;
  subject_code?: string;
  schedule_id: number | null;
  total_students: number;
  present_count: number;
  late_count: number;
  absent_count: number;
  excused_count: number;
  attendance_rate: number;
  recorded_by_name: string;
  recorded_at?: string;
}
