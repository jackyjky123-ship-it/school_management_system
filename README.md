# 🎓 Modern School Management System (Portfolio Showcase)

A full-stack, enterprise-grade **School Management System** built with **Laravel 13 REST API** and **React 19 SPA**. Designed specifically as a portfolio demonstration of high-standard full-stack architecture, deterministic academic workflows, real-time GPA calculations, and multi-tenant role-based access control.

---

## 🌟 Key Highlights & Engineering Features

- **Multi-Role RBAC:** Powered by Spatie Permission (`admin`, `teacher`, `student`) with Sanctum token authentication.
- **1-Click Demo Persona Switcher:** Instant switcher toolbar on the login screen to jump between Administrator, STEM Teacher, and Honor Student personas without entering credentials.
- **Academic Lifecycle Integrity:**
  - **Admin Portal:** Institutional metrics, CRUD management for classrooms, subjects, teachers, and student enrollment.
  - **Teacher Portal:** Quick roll-call roster with 1-click "Mark All Present", bulk spreadsheet grading grid with real-time percentage/letter grade computation.
  - **Student Portal:** Real-time 4.0 GPA computation, attendance gauge ring, downloadable/filterable academic report card.
- **Pure Calculation Engine:** Isolated `AcademicCalculationService` mapping continuous scores to standard letter grades ($A \ge 90\%$, $B \ge 80\%$, $C \ge 70\%$, $D \ge 60\%$, $F < 60\%$) and unweighted 4.0 grade point averages.
- **Modern UI/UX:** Built on React 19, TypeScript 5.9, Tailwind CSS v4, `@base-ui/react`, TanStack Query v5, and Lucide Icons.

---

## 🛠️ Tech Stack & Architecture

### Backend (REST API)
- **Framework:** Laravel 13 (PHP 8.3+)
- **Database:** PostgreSQL (Neon Serverless)
- **Auth:** Laravel Sanctum (Stateful & Bearer Token)
- **Authorization:** Spatie Laravel Permission (Sanctum guard)
- **Testing:** Pest & PHPUnit (21 test suites, 164 assertions passing)
- **Design Patterns:** Form Request Validation, API JsonResources, Enums for Roles/Statuses, Database Transactions with Upserts.

### Frontend (SPA)
- **Framework:** React 19 + Vite + TypeScript 5.9
- **Routing:** React Router v7
- **Data Fetching & Cache:** TanStack Query v5 + Axios Interceptors
- **Styling:** Tailwind CSS v4 + Radix/Base UI Accessible Primitives
- **Toast Notifications:** Sonner

---

## 👥 Demo Personas & Credentials

For direct evaluation, the login page (`/login`) includes instant 1-click buttons:

| Role | Account Email | Default Password | Responsibilities / Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@school.test` | `password` | Complete institutional oversight: classrooms, subjects, faculty roster, student enrollments. |
| **Teacher** | `teacher.math@school.test` | `password` | Scoped to assigned subjects & classrooms; roll-call attendance; bulk spreadsheet grading. |
| **Teacher** | `teacher.science@school.test` | `password` | Physical Sciences faculty member. |
| **Student** | `student@school.test` | `password` | Personalized dashboard: 4.0 GPA, attendance compliance gauge, terminal report card. |

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- PHP 8.3+ & Composer
- Node.js 20+ & npm
- PostgreSQL connection string (or Neon DB)

### 1. Backend Setup
```bash
cd backend

# Install dependencies
composer install

# Configure environment
cp .env.example .env
php artisan key:generate

# Run migrations and deterministic seeder
php artisan migrate:fresh --seed

# Start development API server (default http://127.0.0.1:8000)
php artisan serve
```

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development SPA server (default http://localhost:5173)
npm run dev
```

---

## 🧪 Testing & Verification

The application is thoroughly verified end-to-end:

### Run Backend Tests (21 tests, 164 assertions)
```bash
cd backend
php artisan test
```

### Run Frontend Build & Typecheck
```bash
cd frontend
npm run build
```

---

## 📂 Project Structure

```
school-management-system/
├── backend/
│   ├── app/
│   │   ├── Enums/                 # RoleEnums, AttendanceStatusEnum
│   │   ├── Http/Controllers/Api/  # Auth, Dashboard, Grade, Attendance, Admin/*
│   │   ├── Http/Requests/         # Strictly validated FormRequests
│   │   ├── Http/Resources/        # Consistent JSON Response Envelopes
│   │   ├── Models/                # User, Classroom, Subject, TeacherProfile, etc.
│   │   └── Services/              # Pure AcademicCalculationService
│   ├── database/seeders/          # Deterministic DemoSchoolSeeder
│   └── tests/Feature/             # Complete feature test suites & EndToEndAcademicLifecycleTest
├── frontend/
│   ├── src/
│   │   ├── api/                   # Axios client & request interceptors
│   │   ├── components/            # UI components (Base UI, buttons, tables, badges)
│   │   ├── context/               # AuthContext & role session management
│   │   ├── features/              # Feature modules: admin/, teacher/, student/, auth/
│   │   └── layouts/               # Responsive AppShell & Sidebar navigation
└── PLAN.md                        # Architectural specification & execution tracking
```

---

## 📄 License
This project was developed for educational and portfolio demonstration purposes. All rights reserved.
