import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { SidebarNav } from "./SidebarNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  School,
  Sparkles,
  Sun,
  Moon,
  Calendar,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Role } from "@/types/auth";

export const AppShell: React.FC = () => {
  const { user, role, logout, demoLogin, isLoading } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleRoleQuickSwitch = async (targetRole: Role) => {
    try {
      const u = await demoLogin(targetRole);
      if (u.role === "admin") navigate("/admin");
      else if (u.role === "teacher") navigate("/teacher");
      else navigate("/student");
    } catch {
      // Toast is handled in AuthContext
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getRoleBadgeClasses = (r: Role | null) => {
    switch (r) {
      case "admin":
        return "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800";
      case "teacher":
        return "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800";
      case "student":
        return "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
    }
  };

  const getUserInitials = (name?: string) => {
    if (!name) return "AC";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 print:h-auto print:overflow-visible print:bg-white">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col bg-slate-950 text-slate-200 border-r border-slate-800/80 md:flex print:hidden">
        {/* Brand Header - Solid indigo badge, no gradients */}
        <div className="flex h-16 items-center gap-3 px-5 border-b border-slate-800/80">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-white">
                Academia
              </span>
              <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                PRO
              </span>
            </div>
            <p className="truncate text-[11px] font-medium text-slate-400 capitalize">
              {role ?? "Academic"} Workspace
            </p>
          </div>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto py-2">
          <SidebarNav />
        </div>

        {/* 1-Click Demo Reviewer Quick Switcher (Docked in Sidebar) */}
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-950">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-400" /> Demo Switcher
            </span>
            <span className="text-[10px] text-slate-500 font-medium">1-Click</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              disabled={isLoading || role === "admin"}
              onClick={() => handleRoleQuickSwitch("admin")}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[11px] font-semibold transition-all ${
                role === "admin"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 mb-0.5" />
              <span>Admin</span>
            </button>

            <button
              type="button"
              disabled={isLoading || role === "teacher"}
              onClick={() => handleRoleQuickSwitch("teacher")}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[11px] font-semibold transition-all ${
                role === "teacher"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <School className="h-3.5 w-3.5 mb-0.5" />
              <span>Teacher</span>
            </button>

            <button
              type="button"
              disabled={isLoading || role === "student"}
              onClick={() => handleRoleQuickSwitch("student")}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[11px] font-semibold transition-all ${
                role === "student"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5 mb-0.5" />
              <span>Student</span>
            </button>
          </div>
        </div>

        {/* User Footer Profile */}
        <div className="flex items-center justify-between border-t border-slate-800/80 p-3 bg-slate-900/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 font-bold text-xs text-slate-200">
              {getUserInitials(user?.name)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">
                {user?.name || "Academic User"}
              </p>
              <p className="truncate text-[10px] text-slate-400">
                {user?.email || "user@school.test"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            aria-label="Log out"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex w-72 flex-col bg-slate-950 text-slate-200 border-r border-slate-800">
            <div className="flex h-16 items-center justify-between px-5 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <span className="text-sm font-bold text-white">Academia Pro</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
              <SidebarNav onItemClick={() => setMobileOpen(false)} />
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Quick Demo Switcher
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    handleRoleQuickSwitch("admin");
                    setMobileOpen(false);
                  }}
                  className={`text-xs ${role === "admin" ? "bg-purple-600 text-white border-purple-600" : "bg-transparent text-slate-200 border-slate-800"}`}
                >
                  Admin
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    handleRoleQuickSwitch("teacher");
                    setMobileOpen(false);
                  }}
                  className={`text-xs ${role === "teacher" ? "bg-blue-600 text-white border-blue-600" : "bg-transparent text-slate-200 border-slate-800"}`}
                >
                  Teacher
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    handleRoleQuickSwitch("student");
                    setMobileOpen(false);
                  }}
                  className={`text-xs ${role === "student" ? "bg-emerald-600 text-white border-emerald-600" : "bg-transparent text-slate-200 border-slate-800"}`}
                >
                  Student
                </Button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden print:overflow-visible">
        {/* Top Header Navbar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white dark:bg-slate-900 dark:border-slate-800 px-4 sm:px-8 shadow-xs print:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open sidebar navigation"
              aria-expanded={mobileOpen}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 sm:text-lg">
                {getGreeting()}, {user?.name ? user.name.split(" ")[0] : "Scholar"}
              </h2>
              <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hidden sm:flex">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>
                  Academic Year 2026–2027 • {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </span>
              </p>
            </div>
          </div>

          {/* Right Header: Role Switcher & Utilities */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Top Quick Role Switcher Buttons */}
            <div className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200/80 dark:border-slate-700">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-2">Role:</span>
              <button
                type="button"
                disabled={isLoading || role === "admin"}
                onClick={() => handleRoleQuickSwitch("admin")}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                  role === "admin"
                    ? "bg-purple-600 text-white font-semibold cursor-default"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700"
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                disabled={isLoading || role === "teacher"}
                onClick={() => handleRoleQuickSwitch("teacher")}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                  role === "teacher"
                    ? "bg-blue-600 text-white font-semibold cursor-default"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700"
                }`}
              >
                Teacher
              </button>
              <button
                type="button"
                disabled={isLoading || role === "student"}
                onClick={() => handleRoleQuickSwitch("student")}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                  role === "student"
                    ? "bg-emerald-600 text-white font-semibold cursor-default"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700"
                }`}
              >
                Student
              </button>
            </div>

            <Badge variant="outline" className={`capitalize font-semibold text-xs px-2.5 py-0.5 border ${getRoleBadgeClasses(role)}`}>
              {role}
            </Badge>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              aria-label="Toggle dark theme"
              className="rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
            >
              {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-950/40 rounded-lg"
            >
              <LogOut className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline text-xs font-medium">Exit</span>
            </Button>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 print:overflow-visible print:p-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
