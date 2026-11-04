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
  ShieldAlert,
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
      // Toast handled
    }
  };

  const getRoleBadgeVariant = () => {
    switch (role) {
      case "admin":
        return "default";
      case "teacher":
        return "secondary";
      case "student":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-slate-200 px-6 dark:border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Academia SMS
            </h2>
            <p className="text-[11px] font-medium text-slate-400 capitalize">{role} Portal</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <SidebarNav />
        </div>

        {/* Demo Fast Switcher in Desktop Sidebar */}
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase text-slate-400">
              Quick Switch Role
            </span>
            <ShieldAlert className="h-3.5 w-3.5 text-indigo-500" />
          </div>
          <div className="flex gap-1">
            <Button
              variant={role === "admin" ? "default" : "outline"}
              size="xs"
              disabled={isLoading || role === "admin"}
              onClick={() => handleRoleQuickSwitch("admin")}
              className="flex-1 text-[11px]"
            >
              Admin
            </Button>
            <Button
              variant={role === "teacher" ? "default" : "outline"}
              size="xs"
              disabled={isLoading || role === "teacher"}
              onClick={() => handleRoleQuickSwitch("teacher")}
              className="flex-1 text-[11px]"
            >
              Teacher
            </Button>
            <Button
              variant={role === "student" ? "default" : "outline"}
              size="xs"
              disabled={isLoading || role === "student"}
              onClick={() => handleRoleQuickSwitch("student")}
              className="flex-1 text-[11px]"
            >
              Student
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex w-64 flex-col bg-white dark:bg-slate-900">
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-indigo-600" />
                <span className="font-bold">Academia SMS</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarNav onItemClick={() => setMobileOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-base font-semibold text-slate-800 dark:text-slate-200">
              School Management System
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 text-right sm:flex">
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {user?.name}
                </p>
                <p className="text-[11px] text-slate-400">{user?.email}</p>
              </div>
              <Badge variant={getRoleBadgeVariant()} className="uppercase">
                {role}
              </Badge>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="gap-1.5 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
