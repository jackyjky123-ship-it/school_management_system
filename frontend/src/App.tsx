import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { LoginPage } from "@/features/auth/LoginPage";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import {
  AdminDashboardPage,
  ClassroomsManagementPage,
  SubjectsManagementPage,
  TeachersManagementPage,
  StudentsManagementPage,
} from "@/features/admin";
import {
  TeacherDashboardPage,
  DailyAttendancePage,
  BulkGradingPage,
} from "@/features/teacher";
import {
  StudentDashboardPage,
  StudentReportCardPage,
  StudentAttendancePage,
} from "@/features/student";

const RootRedirect: React.FC = () => {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!user || !role) {
    return <Navigate to="/login" replace />;
  }

  if (role === "admin") return <Navigate to="/admin" replace />;
  if (role === "teacher") return <Navigate to="/teacher" replace />;
  return <Navigate to="/student" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AppShell />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="classrooms" element={<ClassroomsManagementPage />} />
              <Route path="subjects" element={<SubjectsManagementPage />} />
              <Route path="teachers" element={<TeachersManagementPage />} />
              <Route path="students" element={<StudentsManagementPage />} />
            </Route>
          </Route>

          {/* Teacher Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
            <Route path="/teacher" element={<AppShell />}>
              <Route index element={<TeacherDashboardPage />} />
              <Route path="attendance" element={<DailyAttendancePage />} />
              <Route path="grades" element={<BulkGradingPage />} />
            </Route>
          </Route>

          {/* Student Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
            <Route path="/student" element={<AppShell />}>
              <Route index element={<StudentDashboardPage />} />
              <Route path="report-card" element={<StudentReportCardPage />} />
              <Route path="attendance" element={<StudentAttendancePage />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
