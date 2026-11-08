# Classroom Hub, Daily Per-Course Attendance, and Weekly Timetable Schedules Design Document

**Status:** Under Final Review  
**Date:** 2026-11-08  
**Author:** AI Pair Programmer & Lead Architect  
**Scope:** Full-Stack (Laravel 13 REST API + React 19 SPA)

---

## 1. Intent & Purpose

This feature expands the School Management System with three deeply connected institutional workflows:
1. **Admin Classroom Hub**: A 360-degree command view for any classroom showing total enrollment, student profiles, all subjects and their designated teachers, and classroom-wide attendance metrics.
2. **Streamlined Daily Course Attendance**: Fast, accessible roll-call ticking for teachers to record attendance per course session (who attended/present vs. absent/late/excused).
3. **Teaching & Learning Timetable**: A weekly scheduling engine providing teachers with their teaching schedule and students with their classroom's daily learning timetable.

---

## 2. Goals, Non-Goals, & Anti-Goals

### Goals
- **Admin Classroom Hub (`/admin/classrooms/:id`)**:
  - Stat cards: Total Enrolled Students, Total Subjects, Homeroom Teacher, Overall Attendance Rate, Total Weekly Schedule Hours.
  - Tab 1: **Students Roster** (searchable table with student ID, avatar, name, gender, contact, guardian info).
  - Tab 2: **Curriculum & Faculty** (all subjects taught in this classroom, subject code, assigned instructor name and email).
  - Tab 3: **Weekly Timetable Schedule** (interactive 5-day grid showing periods, subjects, instructors, rooms, with "+ Add Period" slot editor).
  - Tab 4: **Attendance Analytics & Log** (aggregated course-by-course and date-by-date attendance rates).
- **Weekly Schedule Engine**:
  - `schedules` database table linking `classroom_id`, `subject_id` (nullable for homeroom periods), `teacher_id`, `term` (e.g. 'Semester 1', 'Semester 2'), `day_of_week` (Monday–Friday), `start_time`, `end_time`, and `room`.
  - Admin CRUD endpoints to manage weekly timetable slots with overlap validation.
  - Role-scoped schedule query API (`/api/v1/schedules`).
- **Teacher Weekly Timetable (`/teacher/schedule`)**:
  - Visual Monday–Friday calendar grid showing assigned classes, times, room numbers, and direct shortcut to start roll call for that class.
- **Student Weekly Timetable (`/student/schedule`)**:
  - Visual Monday–Friday schedule showing daily subjects, class periods, room numbers, and instructor names.
- **Enhanced Course Roll Call (`/teacher/attendance`)**:
  - Daily course roll call: Teachers select date and course session (or follow their scheduled class shortcut).
  - Prominent 1-click toggling between **Present** (emerald) and **Absent** (rose), with secondary Late/Excused options.
  - "Mark All Present" convenience action.
  - Persisting `subject_id` and optional `schedule_id` to `attendances` table with validation against duplicate submissions on the same day.

### Non-Goals
- Automated bell system / IoT hardware triggering.
- Biometric fingerprint or RFID card scanning.
- Dynamic multi-campus facility allocation algorithms.

### Anti-Goals
- Complex multi-step checkout or wizard flows to take attendance. Marking attendance for a class must take less than 15 seconds.
- Rigid, hardcoded schedule slots that do not allow courses to meet on flexible days or varying times.

---

## 3. Approaches Considered & Trade-offs

### Approach 1: Dedicated Weekly Timetable Model & Course Roll-Call (Selected)
- **Architecture**: A first-class `schedules` relational table linking classrooms, subjects, teachers, terms, days of the week, and start/end times. Attendance records associate to both `classroom_id` and `subject_id` (with optional `schedule_id`).
- **Pros**:
  - Accurately models realistic school routines (e.g. Math meets Mon/Wed/Fri at 08:00, Physics meets Tue/Thu at 10:00).
  - Clean separation of concerns between curriculum catalog (`subjects`) and calendar execution (`schedules`).
  - Supports role-scoped queries cleanly (Admin sees whole school/classroom, Teacher sees their teaching slots, Student sees their classroom routine).
- **Cons**: Requires a new database migration and new API endpoints.

### Approach 2: Flat Subject-Slot Mapping (Rejected)
- **Architecture**: Adding `day_of_week`, `start_time`, `end_time` columns directly to `subjects`.
- **Why Rejected**: A subject cannot meet more than once a week without duplicating the subject record itself. Breaks database normalization.

---

## 4. Architectural Decisions (Builder Check Resolutions)

1. **Daily Course Attendance & Schedule Linkage**:
   - In accordance with the user's explicit specification ("take attendance daily everyday each course"), attendance records represent daily course roll-calls identified by `(student_id, date, subject_id)`.
   - To link attendance to scheduled timetable sessions seamlessly, `attendances` will include a nullable `schedule_id` foreign key. Clicking "Take Attendance" from a schedule card pre-fills the subject, classroom, date, and schedule link.
2. **Teacher Authorization for Schedules**:
   - A schedule slot defaults to `subject.teacher_id`, but can also designate an alternate instructor (e.g. co-teacher or lab instructor).
   - The attendance policy authorizes the classroom's homeroom teacher, the subject's primary teacher, AND any instructor assigned to that subject's schedule slots.
3. **Homeroom Advisory on Timetable**:
   - `schedules.subject_id` is made `NULLABLE`. When null, the slot designates a "Homeroom / Advisory Period" led by `classroom.homeroom_teacher_id`, allowing homeroom advisory periods (e.g. 08:00–08:30) to appear on the timetable.
4. **Attendance History Aggregation & KPIs**:
   - The Classroom Hub's "Average Attendance Rate" KPI is computed based on recorded daily course and homeroom sessions for that classroom.
   - Tab 4 Attendance History fetches aggregated daily summaries via `GET /api/v1/admin/classrooms/{id}/attendance-history` with pagination to avoid transferring raw per-student records.
5. **Academic Term Scoping**:
   - `schedules` includes a `term` column (defaulting to `Semester 1`), matching the existing `term` structure used for grades. Timetables can be viewed and switched by term (Semester 1 / Semester 2).

---

## 5. Detailed Specification

### 5.1 Database Architecture

#### New Table: `schedules`
```sql
CREATE TABLE schedules (
    id BIGSERIAL PRIMARY KEY,
    classroom_id BIGINT NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    subject_id BIGINT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id BIGINT NOT NULL REFERENCES teacher_profiles(id) ON DELETE CASCADE,
    term VARCHAR(30) NOT NULL DEFAULT 'Semester 1',
    day_of_week VARCHAR(15) NOT NULL, -- 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
    start_time TIME NOT NULL,          -- e.g. '08:00:00'
    end_time TIME NOT NULL,            -- e.g. '09:30:00'
    room VARCHAR(50) NULL,             -- e.g. 'Room 102', 'Science Lab'
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

CREATE INDEX idx_schedules_classroom_day ON schedules(classroom_id, term, day_of_week);
CREATE INDEX idx_schedules_teacher_day ON schedules(teacher_id, term, day_of_week);
```

#### Migration Update: `attendances`
- Add `schedule_id` BIGINT NULL REFERENCES schedules(id) ON DELETE SET NULL.

### 5.2 Backend REST API Endpoints

1. **Classroom Hub Details**:
   - `GET /api/v1/admin/classrooms/{id}/hub`: Returns complete classroom metadata, students roster, subjects with assigned teachers, and aggregate KPI rates.
   - `GET /api/v1/admin/classrooms/{id}/attendance-history`: Returns paginated daily roll-call summary rows: `{ date, subject_name, total_students, present_count, absent_count, attendance_rate }`.
2. **Schedule Management**:
   - `GET /api/v1/schedules`:
     - Admin: filters by `classroom_id`, `teacher_id`, and `term`.
     - Teacher: auto-scoped to authenticated teacher's teaching assignments.
     - Student: auto-scoped to authenticated student's enrolled classroom.
   - `POST /api/v1/admin/schedules`: Creates a schedule entry (validates start_time < end_time, and verifies no overlapping classroom or teacher booking).
   - `PUT /api/v1/admin/schedules/{id}`: Updates a schedule entry.
   - `DELETE /api/v1/admin/schedules/{id}`: Deletes a schedule entry.
3. **Course Attendance Support**:
   - `GET /api/v1/attendances`: Supports filtering by `subject_id` alongside `classroom_id` and `date`.
   - `POST /api/v1/attendances/batch`: Supports `subject_id` and `schedule_id` in the batch payload, saving course-level roll-calls.

### 5.3 Frontend UI/UX Structure

1. **Admin Classroom Hub (`/admin/classrooms/:id`)**:
   - Header with classroom name, grade level, academic year, homeroom teacher badge, and "Back to Classrooms" button.
   - Overview KPI Cards: Enrolled Students, Total Courses, Weekly Schedule Hours, Average Attendance Rate.
   - Interactive Tabs:
     - `Students`: Searchable shadcn `Table` with student avatars, codes, and guardian details.
     - `Curriculum`: Table of subjects, codes, and designated instructors.
     - `Weekly Timetable`: Interactive 5-day grid (Mon–Fri) with slot cards showing subject, teacher, time, and room, with "+ Add Period" dialog.
     - `Attendance`: Historical log showing attendance percentage by date/subject.
2. **Teacher Daily Attendance (`/teacher/attendance`)**:
   - Course Session Selector: Toggle between "Homeroom Daily Roll Call" and specific assigned course sessions (e.g. "Physics 10A").
   - Roll-call table: 1-click prominent toggle button group for each student (`[Present]` in emerald vs `[Absent]` in rose, with subtle optional late/excused buttons).
   - One-click "Mark All Present" button.
3. **Teacher Timetable (`/teacher/schedule`)**:
   - Weekly timetable grid displaying scheduled teaching periods across all assigned classrooms and subjects.
   - Quick action button on each scheduled card to "Take Attendance" for that class.
4. **Student Timetable (`/student/schedule`)**:
   - Weekly class schedule showing daily schedule periods, subject names, room assignments, and instructor names.

---

## 6. Security & RBAC Policies

- **Admin**: Full read/write access to all classrooms, schedules, attendances, and rosters.
- **Teacher**: Read-only access to their own teaching schedules and assigned classroom rosters; write access to attendance for assigned courses or homeroom classrooms.
- **Student**: Read-only access to their own classroom's learning schedule and personal attendance records.
- **Validation**:
  - `start_time` must precede `end_time`.
  - `subject_id` (if present) must belong to the specified `classroom_id`.
  - Prevent duplicate schedule slots for the same classroom or same teacher at overlapping times on the same day and term.
