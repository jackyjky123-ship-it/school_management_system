import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { LoginPage } from "@/features/auth/LoginPage";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { Toaster } from "@/components/ui/sonner";

// Admin Pages
import {
  AdminDashboardPage,
  ClassroomsManagementPage,
  SubjectsManagementPage,
  TeachersManagementPage,
  StudentsManagementPage,
} from "@/features/admin";

// Teacher Pages
import {
  TeacherDashboardPage,
  DailyAttendancePage,
  BulkGradingPage,
} from "@/features/teacher";

// Student Pages
import {
  StudentDashboardPage,
  StudentReportCardPage,
  StudentAttendancePage,
} from "@/features/student";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const RootRedirect = () => {
  const { user, role, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (role === "admin") return <Navigate to="/admin" replace />;
  if (role === "teacher") return <Navigate to="/teacher" replace />;
  return <Navigate to="/student" replace />;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth */}
            <Route path="/login" element={<LoginPage />} />

            {/* Root Dispatcher */}
            <Route path="/" element={<RootRedirect />} />

            {/* Admin Portal */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/admin" element={<AppShell />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="classrooms" element={<ClassroomsManagementPage />} />
                <Route path="subjects" element={<SubjectsManagementPage />} />
                <Route path="teachers" element={<TeachersManagementPage />} />
                <Route path="students" element={<StudentsManagementPage />} />
              </Route>
            </Route>

            {/* Teacher Portal */}
            <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
              <Route path="/teacher" element={<AppShell />}>
                <Route index element={<TeacherDashboardPage />} />
                <Route path="attendance" element={<DailyAttendancePage />} />
                <Route path="grades" element={<BulkGradingPage />} />
              </Route>
            </Route>

            {/* Student Portal */}
            <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
              <Route path="/student" element={<AppShell />}>
                <Route index element={<StudentDashboardPage />} />
                <Route path="report-card" element={<StudentReportCardPage />} />
                <Route path="attendance" element={<StudentAttendancePage />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}
