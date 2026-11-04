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
} from "lucide-react";
import { Role } from "@/types/auth";

export const AppShell: React.FC = () => {
  const { user, role, logout, demoLogin, isLoading } = useAuth();
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

  const getRoleColor = (r: Role | null) => {
    switch (r) {
      case "admin":
        return "bg-purple-500/10 text-purple-600 border-purple-200";
      case "teacher":
        return "bg-blue-500/10 text-blue-600 border-blue-200";
      case "student":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc] text-slate-800">
      {/* Desktop Sidebar - Dark aesthetic matching design_ref.png */}
      <aside className="hidden w-64 flex-col bg-[#111218] text-slate-200 md:flex">
        {/* Brand Header */}
        <div className="flex h-18 items-center gap-3 px-6 border-b border-white/5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-500/25">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              Academia <span className="text-[10px] font-semibold tracking-wider text-indigo-400 uppercase bg-indigo-500/20 px-1.5 py-0.5 rounded">Pro</span>
            </h1>
            <p className="text-[11px] text-slate-400 capitalize">{role} Workspace</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-2">
          <SidebarNav />
        </div>

        {/* 1-Click Demo Reviewer Quick Switcher (Docked in Sidebar) */}
        <div className="p-4 border-t border-white/5 bg-[#0d0e13]">
          <div className="mb-2.5 flex items-center justify-between">
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
                  ? "bg-purple-600 text-white shadow-sm"
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
                  ? "bg-blue-600 text-white shadow-sm"
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
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5 mb-0.5" />
              <span>Student</span>
            </button>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-white/5 bg-[#0a0b0e] flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300 font-semibold text-xs border border-indigo-500/30">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "US"}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{user?.name || "User"}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex w-72 flex-col bg-[#111218] text-slate-200">
            <div className="flex h-16 items-center justify-between px-6 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <span className="font-bold text-white">Academia Pro</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarNav onItemClick={() => setMobileOpen(false)} />
            </div>
            {/* Quick switcher in mobile drawer */}
            <div className="p-4 border-t border-white/10">
              <p className="text-xs font-medium text-slate-400 mb-2">Switch Demo Persona:</p>
              <div className="flex gap-1.5">
                <Button
                  size="xs"
                  variant={role === "admin" ? "default" : "outline"}
                  onClick={() => {
                    handleRoleQuickSwitch("admin");
                    setMobileOpen(false);
                  }}
                  className="flex-1 text-[11px]"
                >
                  Admin
                </Button>
                <Button
                  size="xs"
                  variant={role === "teacher" ? "default" : "outline"}
                  onClick={() => {
                    handleRoleQuickSwitch("teacher");
                    setMobileOpen(false);
                  }}
                  className="flex-1 text-[11px]"
                >
                  Teacher
                </Button>
                <Button
                  size="xs"
                  variant={role === "student" ? "default" : "outline"}
                  onClick={() => {
                    handleRoleQuickSwitch("student");
                    setMobileOpen(false);
                  }}
                  className="flex-1 text-[11px]"
                >
                  Student
                </Button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header Navbar */}
        <header className="flex h-18 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-4 sm:px-8 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                {getGreeting()}, {user?.name ? user.name.split(" ")[0] : "Scholar"}!
              </h2>
              <p className="text-xs text-slate-400 hidden sm:block">
                Academic Year 2026–2027 • {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
              </p>
            </div>
          </div>

          {/* Right Header: Fast Switcher & Profile Badge */}
          <div className="flex items-center gap-3">
            {/* Top Quick Role Switcher Buttons */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
              <span className="text-[11px] font-semibold text-slate-700 px-2">Role:</span>
              <button
                type="button"
                onClick={() => handleRoleQuickSwitch("admin")}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                  role === "admin"
                    ? "bg-purple-600 text-white shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white"
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleRoleQuickSwitch("teacher")}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                  role === "teacher"
                    ? "bg-blue-600 text-white shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white"
                }`}
              >
                Teacher
              </button>
              <button
                type="button"
                onClick={() => handleRoleQuickSwitch("student")}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                  role === "student"
                    ? "bg-emerald-600 text-white shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white"
                }`}
              >
                Student
              </button>
            </div>

            <Badge variant="outline" className={`capitalize font-semibold text-xs px-2.5 py-0.5 border ${getRoleColor(role)}`}>
              {role}
            </Badge>

            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
            >
              <LogOut className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline text-xs font-medium">Exit</span>
            </Button>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
