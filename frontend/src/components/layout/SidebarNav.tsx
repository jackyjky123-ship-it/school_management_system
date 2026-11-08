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
  Calendar,
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
    { title: "Teaching Schedule", href: "/teacher/schedule", icon: Calendar },
    { title: "Daily Roll Call", href: "/teacher/attendance", icon: ClipboardCheck },
    { title: "Bulk Grading", href: "/teacher/grades", icon: Award },
  ];

  const studentNav: NavItem[] = [
    { title: "Academic Overview", href: "/student", icon: LayoutDashboard },
    { title: "Class Timetable", href: "/student/schedule", icon: Calendar },
    { title: "Report Card", href: "/student/report-card", icon: Award },
    { title: "Attendance Log", href: "/student/attendance", icon: CalendarCheck },
  ];

  const items = role === "admin" ? adminNav : role === "teacher" ? teacherNav : studentNav;

  return (
    <nav className="space-y-1 px-3 py-3" aria-label="Sidebar navigation">
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
                "group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "bg-indigo-600 text-white font-semibold"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white"
              )
            }
          >
            <div className="flex items-center gap-2.5">
              <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" />
              <span>{item.title}</span>
            </div>
            {item.badge && (
              <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300 tabular-nums">
                {item.badge}
              </span>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};
