# Graph Report - school-management-system  (2026-11-04)

## Corpus Check
- 222 files · ~84,337 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 24 file(s) not represented in the graph (top: (none) 18, .css 3, .example 1)

## Summary
- 972 nodes · 1909 edges · 192 communities (41 shown, 151 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 98 edges (avg confidence: 0.84)
- Token cost: 5,680 input · 4,920 output

## Community Hubs (Navigation)
- Frontend React UI & Client State
- Database Migrations & Schemas
- Testing Best Practices & Guidelines
- Feature & Integration Tests
- Academic Models & Relations
- Build Tools & Vite Config
- Backend API Controllers
- Attendance Domain Models
- Component Library Config
- Frontend NPM Dependencies
- TypeScript App Configuration
- UI Layout & Design References
- Admin HTTP Request Validation
- Frontend Tooling & Types
- Dashboard Metrics & Resources
- StudentController Endpoint
- TeacherController Endpoint
- tsconfig.node.json Module
- RoleEnums Module
- SubjectController Endpoint
- BatchStoreAttendanceRequest Validation
- ClassroomController Endpoint
- User Model Entity
- cache Module
- Tasks and Meetings Calend Module
- app Module
- eslint.config.js Module
- Bluesky Brand Icon (solid Module
- LoginRequest Validation
- require-dev Module
- composer.json Module
- scripts Module
- Frontend UI Component 33
- DashboardController Endpoint
- pestphp/pest-plugin Module
- opencode.json Module
- AppServiceProvider Module
- require Module
- Frontend HTML Entry Point Module
- Isometric Stacked-Layer H Module
- Purple Lightning-Bolt Mar Module
- tsconfig.json Module
- autoload Module
- scripts Module
- Sharp-Edged Zigzag Silhou Module
- autoload-dev Module
- extra Module
- mcp.json Module
- tailwindcss@^4.3.3 Module
- Skill Rule & Spec 58
- Skill Rule & Spec 63
- Skill Rule & Spec 73
- Skill Rule & Spec 77
- Skill Rule & Spec 83
- Skill Rule & Spec 87
- Skill Rule & Spec 91
- Skill Rule & Spec 98
- Skill Rule & Spec 104
- Skill Rule & Spec 109
- Skill Rule & Spec 115
- Skill Rule & Spec 122
- Database Migration 128
- Skill Rule & Spec 134
- Skill Rule & Spec 142
- Skill Rule & Spec 149
- Skill Rule & Spec 155
- Skill Rule & Spec 165
- Skill Rule & Spec 170
- Skill Rule & Spec 176
- Skill Rule & Spec 177
- Skill Rule & Spec 178
- Skill Rule & Spec 179
- Skill Rule & Spec 180
- React Logo Module
- Skill Rule & Spec 191

## God Nodes (most connected - your core abstractions)
1. `react` - 33 edges
2. `Button()` - 32 edges
3. `Badge()` - 30 edges
4. `User` - 26 edges
5. `lucide-react` - 25 edges
6. `Skeleton()` - 25 edges
7. `BaseApiRequest` - 24 edges
8. `Input()` - 23 edges
9. `Classroom` - 22 edges
10. `Subject` - 22 edges

## Surprising Connections (you probably didn't know these)
- `CLAUDE.md Agent Guidelines` --semantically_similar_to--> `Laravel Boost Guidelines`  [INFERRED] [semantically similar]
  backend/CLAUDE.md → backend/AGENTS.md
- `Global Fakes in Pest.php` --semantically_similar_to--> `Framework Fakes`  [INFERRED] [semantically similar]
  backend/.claude/skills/testing-best-practices/rules/performance.md → backend/.claude/skills/testing-best-practices/rules/isolation.md
- `Global Fakes in Pest.php` --semantically_similar_to--> `Outbound HTTP Testing`  [INFERRED] [semantically similar]
  backend/.claude/skills/testing-best-practices/rules/performance.md → backend/.claude/skills/testing-best-practices/rules/isolation.md
- `Test Review Checklist` --conceptually_related_to--> `Test Names as Specifications`  [INFERRED]
  backend/.claude/skills/testing-best-practices/rules/review.md → backend/.claude/skills/testing-best-practices/rules/naming.md
- `Parallel Pest Execution` --conceptually_related_to--> `Factories and Test Data`  [INFERRED]
  backend/.claude/skills/testing-best-practices/rules/performance.md → backend/.claude/skills/testing-best-practices/rules/test-data.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Pest Testing Quality Rule Set** — backend__claude_skills_testing_best_practices_rules_isolation_dependency_isolation, backend__claude_skills_testing_best_practices_rules_naming_test_naming, backend__claude_skills_testing_best_practices_rules_performance_test_suite_performance, backend__claude_skills_testing_best_practices_rules_review_test_review_checklist, backend__claude_skills_testing_best_practices_rules_security_security_testing, backend__claude_skills_testing_best_practices_rules_test_data_factories, backend_agents_testing_best_practices_skill [INFERRED 0.85]
- **Laravel Boost Agent Workflow** — backend_agents_laravel_boost_guidelines, backend_agents_boost_mcp_tools, backend_agents_search_docs, backend_agents_laravel_way, backend_agents_pint_formatter, backend_agents_pest_testing [EXTRACTED 1.00]
- **Security Test Boundary Matrix** — backend__claude_skills_testing_best_practices_rules_security_security_testing, backend__claude_skills_testing_best_practices_rules_security_cross_tenant_access, backend__claude_skills_testing_best_practices_rules_security_output_escaping, backend__claude_skills_testing_best_practices_rules_security_query_injection [EXTRACTED 1.00]
- **Main analytics dashboard composition** — design_design_ref_dashboard, design_design_ref_sidebar_rail, design_design_ref_kpi_cards, design_design_ref_earnings_chart, design_design_ref_signups_table [EXTRACTED 1.00]
- **Right-rail scheduling and engagement metrics** — design_design_ref_calendar_widget, design_design_ref_traffic_sources, design_design_ref_visits_gauge, design_design_ref_completion_rate [EXTRACTED 1.00]
- **Reusable visual design system** — design_design_ref_card_layout_system, design_design_ref_color_system, design_design_ref_type_hierarchy, design_design_ref_kpi_cards, design_design_ref_earnings_chart, design_design_ref_completion_rate [INFERRED 0.85]
- **Shared dashboard analytics pattern across role dashboards and reports** — design_layout_ref_screen_preview, design_layout_ref_dashboard_widgets, design_layout_ref_student_dashboard, design_layout_ref_teacher_dashboard, design_layout_ref_transactions, design_layout_ref_attendance_report [EXTRACTED 1.00]
- **Student learning journey from dashboard to courses, lessons and live classes** — design_layout_ref_screen_preview, design_layout_ref_student_persona, design_layout_ref_student_dashboard, design_layout_ref_my_courses, design_layout_ref_course_overview, design_layout_ref_course_player, design_layout_ref_live_class_list, design_layout_ref_live_class_room [INFERRED 0.85]
- **Teacher administration flow for attendance, scheduling and live course setup** — design_layout_ref_screen_preview, design_layout_ref_teacher_persona, design_layout_ref_teacher_dashboard, design_layout_ref_attendance_report, design_layout_ref_schedule, design_layout_ref_create_class_routine, design_layout_ref_create_live_course, design_layout_ref_live_class_list [INFERRED 0.85]
- **Hero Illustration Composition** — frontend_src_assets_hero_illustration, frontend_src_assets_hero_layered_plates, frontend_src_assets_hero_isometric_style, frontend_src_assets_hero_violet_gradient, frontend_src_assets_hero_ui_role [INFERRED 0.90]
- **Layered Vite logo composition** — frontend_src_assets_vite_logo, frontend_src_assets_vite_lightning_bolt_mark, frontend_src_assets_vite_parenthesis_frame, frontend_src_assets_vite_mesh_glow [EXTRACTED 1.00]

## Communities (192 total, 151 thin omitted)

### Community 0 - "Frontend React UI & Client State"
Cohesion: 0.07
Nodes (92): apiClient, App(), RootRedirect(), AppShell(), ProtectedRoute(), ProtectedRouteProps, NavItem, SidebarNav() (+84 more)

### Community 1 - "Database Migrations & Schemas"
Cohesion: 0.09
Nodes (20): {closure#1}(), {closure#2}(), {closure#3}(), {closure#1}(), {closure#2}(), {closure#1}(), {closure#2}(), {closure#3}() (+12 more)

### Community 2 - "Testing Best Practices & Guidelines"
Cohesion: 0.07
Nodes (9): Laravel Boost MCP Tools, Laravel Pint Formatter, Boost search-docs Tool, testing-best-practices Skill, CLAUDE.md Agent Guidelines, Open Crawler Policy, Laracasts, Laravel Boost (+1 more)

### Community 3 - "Feature & Integration Tests"
Cohesion: 0.09
Nodes (5): AdminManagementTest, AuthTest, DemoSeederTest, EndToEndAcademicLifecycleTest, TestCase

### Community 4 - "Academic Models & Relations"
Cohesion: 0.13
Nodes (6): Classroom, StudentProfile, Subject, TeacherProfile, AcademicOperationsTest, DatabaseSchemaTest

### Community 5 - "Build Tools & Vite Config"
Cohesion: 0.10
Nodes (20): devDependencies, concurrently@^10.0.3, laravel-vite-plugin@^3.1, tailwindcss@^4.0.0, @tailwindcss/vite@^4.0.0, vite@^8.0.0, tailwindcss, @tailwindcss/vite (+12 more)

### Community 6 - "Backend API Controllers"
Cohesion: 0.17
Nodes (6): AttendanceController, AuthController, GradeController, Controller, UserResource, ApiResponse

### Community 8 - "Component Library Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 9 - "Frontend NPM Dependencies"
Cohesion: 0.09
Nodes (22): dependencies, axios@^1.21.0, @base-ui/react@^1.9.0, class-variance-authority@^0.7.1, cn@^0.5.1, @fontsource-variable/geist@^5.3.0, @hookform/resolvers@^7.0.1, lucide-react@^1.66.0 (+14 more)

### Community 10 - "TypeScript App Configuration"
Cohesion: 0.09
Nodes (21): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleDetection (+13 more)

### Community 11 - "UI Layout & Design References"
Cohesion: 0.25
Nodes (21): Student Attendance Report with Bar Chart, Donut Chart and Table, My Course Overview with Watching Activity and Progress Table, Course Lesson Player with Course Content Sidebar, Create Class Routine Form, Create Live Course Form, KPI Cards, Charts, Tables and Calendar Widgets, Green and Pastel Education Dashboard Design System, & Many More - Enjoy Our Product Footer Call to Action (+13 more)

### Community 12 - "Admin HTTP Request Validation"
Cohesion: 0.15
Nodes (5): UpdateStudentRequest, UpdateTeacherRequest, BatchStoreAttendanceRequest, BaseApiRequest, BatchStoreGradeRequest

### Community 13 - "Frontend Tooling & Types"
Cohesion: 0.14
Nodes (19): devDependencies, eslint@^10.13.0, @types/node@^24.19.2, @types/react@^19.3.0, @types/react-dom@^19.3.0, typescript@~5.9.3, vite@^8.3.5, @vitejs/plugin-react@^6.1.2 (+11 more)

### Community 14 - "Dashboard Metrics & Resources"
Cohesion: 0.18
Nodes (3): DashboardController, AttendanceResource, GradeResource

### Community 15 - "StudentController Endpoint"
Cohesion: 0.15
Nodes (4): {closure#3}(), StudentController, StoreStudentRequest, StudentResource

### Community 16 - "TeacherController Endpoint"
Cohesion: 0.15
Nodes (4): {closure#3}(), TeacherController, StoreTeacherRequest, TeacherResource

### Community 17 - "tsconfig.node.json Module"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 18 - "RoleEnums Module"
Cohesion: 0.15
Nodes (6): RoleEnums, ADMIN, STUDENT, TEACHER, DatabaseSeeder, DemoSchoolSeeder

### Community 19 - "SubjectController Endpoint"
Cohesion: 0.18
Nodes (4): SubjectController, StoreSubjectRequest, UpdateSubjectRequest, SubjectResource

### Community 20 - "BatchStoreAttendanceRequest Validation"
Cohesion: 0.14
Nodes (6): AttendanceStatusEnum, ABSENT, EXCUSED, LATE, PRESENT, DashboardApiTest

### Community 21 - "ClassroomController Endpoint"
Cohesion: 0.22
Nodes (4): ClassroomController, StoreClassroomRequest, UpdateClassroomRequest, ClassroomResource

### Community 24 - "Tasks and Meetings Calend Module"
Cohesion: 0.32
Nodes (12): Tasks and Meetings Calendar Widget, Soft Gray Canvas with Rounded White Card Layout, Indigo Primary Palette with Semantic Delta Badges, Tasks Completion Rate Segmented Progress (67.1%), Admin Analytics Dashboard Design Reference, Earnings Stacked Block Bar Chart (Achieved vs Projected), KPI Stat Cards: New Users, Revenue, Projects, Dark Icon-Rail Sidebar Navigation (+4 more)

### Community 25 - "app Module"
Cohesion: 0.22
Nodes (3): {closure#1}(), {closure#2}(), {closure#3}()

### Community 27 - "eslint.config.js Module"
Cohesion: 0.18
Nodes (10): @eslint/js@^10.0.1, eslint-plugin-react-hooks@^7.1.1, eslint-plugin-react-refresh@^0.5.7, globals@^17.13.0, typescript-eslint@^8.72.0, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh (+2 more)

### Community 28 - "Bluesky Brand Icon (solid Module"
Cohesion: 0.24
Nodes (10): Bluesky Brand Icon (solid #08060d glyph, 16x17 viewBox), Discord Brand Icon (solid #08060d glyph, 20x19 viewBox), Documentation Icon (1.35px #aa3bff stroked document glyph, 21x20 viewBox), Documentation Resource Link, GitHub Brand Icon (solid #08060d octocat glyph, 19x19 viewBox), SVG Icon Sprite (6 symbols), Social/Community Icon (1.35px #aa3bff stroked people-and-star glyph, 20x20 viewBox), Social Media Profile Links (Bluesky, Discord, X) (+2 more)

### Community 30 - "require-dev Module"
Cohesion: 0.20
Nodes (10): require-dev, fakerphp/faker, laravel/boost, laravel/pail, laravel/pao, laravel/pint, mockery/mockery, nunomaduro/collision (+2 more)

### Community 31 - "composer.json Module"
Cohesion: 0.22
Nodes (8): description, keywords, license, minimum-stability, name, prefer-stable, $schema, type

### Community 32 - "scripts Module"
Cohesion: 0.22
Nodes (9): scripts, dev, post-autoload-dump, post-create-project-cmd, post-root-package-install, post-update-cmd, pre-package-uninstall, setup (+1 more)

### Community 33 - "Frontend UI Component 33"
Cohesion: 0.25
Nodes (6): next-themes@^0.4.6, react-dom@^19.3.1, Toaster(), queryClient, next-themes, react-dom

### Community 35 - "pestphp/pest-plugin Module"
Cohesion: 0.29
Nodes (7): pestphp/pest-plugin, php-http/discovery, config, allow-plugins, optimize-autoloader, preferred-install, sort-packages

### Community 36 - "opencode.json Module"
Cohesion: 0.29
Nodes (6): command, enabled, type, mcp, laravel-boost, $schema

### Community 38 - "require Module"
Cohesion: 0.33
Nodes (6): require, laravel/framework, laravel/sanctum, laravel/tinker, php, spatie/laravel-permission

### Community 39 - "Frontend HTML Entry Point Module"
Cohesion: 0.33
Nodes (5): Frontend HTML Entry Point, React Root Mount Element, React Compiler, React + TypeScript + Vite Template, Vite React Plugins (Oxc and SWC)

### Community 40 - "Isometric Stacked-Layer H Module"
Cohesion: 0.40
Nodes (5): Isometric Stacked-Layer Hero Illustration, Minimal Isometric SaaS Illustration Style, Two Floating Rounded-Square Plates, Decorative Hero or Empty-State Artwork, Violet-to-Magenta Gradient Accent

### Community 41 - "Purple Lightning-Bolt Mar Module"
Cohesion: 0.40
Nodes (6): Purple Lightning-Bolt Mark, Vite Logo, Violet-to-Cyan Mesh Glow Treatment, Adaptive Black-and-White Parenthesis Frame, Stock Vite React Template Asset (Present but Unreferenced), Vite Brand and Build Tool

### Community 42 - "tsconfig.json Module"
Cohesion: 0.33
Nodes (5): compilerOptions, baseUrl, paths, files, references

### Community 44 - "autoload Module"
Cohesion: 0.40
Nodes (5): autoload, psr-4, App\\, Database\\Factories\\, Database\\Seeders\\

### Community 47 - "scripts Module"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 49 - "Sharp-Edged Zigzag Silhou Module"
Cohesion: 0.50
Nodes (4): Sharp-Edged Zigzag Silhouette Style, Purple Angular Zigzag Favicon Mark, Silhouette-Masked Gaussian Glow Treatment, Violet-to-Cyan Mesh Gradient Palette

### Community 51 - "autoload-dev Module"
Cohesion: 0.67
Nodes (3): autoload-dev, psr-4, Tests\\

### Community 52 - "extra Module"
Cohesion: 0.67
Nodes (3): extra, laravel, dont-discover

## Ambiguous Edges - Review These
- `Recent Signups Table with Authentication Providers` → `Traffic Sources Breakdown Card`  [AMBIGUOUS]
  design/design_ref.png · relation: conceptually_related_to

## Knowledge Gaps
- **51 isolated node(s):** `php`, `PRESENT`, `ABSENT`, `LATE`, `EXCUSED` (+46 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 442 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **151 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AttendanceStatusEnum` connect `BatchStoreAttendanceRequest Validation` to `Database Migrations & Schemas`, `Attendance Domain Models`, `DashboardController Endpoint`, `Admin HTTP Request Validation`, `RoleEnums Module`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **What connects `php`, `PRESENT`, `ABSENT` to the rest of the system?**
  _51 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Frontend React UI & Client State` be split into smaller, more focused modules?**
  _Cohesion score 0.0739535405678375 - nodes in this community are weakly interconnected._
- **Why does `User` connect `User Model Entity` to `Feature & Integration Tests`, `Academic Models & Relations`, `Backend API Controllers`, `Attendance Domain Models`, `StudentController Endpoint`, `TeacherController Endpoint`, `RoleEnums Module`, `BatchStoreAttendanceRequest Validation`, `cache Module`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Should `Database Migrations & Schemas` be split into smaller, more focused modules?**
  _Cohesion score 0.08536585365853659 - nodes in this community are weakly interconnected._
- **Why does `@vitejs/plugin-react` connect `Frontend Tooling & Types` to `Build Tools & Vite Config`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Recent Signups Table with Authentication Providers` and `Traffic Sources Breakdown Card`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._