# School Management System - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a portfolio-grade, full-stack School Management System with a Laravel 12/13 REST API and React 19 SPA demonstrating the academic lifecycle (Admin provisioning $\rightarrow$ Teacher attendance & bulk grading $\rightarrow$ Student real-time GPA and report card) with a 1-click Demo Persona Switcher.

**Architecture:** 
- **Backend:** Modular Laravel 12/13 API with PostgreSQL on Neon, FormRequest validations, JsonResources, Spatie role policies, and Sanctum Bearer tokens using a uniform JSend-style REST envelope.
- **Frontend:** React 19 SPA with Vite, TypeScript, Tailwind CSS v4, shadcn/ui, TanStack Query v5, and React Router v7 featuring a unified responsive sidebar layout with role-guarded routes (`/admin/*`, `/teacher/*`, `/student/*`).

**Tech Stack:** Laravel 12/13, PHP 8.3+, PostgreSQL (Neon), Laravel Sanctum, React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, TanStack Query v5, React Router v7, React Hook Form, Zod, Lucide React, Sonner.

**Spec:** Defined and agreed upon in the alignment interview (Academic Cycle, 3 roles: Admin / Teacher / Student, homeroom + subject attendance, 4.0 GPA calculation, bulk grading grid, 1-click demo switcher, rich `DemoSeeder`).

---

## Global Constraints

- **Language & Runtime:** PHP 8.3+ for Laravel backend; Node.js 20+ & TypeScript 5.9+ for React frontend.
- **Database:** PostgreSQL on Neon DB via Laravel Eloquent ORM.
- **Auth Contract:** All protected endpoints consume `Authorization: Bearer <token>`; tokens stored in browser `localStorage`.
- **API Envelope:** All responses follow `{ "success": boolean, "message": string, "data": any, "meta"?: object }` for success and `{ "success": false, "message": string, "errors"?: object }` for failures.
- **Validation:** Frontend Zod schemas paired with backend `FormRequest` classes; `422 Unprocessable Content` mapped directly to `react-hook-form` fields.
- **Styling:** Tailwind CSS v4 using CSS theme variables and shadcn/ui primitives.

## Review Focus

1. **Unique Attendance Constraint:** Recording subject-level attendance must not collide with homeroom daily roll call records on the same day (`['student_id', 'date', 'subject_id']`).
2. **Teacher Authorization Boundary:** Teachers must be strictly forbidden from grading or taking attendance for classes/subjects not assigned to them (`403 Forbidden`).
3. **Student Privacy Isolation:** Students querying grades or attendance must only ever receive their own records, even if tampering with query parameters.
4. **GPA & Letter Grade Precision:** Calculations must handle edge cases (zero graded subjects, 100% max score variations) without dividing by zero or throwing null reference errors.
5. **Session Expiry & Demo Switcher:** 401 Unauthorized responses must transparently clear stale local tokens and redirect gracefully to the login view with an explanatory toast.

---

### Task 1: Backend Database & Model Sanitization

**Files:**
- Modify: `backend/database/migrations/2026_11_02_074641_create_school_management_tables.php`
- Modify: `backend/app/Models/User.php`
- Modify: `backend/app/Models/TeacherProfile.php`
- Modify: `backend/app/Models/StudentProfile.php`
- Rename & Modify: `backend/app/Models/Suject.php` $\rightarrow$ `backend/app/Models/Subject.php`
- Modify: `backend/app/Models/Classroom.php`
- Modify: `backend/app/Models/Attendance.php`
- Modify: `backend/app/Models/Grade.php`
- Test: `backend/tests/Feature/DatabaseSchemaTest.php`

**Interfaces:**
- Consumes: Existing Neon DB connection in `backend/.env`.
- Produces: Sanitized Eloquent models and verified database schema supporting both homeroom and subject-level attendance.

- [ ] **Step 1: Write the failing schema & relationship test**
  Create `backend/tests/Feature/DatabaseSchemaTest.php` asserting that `User`, `TeacherProfile`, `StudentProfile`, `Classroom`, `Subject`, `Attendance`, and `Grade` models have correct table names, relationships, and date casts.
- [ ] **Step 2: Run test to verify it fails**
  Run: `cd backend && php artisan test --filter=DatabaseSchemaTest`
  Expected: FAIL (due to `user` table mismatch, typo in `Suject.php`, missing plural imports).
- [ ] **Step 3: Fix migrations and model definitions**
  - In `create_school_management_tables.php`:
    - Fix `constrained('users')` for `teacher_profiles.user_id`.
    - Change `hire_data` to `hire_date` with `date` type.
    - In `attendances`: add `$table->foreignId('subject_id')->nullable()->constrained('subjects')->nullOnDelete();`.
    - Update unique constraint: `$table->unique(['student_id', 'date', 'subject_id']);`.
  - In `User.php`:
    - Remove `#[Table('user')]` (default to `'users'`).
    - Fix `TeacherProfiles::class` $\rightarrow$ `TeacherProfile::class` and `StudentProfiles::class` $\rightarrow$ `StudentProfile::class`.
  - Rename `Suject.php` $\rightarrow$ `Subject.php` and verify namespace/imports.
  - Run fresh migration: `php artisan migrate:fresh`.
- [ ] **Step 4: Run test to verify it passes**
  Run: `cd backend && php artisan test --filter=DatabaseSchemaTest`
  Expected: PASS
- [ ] **Step 5: Commit**
  ```bash
  git add backend/database/migrations backend/app/Models backend/tests
  git commit -m "fix(backend): sanitize models, relationships, and attendance migration schema"
  ```

---

### Task 2: Standard API Response Helper & Authentication Endpoints

**Files:**
- Create: `backend/app/Traits/ApiResponse.php`
- Create: `backend/app/Http/Controllers/Api/V1/AuthController.php`
- Create: `backend/app/Http/Requests/Auth/LoginRequest.php`
- Create: `backend/app/Http/Resources/UserResource.php`
- Modify: `backend/routes/api.php`
- Test: `backend/tests/Feature/AuthTest.php`

**Interfaces:**
- Consumes: Laravel Sanctum, `App\Enums\RoleEnums`.
- Produces: `/api/v1/auth/login`, `/api/v1/auth/logout`, `/api/v1/auth/me`, `/api/v1/auth/demo/{role}` with uniform JSON envelope.

- [ ] **Step 1: Write failing auth feature tests**
  Create `backend/tests/Feature/AuthTest.php` testing:
  - Valid user login returns `200` with Sanctum bearer token and `UserResource`.
  - Invalid credentials return `422` with validation error format.
  - `/api/v1/auth/me` returns current user with roles and profile data.
  - `/api/v1/auth/demo/{role}` generates instant token for `admin`, `teacher`, or `student`.
  - `/api/v1/auth/logout` revokes current access token.
- [ ] **Step 2: Run test to verify it fails**
  Run: `cd backend && php artisan test --filter=AuthTest`
  Expected: FAIL with 404 route not found.
- [ ] **Step 3: Implement ApiResponse trait, FormRequest, Resource, and AuthController**
  - Implement `ApiResponse` trait providing `successResponse($data, $message, $code, $meta)` and `errorResponse($message, $code, $errors)`.
  - Create `LoginRequest` with email and password validation rules.
  - Create `UserResource` containing `id`, `name`, `email`, `role`, and attached profile summary.
  - Build `AuthController` with `login()`, `logout()`, `me()`, and `demoLogin($role)`.
  - Register auth routes under `prefix('v1/auth')` in `routes/api.php`.
- [ ] **Step 4: Run test to verify it passes**
  Run: `cd backend && php artisan test --filter=AuthTest`
  Expected: PASS
- [ ] **Step 5: Commit**
  ```bash
  git add backend/app/Traits backend/app/Http backend/routes/api.php backend/tests
  git commit -m "feat(auth): implement Sanctum auth, demo switcher endpoint, and ApiResponse trait"
  ```

---

### Task 3: Deterministic Demo Data Seeder (`DemoSeeder`)

**Files:**
- Create: `backend/database/seeders/DemoSchoolSeeder.php`
- Modify: `backend/database/seeders/DatabaseSeeder.php`
- Test: `backend/tests/Feature/DemoSeederTest.php`

**Interfaces:**
- Consumes: `User`, `TeacherProfile`, `StudentProfile`, `Classroom`, `Subject`, `Attendance`, `Grade`.
- Produces: 1 Admin, 3 Teachers, 2 Classrooms, 20 Students, 30 days of attendance, and midterm grades ready for demo.

- [ ] **Step 1: Write test verifying seeded records**
  Create `backend/tests/Feature/DemoSeederTest.php` checking that after seeding:
  - Admin (`admin@school.test`) exists with `admin` role.
  - 3 teachers exist with assigned subjects (Mathematics, Science, English Literature).
  - 2 classrooms exist ("Grade 10 - A", "Grade 10 - B") with ~10 students each.
  - At least 300 attendance records and 40 grade records exist.
- [ ] **Step 2: Run test to verify it fails**
  Run: `cd backend && php artisan test --filter=DemoSeederTest`
  Expected: FAIL
- [ ] **Step 3: Implement DemoSchoolSeeder**
  - Create deterministic accounts with known passwords (`password`).
  - Assign Spatie roles / `RoleEnums`.
  - Seed past 30 school days with realistic attendance (`present`, `late`, `absent`, `excused`).
  - Seed grades across "Semester 1" ("Midterm" and "Quiz") with realistic scores (65.00 to 98.00).
  - Register `DemoSchoolSeeder` in `DatabaseSeeder.php`.
  - Run `php artisan db:seed`.
- [ ] **Step 4: Run test to verify it passes**
  Run: `cd backend && php artisan test --filter=DemoSeederTest`
  Expected: PASS
- [ ] **Step 5: Commit**
  ```bash
  git add backend/database/seeders backend/tests
  git commit -m "feat(db): create comprehensive DemoSchoolSeeder for instant portfolio review"
  ```

---

### Task 4: Admin Management APIs (Classrooms, Subjects, Teachers, Students)

**Files:**
- Create: `backend/app/Http/Controllers/Api/V1/Admin/ClassroomController.php`
- Create: `backend/app/Http/Controllers/Api/V1/Admin/SubjectController.php`
- Create: `backend/app/Http/Controllers/Api/V1/Admin/TeacherController.php`
- Create: `backend/app/Http/Controllers/Api/V1/Admin/StudentController.php`
- Create: FormRequests and JsonResources in `backend/app/Http/Requests/Admin/` and `backend/app/Http/Resources/`
- Modify: `backend/routes/api.php`
- Test: `backend/tests/Feature/AdminManagementTest.php`

**Interfaces:**
- Consumes: `auth:sanctum`, role middleware `role:admin`.
- Produces: RESTful CRUD endpoints under `/api/v1/admin/*` with pagination, search, and sorting.

- [ ] **Step 1: Write failing Admin CRUD tests**
  Create `backend/tests/Feature/AdminManagementTest.php` asserting that:
  - Admin can list, create, update, and delete classrooms.
  - Admin can create a student (creates `User` + `StudentProfile` in a database transaction).
  - Admin can create a teacher (creates `User` + `TeacherProfile` with employee code).
  - Non-admin users receive `403 Forbidden`.
- [ ] **Step 2: Run test to verify it fails**
  Run: `cd backend && php artisan test --filter=AdminManagementTest`
  Expected: FAIL
- [ ] **Step 3: Implement Admin controllers, FormRequests, and Resources**
  - Implement `ClassroomController` with homeroom teacher assignment.
  - Implement `SubjectController` linked to classroom and teacher.
  - Implement `TeacherController` and `StudentController` with `DB::transaction` ensuring atomic user and profile creation.
  - Register routes in `routes/api.php` wrapped in `middleware(['auth:sanctum', 'role:admin'])`.
- [ ] **Step 4: Run test to verify it passes**
  Run: `cd backend && php artisan test --filter=AdminManagementTest`
  Expected: PASS
- [ ] **Step 5: Commit**
  ```bash
  git add backend/app/Http backend/routes/api.php backend/tests
  git commit -m "feat(api): implement admin CRUD endpoints for classrooms, subjects, teachers, and students"
  ```

---

### Task 5: Academic Operations APIs (Attendance & Bulk Grading Engine)

**Files:**
- Create: `backend/app/Services/AcademicCalculationService.php`
- Create: `backend/app/Http/Controllers/Api/V1/AttendanceController.php`
- Create: `backend/app/Http/Controllers/Api/V1/GradeController.php`
- Create: `backend/app/Http/Requests/Attendance/BatchStoreAttendanceRequest.php`
- Create: `backend/app/Http/Requests/Grade/BatchStoreGradeRequest.php`
- Create: `backend/app/Http/Resources/AttendanceResource.php`
- Create: `backend/app/Http/Resources/GradeResource.php`
- Modify: `backend/routes/api.php`
- Test: `backend/tests/Feature/AcademicOperationsTest.php`

**Interfaces:**
- Consumes: `auth:sanctum`.
- Produces:
  - `GET /api/v1/attendances?classroom_id={id}&date={date}`
  - `POST /api/v1/attendances/batch` (upsert roster attendance records)
  - `GET /api/v1/grades?subject_id={id}&term={term}&exam_type={exam_type}`
  - `POST /api/v1/grades/batch` (upsert bulk class exam scores)
  - `AcademicCalculationService::calculateGpa($grades)` and letter grade mapping.

- [ ] **Step 1: Write failing academic operations tests**
  Create `backend/tests/Feature/AcademicOperationsTest.php` testing:
  - Batch roll call saves multiple student statuses in one call and avoids duplicates via upsert.
  - Batch grade submission records scores, validates range `[0, max_score]`, and updates existing scores.
  - Teacher cannot modify grades for a subject assigned to another teacher.
  - `AcademicCalculationService` accurately calculates weighted GPA and letter grade (`>=90% = A`, etc.).
- [ ] **Step 2: Run test to verify it fails**
  Run: `cd backend && php artisan test --filter=AcademicOperationsTest`
  Expected: FAIL
- [ ] **Step 3: Implement calculation service, requests, and controllers**
  - Build `AcademicCalculationService` with pure functions for percentage and 4.0 GPA conversion.
  - Build `AttendanceController` with batch upsert on `['student_id', 'date', 'subject_id']`.
  - Build `GradeController` with batch upsert on `['student_id', 'subject_id', 'term', 'exam_type']`.
  - Implement Policy checks ensuring teachers only record for authorized subjects/classes.
- [ ] **Step 4: Run test to verify it passes**
  Run: `cd backend && php artisan test --filter=AcademicOperationsTest`
  Expected: PASS
- [ ] **Step 5: Commit**
  ```bash
  git add backend/app/Services backend/app/Http backend/routes/api.php backend/tests
  git commit -m "feat(api): implement attendance batch entry, bulk grading engine, and GPA calculation service"
  ```

---

### Task 6: Role Dashboards Analytics API

**Files:**
- Create: `backend/app/Http/Controllers/Api/V1/DashboardController.php`
- Modify: `backend/routes/api.php`
- Test: `backend/tests/Feature/DashboardApiTest.php`

**Interfaces:**
- Consumes: `auth:sanctum`.
- Produces:
  - `GET /api/v1/dashboard/admin` (counts, overall attendance %, classroom distribution)
  - `GET /api/v1/dashboard/teacher` (assigned classes, today's roll-call status, recent grades)
  - `GET /api/v1/dashboard/student` (GPA summary, attendance rate gauge, subject grade breakdown)

- [ ] **Step 1: Write failing dashboard analytics tests**
  Create `backend/tests/Feature/DashboardApiTest.php` verifying correct metrics payload for admin, teacher, and student tokens.
- [ ] **Step 2: Run test to verify it fails**
  Run: `cd backend && php artisan test --filter=DashboardApiTest`
  Expected: FAIL
- [ ] **Step 3: Implement DashboardController**
  - Implement `adminMetrics()` with aggregated counts and today's attendance calculation.
  - Implement `teacherMetrics()` scoped to authenticated teacher's profile.
  - Implement `studentMetrics()` computing current student's GPA, letter grades, and attendance percentage.
  - Register routes in `routes/api.php`.
- [ ] **Step 4: Run test to verify it passes**
  Run: `cd backend && php artisan test --filter=DashboardApiTest`
  Expected: PASS
- [ ] **Step 5: Commit**
  ```bash
  git add backend/app/Http/Controllers/Api/V1/DashboardController.php backend/routes/api.php backend/tests
  git commit -m "feat(api): implement role-scoped dashboard metrics endpoints"
  ```

---

### Task 7: Frontend Infrastructure, Auth Interceptors & 1-Click Demo Switcher

**Files:**
- Modify: `frontend/src/api/axios.ts`
- Create: `frontend/src/types/auth.ts`
- Create: `frontend/src/context/AuthContext.tsx`
- Create: `frontend/src/features/auth/LoginPage.tsx`
- Create: `frontend/src/features/auth/components/DemoSwitcher.tsx`
- Create: `frontend/src/components/layout/AppShell.tsx`
- Create: `frontend/src/components/layout/SidebarNav.tsx`
- Create: `frontend/src/components/layout/ProtectedRoute.tsx`
- Modify: `frontend/src/App.tsx`
- Test: `frontend/src/features/auth/__tests__/LoginPage.test.tsx`

**Interfaces:**
- Consumes: `/api/v1/auth/login`, `/api/v1/auth/demo/{role}`, `/api/v1/auth/me`.
- Produces: Full authentication lifecycle, reactive user state, 1-click demo switcher, and protected navigation shell.

- [ ] **Step 1: Configure Axios Interceptors & Auth Types**
  - In `frontend/src/api/axios.ts`:
    - Automatically inject `Authorization: Bearer ${token}` from `localStorage`.
    - Handle `401 Unauthorized` by clearing storage and notifying AuthContext.
    - Transform error responses to surface backend `message` and `errors`.
  - In `frontend/src/types/auth.ts`: Define `User`, `Role`, `AuthResponse`, and `LoginPayload`.
- [ ] **Step 2: Build AuthContext & TanStack Query Auth Hooks**
  - Implement `AuthProvider` with `user`, `role`, `isAuthenticated`, `login()`, `demoLogin(role)`, and `logout()`.
  - Use React Query for `/api/v1/auth/me` caching and invalidation.
- [ ] **Step 3: Build 1-Click Demo Switcher & Login Page**
  - Build `DemoSwitcher` with three styled buttons: "Demo Admin", "Demo Teacher", "Demo Student" with role badges.
  - Build `LoginPage` with standard Email/Password form using `react-hook-form` + `zod`, alongside the `DemoSwitcher`.
- [ ] **Step 4: Build Responsive AppShell & Role-Guarded Navigation**
  - Implement `SidebarNav` displaying links appropriate to active user role.
  - Implement `ProtectedRoute` redirecting unauthorized roles to `/login` or default portal.
  - Wire React Router routes in `App.tsx`:
    - `/login` (public)
    - `/admin/*` (`role:admin`)
    - `/teacher/*` (`role:teacher`)
    - `/student/*` (`role:student`)
- [ ] **Step 5: Verify build & commit**
  Run: `cd frontend && npm run build`
  Expected: Successful TypeScript compilation.
  ```bash
  git add frontend/src
  git commit -m "feat(frontend): implement auth context, Axios interceptor, 1-click demo switcher, and protected app shell"
  ```

---

### Task 8: Admin Portal Screens (Dashboard, Classrooms, Teachers, Students)

**Files:**
- Create: `frontend/src/features/admin/AdminDashboardPage.tsx`
- Create: `frontend/src/features/admin/StudentsManagementPage.tsx`
- Create: `frontend/src/features/admin/TeachersManagementPage.tsx`
- Create: `frontend/src/features/admin/ClassroomsManagementPage.tsx`
- Create: `frontend/src/features/admin/components/StudentFormSheet.tsx`
- Create: `frontend/src/features/admin/components/TeacherFormSheet.tsx`
- Create: `frontend/src/features/admin/components/ClassroomDialog.tsx`
- Modify: `frontend/src/App.tsx`

**Interfaces:**
- Consumes: `/api/v1/admin/*`, `/api/v1/dashboard/admin`.
- Produces: Complete administrative management UI with searchable tables and slide-over sheets.

- [ ] **Step 1: Build Admin Dashboard**
  - Render 4 stat cards (Total Students, Active Teachers, Classrooms, Overall Attendance %).
  - Render visual distribution of students per classroom using shadcn cards and progress bars.
- [ ] **Step 2: Build Student Management Page with Sheet Form**
  - Data table with search input, classroom filter, and pagination.
  - Slide-over `StudentFormSheet` for creating and editing students with instant Zod validation.
  - Optimistic TanStack Query invalidation on save with Sonner toast feedback.
- [ ] **Step 3: Build Teacher & Classroom Management Pages**
  - Teacher roster table with employee code, specialization, and assigned subjects count.
  - Slide-over `TeacherFormSheet` for adding new faculty.
  - Classroom dialog for setting grade levels, academic years, and homeroom teachers.
- [ ] **Step 4: Verify build & commit**
  Run: `cd frontend && npm run build`
  Expected: PASS
  ```bash
  git add frontend/src/features/admin
  git commit -m "feat(frontend): build admin dashboard and management pages with slide-over sheets"
  ```

---

### Task 9: Teacher Portal Screens (Attendance Roll Call & Spreadsheet Grading)

**Files:**
- Create: `frontend/src/features/teacher/TeacherDashboardPage.tsx`
- Create: `frontend/src/features/teacher/DailyAttendancePage.tsx`
- Create: `frontend/src/features/teacher/BulkGradingPage.tsx`
- Create: `frontend/src/features/teacher/components/AttendanceRosterTable.tsx`
- Create: `frontend/src/features/teacher/components/GradingSpreadsheetGrid.tsx`
- Modify: `frontend/src/App.tsx`

**Interfaces:**
- Consumes: `/api/v1/dashboard/teacher`, `/api/v1/attendances/*`, `/api/v1/grades/*`.
- Produces: Fast daily roll-call table and spreadsheet-style bulk grade entry.

- [ ] **Step 1: Build Teacher Dashboard**
  - "My Classes" quick-action cards.
  - Today's attendance status indicator (Completed / Pending) with 1-click "Take Roll" action.
  - Recent grades submission ledger.
- [ ] **Step 2: Build Daily Attendance Roll Call Page**
  - Classroom selector and Date picker.
  - "Mark All Present" master button.
  - Roster table with interactive chips for `Present`, `Absent`, `Late`, `Excused`.
  - Save button with TanStack mutation and Sonner confirmation.
- [ ] **Step 3: Build Bulk Grading Spreadsheet Grid**
  - Subject and Exam Type selectors (Midterm / Final / Quiz).
  - Tabular roster of students with inline score inputs and max score indicators.
  - Real-time percentage preview next to each input cell.
  - "Save All Grades" bulk submit button with optimistic updates.
- [ ] **Step 4: Verify build & commit**
  Run: `cd frontend && npm run build`
  Expected: PASS
  ```bash
  git add frontend/src/features/teacher
  git commit -m "feat(frontend): build teacher roll-call table and bulk spreadsheet grading UI"
  ```

---

### Task 10: Student Portal Screens (Report Card, GPA & Attendance Gauge)

**Files:**
- Create: `frontend/src/features/student/StudentDashboardPage.tsx`
- Create: `frontend/src/features/student/StudentReportCardPage.tsx`
- Create: `frontend/src/features/student/StudentAttendancePage.tsx`
- Create: `frontend/src/features/student/components/GpaCard.tsx`
- Create: `frontend/src/features/student/components/AttendanceGauge.tsx`
- Modify: `frontend/src/App.tsx`

**Interfaces:**
- Consumes: `/api/v1/dashboard/student`.
- Produces: Polished personal student portal with GPA card, attendance ring, and subject report card.

- [ ] **Step 1: Build GPA Card & Attendance Gauge Components**
  - Large hero `GpaCard` displaying 4.0 scale score, overall letter grade badge (e.g., "A-"), and academic standing.
  - Visual circular/progress `AttendanceGauge` displaying attendance percentage and breakdown (Present, Late, Absent).
- [ ] **Step 2: Build Student Dashboard Page**
  - Integrates `GpaCard` and `AttendanceGauge`.
  - Displays quick list of enrolled subjects and teachers.
  - Displays recent exam scores with score pill badges.
- [ ] **Step 3: Build Detailed Report Card & Attendance History Pages**
  - Full report card table sorted by semester with subject name, teacher, exam type, raw score, percentage, and letter grade.
  - Attendance log table with dates and status badges.
- [ ] **Step 4: Verify build & commit**
  Run: `cd frontend && npm run build`
  Expected: PASS
  ```bash
  git add frontend/src/features/student
  git commit -m "feat(frontend): build student portal with GPA card, attendance gauge, and report card ledger"
  ```

---

### Task 11: End-to-End Verification, Seed Freshness & UI Polish

**Files:**
- Modify: `frontend/src/index.css`
- Modify: `backend/database/seeders/DatabaseSeeder.php`
- Modify: `README.md`
- Test: Full end-to-end user verification

**Interfaces:**
- Consumes: Complete frontend and backend stack.
- Produces: Production-ready portfolio artifact with verified commands and documentation.

- [x] **Step 1: Verify Tailwind CSS v4 & shadcn/ui Theme**
  - Audit color contrasts, dark mode / light mode tokens, card borders, and font hierarchy.
  - Ensure skeleton loaders display seamlessly during serverless Neon DB cold starts.
- [x] **Step 2: Run End-to-End Persona Verification Flow**
  - Log in with "Demo Admin" $\rightarrow$ Verify stats, add sample student and classroom.
  - Log in with "Demo Teacher" $\rightarrow$ Take roll call for today, enter 5 new exam scores in bulk grid.
  - Log in with "Demo Student" $\rightarrow$ Confirm updated GPA and newly recorded exam score display instantly.
- [x] **Step 3: Verify All Automated Backend & Frontend Tests**
  - Run: `cd backend && php artisan test`
  - Run: `cd frontend && npm run build && npm run lint`
  - Ensure 100% green pass with zero compiler warnings.
- [x] **Step 4: Update README.md with Architecture & Quickstart**
  - Document setup steps: `php artisan migrate --seed`, `npm run dev`.
  - Include Demo credentials and role matrix.
- [x] **Step 5: Final Commit**
  ```bash
  git add .
  git commit -m "chore(release): complete portfolio-ready School Management System"
  ```
