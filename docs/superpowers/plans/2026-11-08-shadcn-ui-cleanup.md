# Clean Up UI with Modern shadcn Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clean up and standardize the school management user interface by implementing standard shadcn UI components (`Table`, `Select`, `Avatar`, `Separator`) across the React 19 SPA, replacing ad-hoc HTML tables, raw selects, and manual styling with accessible, consistent, design-system primitives.

**Architecture:** We will extend the existing shadcn/base-nova component primitives in `frontend/src/components/ui/` with `@base-ui/react` and Tailwind CSS v4 tokens. Then we refactor all role-scoped pages (Admin, Teacher, Student, Auth, and Layout) to consume these clean, unified primitives.

**Tech Stack:** React 19, TypeScript 5.9, Vite 8, Tailwind CSS v4 (`@tailwindcss/vite`), `@base-ui/react`, Lucide Icons, TanStack Query v5.

**Spec:** Standard shadcn component design system adhering to the existing `components.json` ("base-nova" style) with clean spacing, accessible focus states, tabular numbers, and full dark-mode support.

## Global Constraints

- Preserve all existing backend API integration, route paths, query keys, and academic calculation semantics.
- Maintain dark-mode compatibility with the existing next-themes and CSS variable palette defined in `frontend/src/index.css`.
- Ensure zero TypeScript compiler errors (`tsc -b`) and successful production bundling (`vite build`).
- Keep code clean, accessible (ARIA compliant), and mobile responsive across all views.

## Review Focus

- Table data alignment: numeric values (scores, attendance rates, GPAs) must use tabular numbers (`tabular-nums`) and right/center alignment where appropriate.
- Select components: custom select popovers must correctly reflect current state, handle placeholder selection, and close properly on outside click or selection.
- Loading & empty states: skeleton loaders and empty illustrations must remain visually centered and cleanly framed within cards/tables.
- Form validation: inline errors and submission feedback with Sonner toasts must remain intact.
- Dark mode: all newly introduced components must have appropriate dark-mode contrast borders and surfaces.

---

### Task 1: Add Missing Core shadcn UI Primitives (`Table`, `Select`, `Avatar`, `Separator`)

**Files:**
- Create: `frontend/src/components/ui/table.tsx`
- Create: `frontend/src/components/ui/select.tsx`
- Create: `frontend/src/components/ui/avatar.tsx`
- Create: `frontend/src/components/ui/separator.tsx`

**Interfaces:**
- `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableHead`, `TableRow`, `TableCell`, `TableCaption`
- `Select`, `SelectGroup`, `SelectValue`, `SelectTrigger`, `SelectContent`, `SelectLabel`, `SelectItem`, `SelectSeparator`
- `Avatar`, `AvatarImage`, `AvatarFallback`
- `Separator`

- [ ] **Step 1: Create `table.tsx`**
Implement standard shadcn `Table` primitives using semantic HTML elements, muted header styling, border-b divisions, and smooth row hover transitions matching Tailwind v4 base-nova styles.

- [ ] **Step 2: Create `select.tsx`**
Implement accessible `Select` component family leveraging `@base-ui/react/select` or composable popover triggers with `SelectTrigger`, `SelectContent`, `SelectItem`, and `SelectValue`, styled with clean focus rings, backdrop shadows, and checkmark indicators.

- [ ] **Step 3: Create `avatar.tsx`**
Implement `Avatar`, `AvatarImage`, and `AvatarFallback` primitives with rounded full borders, subtle background fills, and uppercase typography.

- [ ] **Step 4: Create `separator.tsx`**
Implement `Separator` component supporting horizontal and vertical orientations with `bg-border`.

- [ ] **Step 5: Verify build with new UI primitives**
Run: `cd /media/spiderweb/DATA/school-management-system/frontend && npm run build`
Expected: PASS with 0 type errors.

---

### Task 2: Refactor Admin Management Pages to use shadcn Components

**Files:**
- Modify: `frontend/src/features/admin/StudentsManagementPage.tsx`
- Modify: `frontend/src/features/admin/SubjectsManagementPage.tsx`
- Modify: `frontend/src/features/admin/TeachersManagementPage.tsx`
- Modify: `frontend/src/features/admin/ClassroomsManagementPage.tsx`
- Modify: `frontend/src/features/admin/components/ClassroomDialog.tsx`
- Modify: `frontend/src/features/admin/components/StudentFormSheet.tsx`
- Modify: `frontend/src/features/admin/components/TeacherFormSheet.tsx`

**Interfaces:**
- Consumes: `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell`, `Select`, `Avatar`, `Badge`, `Button`, `Input`

- [ ] **Step 1: Refactor `StudentsManagementPage.tsx`**
Replace raw `<table>` with shadcn `Table` components. Replace native `<select>` classroom filter with shadcn `Select`. Replace ad-hoc student initials div with `Avatar` & `AvatarFallback`. Clean up search input with standard shadcn card framing.

- [ ] **Step 2: Refactor `SubjectsManagementPage.tsx` & Dialog**
Replace raw table with shadcn `Table` components. In `SubjectsManagementPage` dialog, replace native selects for classroom and teacher with shadcn `Select`.

- [ ] **Step 3: Refactor `TeachersManagementPage.tsx`**
Replace raw table with shadcn `Table` components and `Avatar` initials. Clean up department badges and action buttons.

- [ ] **Step 4: Refactor `ClassroomsManagementPage.tsx` & `ClassroomDialog.tsx`**
Update `ClassroomDialog.tsx` to use shadcn `Select` for designating homeroom teachers.

- [ ] **Step 5: Refactor `StudentFormSheet.tsx` & `TeacherFormSheet.tsx`**
Replace raw `<select>` elements for gender and classroom selection with shadcn `Select` components, ensuring react-hook-form integration works seamlessly with `Controller` or controlled value binding.

- [ ] **Step 6: Verify build**
Run: `cd /media/spiderweb/DATA/school-management-system/frontend && npm run build`
Expected: PASS with 0 errors.

---

### Task 3: Refactor Teacher Portal Views (`GradingSpreadsheetGrid`, `AttendanceRosterTable`, `DailyAttendancePage`, `BulkGradingPage`)

**Files:**
- Modify: `frontend/src/features/teacher/components/GradingSpreadsheetGrid.tsx`
- Modify: `frontend/src/features/teacher/components/AttendanceRosterTable.tsx`
- Modify: `frontend/src/features/teacher/DailyAttendancePage.tsx`
- Modify: `frontend/src/features/teacher/BulkGradingPage.tsx`

**Interfaces:**
- Consumes: `Table`, `Select`, `Avatar`, `Badge`, `Button`, `Input`, `Label`

- [ ] **Step 1: Refactor `GradingSpreadsheetGrid.tsx`**
Replace raw HTML table with shadcn `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell`. Use `Avatar` for student initials. Clean up numeric input borders and letter grade badges.

- [ ] **Step 2: Refactor `AttendanceRosterTable.tsx`**
Replace raw table with shadcn `Table`. Use `Avatar` for students. Clean up status toggle button group with unified subtle border, active states, and hover transitions.

- [ ] **Step 3: Refactor `DailyAttendancePage.tsx`**
Replace raw `<select>` for classroom roster with shadcn `Select`. Clean up header action buttons, summary badges, and date picker.

- [ ] **Step 4: Refactor `BulkGradingPage.tsx`**
Replace raw `<select>` elements for Course Subject, Academic Term, and Evaluation Type with shadcn `Select` components. Clean up grid layout, labels, and header actions.

- [ ] **Step 5: Verify build**
Run: `cd /media/spiderweb/DATA/school-management-system/frontend && npm run build`
Expected: PASS with 0 errors.

---

### Task 4: Refactor Student Portal Views (`StudentReportCardPage`, `StudentAttendancePage`, `StudentDashboardPage`)

**Files:**
- Modify: `frontend/src/features/student/StudentReportCardPage.tsx`
- Modify: `frontend/src/features/student/StudentAttendancePage.tsx`
- Modify: `frontend/src/features/student/StudentDashboardPage.tsx`

**Interfaces:**
- Consumes: `Table`, `Select`, `Card`, `Badge`, `Button`, `Skeleton`

- [ ] **Step 1: Refactor `StudentReportCardPage.tsx`**
Replace raw table with shadcn `Table`. Replace term filter `<select>` with shadcn `Select`. Clean up summary KPI cards, print button, and letter grade badges.

- [ ] **Step 2: Refactor `StudentAttendancePage.tsx`**
Replace raw table with shadcn `Table`. Replace status filter `<select>` with shadcn `Select`. Clean up summary cards and attendance status badges.

- [ ] **Step 3: Clean up `StudentDashboardPage.tsx`**
Ensure KPI metric cards, GPA gauge, and recent attendance roster use standard shadcn card and typography tokens.

- [ ] **Step 4: Verify build**
Run: `cd /media/spiderweb/DATA/school-management-system/frontend && npm run build`
Expected: PASS with 0 errors.

---

### Task 5: Refactor AppShell & Navigation Layout

**Files:**
- Modify: `frontend/src/components/layout/AppShell.tsx`
- Modify: `frontend/src/components/layout/SidebarNav.tsx`

**Interfaces:**
- Consumes: `Avatar`, `AvatarFallback`, `Separator`, `Badge`, `Button`

- [ ] **Step 1: Refactor User Profile and Brand Header in `AppShell.tsx`**
Replace custom avatar `div` with shadcn `Avatar` and `AvatarFallback`. Clean up sidebar border with `Separator`.

- [ ] **Step 2: Clean up Top Bar and Demo Switcher**
Clean up the top header role buttons and sidebar demo switcher with consistent shadcn `Button` styling and crisp contrast.

- [ ] **Step 3: Polish `SidebarNav.tsx`**
Ensure active link styles and hover indicators use shadcn color tokens and consistent typography.

- [ ] **Step 4: Verify build**
Run: `cd /media/spiderweb/DATA/school-management-system/frontend && npm run build`
Expected: PASS with 0 errors.

---

### Task 6: Full Verification and Cross-Role Check

**Files:**
- Test all pages via `npm run build` and route checks.

- [ ] **Step 1: Run complete production build**
Run: `cd /media/spiderweb/DATA/school-management-system/frontend && npm run build`
Expected: Clean build with 0 TypeScript and 0 Vite bundling errors.

- [ ] **Step 2: Check backend tests to ensure zero API regressions**
Run: `cd /media/spiderweb/DATA/school-management-system/backend && vendor/bin/pest`
Expected: All 21 tests pass with 164 assertions.
