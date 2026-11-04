export type Role = "admin" | "teacher" | "student";

export interface UserProfile {
  type: Role;
  employee_code?: string;
  specialization?: string;
  phone?: string;
  student_code?: string;
  classroom_id?: number;
  classroom?: string;
  gender?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  is_active: boolean;
  profile?: UserProfile | null;
  created_at?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
  errors?: Record<string, string[]>;
}

export interface AuthData {
  token: string;
  token_type: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}
