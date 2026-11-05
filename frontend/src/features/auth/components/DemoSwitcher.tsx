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
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Instant Demo Access
        </span>
        <Badge variant="outline" className="border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 text-[11px]">
          1-Click Switch
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={() => handleDemoClick("admin")}
          className="flex h-auto flex-col items-center justify-center gap-1 border-slate-200 bg-white py-2.5 hover:bg-purple-50 hover:border-purple-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-purple-950/40 transition-colors"
        >
          <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100 text-xs">
            <ShieldCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span>Administrator</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">School Command</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={() => handleDemoClick("teacher")}
          className="flex h-auto flex-col items-center justify-center gap-1 border-slate-200 bg-white py-2.5 hover:bg-blue-50 hover:border-blue-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-blue-950/40 transition-colors"
        >
          <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100 text-xs">
            <School className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Teacher</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Roll Call & Grading</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={() => handleDemoClick("student")}
          className="flex h-auto flex-col items-center justify-center gap-1 border-slate-200 bg-white py-2.5 hover:bg-emerald-50 hover:border-emerald-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-emerald-950/40 transition-colors"
        >
          <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100 text-xs">
            <GraduationCap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Student</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Report Card & GPA</span>
        </Button>
      </div>
    </div>
  );
};
