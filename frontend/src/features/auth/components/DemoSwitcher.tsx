import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, GraduationCap, School } from "lucide-react";
import { Role } from "@/types/auth";

export const DemoSwitcher: React.FC = () => {
  const { demoLogin, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleDemoClick = async (role: Role) => {
    try {
      const user = await demoLogin(role);
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "teacher") navigate("/teacher");
      else navigate("/student");
    } catch {
      // Toast is handled in AuthContext
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/50 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/20">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
          Portfolio Reviewer 1-Click Access
        </span>
        <Badge variant="outline" className="border-indigo-300 text-indigo-700 dark:border-indigo-800 dark:text-indigo-300">
          Instant Demo
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={() => handleDemoClick("admin")}
          className="flex h-auto flex-col items-center justify-center gap-1 border-indigo-200 bg-white py-2 hover:bg-indigo-50 dark:border-indigo-800 dark:bg-slate-900 dark:hover:bg-indigo-950"
        >
          <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-100">
            <ShieldCheck className="h-4 w-4 text-purple-600" />
            <span>Admin</span>
          </div>
          <span className="text-[10px] text-slate-700 dark:text-slate-400">Full School Control</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={() => handleDemoClick("teacher")}
          className="flex h-auto flex-col items-center justify-center gap-1 border-indigo-200 bg-white py-2 hover:bg-indigo-50 dark:border-indigo-800 dark:bg-slate-900 dark:hover:bg-indigo-950"
        >
          <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-100">
            <School className="h-4 w-4 text-blue-600" />
            <span>Teacher</span>
          </div>
          <span className="text-[10px] text-slate-700 dark:text-slate-400">Roll Call & Grading</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={() => handleDemoClick("student")}
          className="flex h-auto flex-col items-center justify-center gap-1 border-indigo-200 bg-white py-2 hover:bg-indigo-50 dark:border-indigo-800 dark:bg-slate-900 dark:hover:bg-indigo-950"
        >
          <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-100">
            <GraduationCap className="h-4 w-4 text-emerald-600" />
            <span>Student</span>
          </div>
          <span className="text-[10px] text-slate-700 dark:text-slate-400">Report Card & GPA</span>
        </Button>
      </div>
    </div>
  );
};
