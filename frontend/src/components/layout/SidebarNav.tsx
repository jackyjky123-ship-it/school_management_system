import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  School,
  BookOpen,
  Users,
  GraduationCap,
  ClipboardCheck,
  Award,
  CalendarCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

export const SidebarNav: React.FC<{ onItemClick?: () => void }> = ({ onItemClick }) => {
  const { role } = useAuth();

  const adminNav: NavItem[] = [
    { title: "Overview", href: "/admin", icon: LayoutDashboard },
    { title: "Classrooms", href: "/admin/classrooms", icon: School },
    { title: "Subjects", href: "/admin/subjects", icon: BookOpen },
    { title: "Teachers", href: "/admin/teachers", icon: Users },
    { title: "Students", href: "/admin/students", icon: GraduationCap },
  ];

  const teacherNav: NavItem[] = [
    { title: "Dashboard", href: "/teacher", icon: LayoutDashboard },
    { title: "Daily Roll Call", href: "/teacher/attendance", icon: ClipboardCheck },
    { title: "Bulk Grading", href: "/teacher/grades", icon: Award },
  ];

  const studentNav: NavItem[] = [
    { title: "Overview", href: "/student", icon: LayoutDashboard },
    { title: "Report Card", href: "/student/report-card", icon: Award },
    { title: "Attendance Log", href: "/student/attendance", icon: CalendarCheck },
  ];

  const items = role === "admin" ? adminNav : role === "teacher" ? teacherNav : studentNav;

  return (
    <nav className="space-y-1.5 px-3 py-4">
      <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        Navigation
      </div>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === "/admin" || item.href === "/teacher" || item.href === "/student"}
            onClick={onItemClick}
            className={({ isActive }) =>
              cn(
                "group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              )
            }
          >
            <div className="flex items-center gap-3">
              <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
              <span>{item.title}</span>
            </div>
            {item.badge && (
              <span className="rounded-full bg-indigo-500/30 px-2 py-0.5 text-[10px] font-semibold text-indigo-200">
                {item.badge}
              </span>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};
