import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/types/auth";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    // Redirect to the default dashboard for their role, or login if invalid
    if (role === "admin") return <Navigate to="/admin" replace />;
    if (role === "teacher") return <Navigate to="/teacher" replace />;
    if (role === "student") return <Navigate to="/student" replace />;
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
