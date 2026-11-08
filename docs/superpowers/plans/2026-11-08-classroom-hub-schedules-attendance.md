# Classroom Hub, Daily Per-Course Attendance, and Weekly Timetable Schedules Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Admin Classroom Hub (student roster, faculty curriculum, attendance analytics, and timetable management), a weekly timetable scheduling engine for teachers and students, and a streamlined course-by-course daily attendance roll-call interface.

**Architecture:** We add a dedicated `schedules` table in PostgreSQL/Laravel and link `schedule_id` optionally to `attendances`. We build role-scoped schedule API endpoints and classroom hub analytics. On the React 19 SPA, we build the Admin Classroom Hub with shadcn tabs and visual 5-day timetables for classrooms, teachers, and students, along with rapid 1-click course roll-call ticking.

**Tech Stack:** Laravel 13 (PHP 8.3+), PostgreSQL/SQLite, Pest testing, React 19, TypeScript 5.9, Vite 8, Tailwind CSS v4, shadcn UI components (`Table`, `Select`, `Card`, `Badge`, `Avatar`, `Button`, `Dialog`).

**Spec:** [`docs/superpowers/specs/2026-11-08-classroom-hub-schedules-attendance-design.md`](file:///media/spiderweb/DATA/school-management-system/docs/superpowers/specs/2026-11-08-classroom-hub-schedules-attendance-design.md)

## Global Constraints

- Preserve all existing routes, Sanctum token authentication, and role gates.
- Strict type hints on all PHP methods and TypeScript interfaces.
- Zero regression in existing test suite (`vendor/bin/pest` 34 tests).
- All new PHP files must pass Laravel Pint styling (`vendor/bin/pint --format agent`).
- All frontend changes must pass TypeScript compile (`tsc -b`) and Vite production bundling (`vite build`).

## Review Focus

- Timetable overlap validation: ensure a teacher or a classroom cannot be double-booked at the same time on the same day and term.
- Course attendance uniqueness: ensure `(student_id, date, subject_id)` prevents duplicate records on the same day for a subject.
- Role-scoped schedule visibility: teachers only see their own assigned classes, students only see their classroom's timetable, admins see all.
- Hub performance: avoid pushing thousands of raw attendance records to the browser; use the aggregated endpoint with pagination.
- Clean shadcn components: maintain consistent padding, tabular numbers (`tabular-nums`), and dark-mode compatibility across all newly added views.

---

### Task 1: Database Migrations & Schedule Model

**Files:**
- Create: `database/migrations/2026_11_08_000001_create_schedules_table.php`
- Create: `database/migrations/2026_11_08_000002_add_schedule_id_to_attendances_table.php`
- Create: `app/Models/Schedule.php`
- Modify: `app/Models/Classroom.php`
- Modify: `app/Models/Subject.php`
- Modify: `app/Models/TeacherProfile.php`
- Modify: `app/Models/Attendance.php`
- Create: `tests/Feature/ScheduleModelTest.php`

**Interfaces:**
- Produces: `Schedule` model with relations `classroom()`, `subject()`, `teacher()`, `attendances()`
- Produces: `Classroom::schedules()`, `Subject::schedules()`, `TeacherProfile::schedules()`, `Attendance::schedule()`

- [ ] **Step 1: Write failing test `tests/Feature/ScheduleModelTest.php`**
Test that `Schedule` model can be created with valid relations and cascade deletion works.

- [ ] **Step 2: Run test to verify it fails**
Run: `vendor/bin/pest tests/Feature/ScheduleModelTest.php`
Expected: FAIL (table/model does not exist)

- [ ] **Step 3: Implement migrations and models**
Create `create_schedules_table` migration, `add_schedule_id_to_attendances_table` migration, and `app/Models/Schedule.php`. Add Eloquent relationships in `Classroom`, `Subject`, `TeacherProfile`, and `Attendance`.

- [ ] **Step 4: Run test to verify it passes**
Run: `vendor/bin/pest tests/Feature/ScheduleModelTest.php`
Expected: PASS

---

### Task 2: Schedule API & Overlap Validation Endpoints

**Files:**
- Create: `app/Http/Requests/Admin/StoreScheduleRequest.php`
- Create: `app/Http/Requests/Admin/UpdateScheduleRequest.php`
- Create: `app/Http/Resources/ScheduleResource.php`
- Create: `app/Http/Controllers/Api/V1/ScheduleController.php`
- Modify: `routes/api.php`
- Create: `tests/Feature/ScheduleApiTest.php`

**Interfaces:**
- Produces: `GET /api/v1/schedules` (role-scoped)
- Produces: `POST /api/v1/admin/schedules`
- Produces: `PUT /api/v1/admin/schedules/{id}`
- Produces: `DELETE /api/v1/admin/schedules/{id}`

- [ ] **Step 1: Write failing feature test `tests/Feature/ScheduleApiTest.php`**
Test admin schedule creation, overlap detection (rejecting overlapping classroom or teacher booking), and role-scoped retrieval for teachers and students.

- [ ] **Step 2: Run test to verify it fails**
Run: `vendor/bin/pest tests/Feature/ScheduleApiTest.php`
Expected: FAIL (route/controller missing)

- [ ] **Step 3: Implement ScheduleController, FormRequests, ScheduleResource, and routes**
Implement `start_time < end_time` validation and conflict checks in `StoreScheduleRequest` & `UpdateScheduleRequest`. Implement role-scoped query in `ScheduleController::index`.

- [ ] **Step 4: Run test to verify it passes**
Run: `vendor/bin/pest tests/Feature/ScheduleApiTest.php`
Expected: PASS

---

### Task 3: Classroom Hub & Attendance History API

**Files:**
- Modify: `app/Http/Controllers/Api/V1/Admin/ClassroomController.php`
- Modify: `app/Http/Controllers/Api/V1/AttendanceController.php`
- Modify: `routes/api.php`
- Create: `tests/Feature/ClassroomHubApiTest.php`

**Interfaces:**
- Produces: `GET /api/v1/admin/classrooms/{id}/hub`
- Produces: `GET /api/v1/admin/classrooms/{id}/attendance-history`
- Consumes: `Classroom`, `StudentProfile`, `Subject`, `Schedule`, `Attendance`

- [ ] **Step 1: Write failing feature test `tests/Feature/ClassroomHubApiTest.php`**
Test `hub` endpoint returns students roster, subjects with teachers, weekly schedules, and aggregated KPI rates. Test `attendance-history` returns paginated daily course roll-call summaries.

- [ ] **Step 2: Run test to verify it fails**
Run: `vendor/bin/pest tests/Feature/ClassroomHubApiTest.php`
Expected: FAIL

- [ ] **Step 3: Implement `hub` and `attendanceHistory` in `ClassroomController`**
Implement aggregation queries. Update `AttendanceController` to support saving `subject_id` and `schedule_id` with teacher authorization checks.

- [ ] **Step 4: Run test to verify it passes**
Run: `vendor/bin/pest tests/Feature/ClassroomHubApiTest.php`
Expected: PASS

---

### Task 4: Frontend Admin Classroom Hub (`/admin/classrooms/:id`)

**Files:**
- Create: `frontend/src/features/admin/ClassroomHubPage.tsx`
- Create: `frontend/src/features/admin/components/ScheduleDialog.tsx`
- Modify: `frontend/src/features/admin/ClassroomsManagementPage.tsx`
- Modify: `frontend/src/features/admin/index.tsx`
- Modify: `frontend/src/App.tsx`

**Interfaces:**
- Consumes: `/admin/classrooms/{id}/hub`, `/admin/classrooms/{id}/attendance-history`, `/admin/schedules`
- Produces: Route `/admin/classrooms/:id`

- [ ] **Step 1: Create `ScheduleDialog.tsx`**
Create modal dialog using shadcn `Dialog`, `Select`, `Input`, `Label`, and `Button` to create/edit schedule periods (Day, Start Time, End Time, Subject, Teacher, Room, Term).

- [ ] **Step 2: Create `ClassroomHubPage.tsx`**
Create the 4-tab Classroom Hub page with KPI cards, Student Roster table, Curriculum table, Interactive 5-day Timetable grid with "+ Add Period", and Attendance History log.

- [ ] **Step 3: Update `ClassroomsManagementPage.tsx` & Router**
Add "Open Classroom Hub" link button on each classroom card and register route `/admin/classrooms/:id` in `App.tsx`.

- [ ] **Step 4: Verify frontend build**
Run: `npm --prefix frontend run build`
Expected: PASS with 0 errors

---

### Task 5: Frontend Streamlined Course Roll Call (`/teacher/attendance`)

**Files:**
- Modify: `frontend/src/features/teacher/DailyAttendancePage.tsx`
- Modify: `frontend/src/features/teacher/components/AttendanceRosterTable.tsx`

**Interfaces:**
- Consumes: `GET /attendances?classroom_id=...&subject_id=...&date=...`, `POST /attendances/batch`

- [ ] **Step 1: Enhance `DailyAttendancePage.tsx` for Course Sessions**
Add Session Type selector ("Homeroom Roll Call" vs "Course Subject Roll Call"). Read `classroom_id`, `subject_id`, and `date` from URL search params if present.

- [ ] **Step 2: Optimize 1-click ticking in `AttendanceRosterTable.tsx`**
Provide prominent, high-contrast Present (emerald) and Absent (rose) toggle buttons for rapid attendance taking.

- [ ] **Step 3: Verify frontend build**
Run: `npm --prefix frontend run build`
Expected: PASS with 0 errors

---

### Task 6: Frontend Teacher & Student Weekly Timetable Schedules

**Files:**
- Create: `frontend/src/features/teacher/TeacherSchedulePage.tsx`
- Create: `frontend/src/features/student/StudentSchedulePage.tsx`
- Modify: `frontend/src/features/teacher/index.tsx`
- Modify: `frontend/src/features/student/index.tsx`
- Modify: `frontend/src/components/layout/SidebarNav.tsx`
- Modify: `frontend/src/App.tsx`

**Interfaces:**
- Consumes: `GET /schedules`
- Produces: Route `/teacher/schedule`, Route `/student/schedule`

- [ ] **Step 1: Create `TeacherSchedulePage.tsx`**
Build a visual 5-day timetable grid (Monday–Friday) showing scheduled teaching slots with subject name, classroom badge, time range, room, and a direct "Take Attendance" shortcut button.

- [ ] **Step 2: Create `StudentSchedulePage.tsx`**
Build a visual 5-day timetable grid (Monday–Friday) showing the student's daily subjects, instructors, times, and rooms.

- [ ] **Step 3: Update Navigation & Router**
Add "Teaching Timetable" (`/teacher/schedule`) to teacher nav in `SidebarNav.tsx`. Add "Class Timetable" (`/student/schedule`) to student nav. Register routes in `App.tsx`.

- [ ] **Step 4: Verify frontend build**
Run: `npm --prefix frontend run build`
Expected: PASS with 0 errors

---

### Task 7: Seed Data, Code Formatting & End-to-End Verification

**Files:**
- Modify: `database/seeders/DemoSchoolSeeder.php`

- [ ] **Step 1: Add realistic timetable schedule records in `DemoSchoolSeeder.php`**
Seed sample Monday–Friday schedules for classrooms with subjects, teachers, and rooms.

- [ ] **Step 2: Run migrations and deterministic seeder**
Run: `php artisan migrate:fresh --seed`
Expected: Database migrated and seeded successfully.

- [ ] **Step 3: Run backend test suite**
Run: `vendor/bin/pest`
Expected: All tests pass.

- [ ] **Step 4: Format PHP files with Pint**
Run: `vendor/bin/pint --format agent app database routes tests`
Expected: Clean formatting.

- [ ] **Step 5: Run frontend lint and production build**
Run: `npm --prefix frontend run lint && npm --prefix frontend run build`
Expected: 0 errors.
