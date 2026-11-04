<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\AttendanceStatusEnum;
use App\Http\Controllers\Controller;
use App\Http\Resources\GradeResource;
use App\Models\Attendance;
use App\Models\Classroom;
use App\Models\Grade;
use App\Models\StudentProfile;
use App\Models\Subject;
use App\Models\TeacherProfile;
use App\Services\AcademicCalculationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    use ApiResponse;

    protected AcademicCalculationService $calculationService;

    public function __construct(AcademicCalculationService $calculationService)
    {
        $this->calculationService = $calculationService;
    }

    /**
     * High-level institutional statistics for School Admin.
     */
    public function adminMetrics(Request $request): JsonResponse
    {
        $todayStr = now()->toDateString();
        $presentStatuses = [
            AttendanceStatusEnum::PRESENT->value,
            AttendanceStatusEnum::LATE->value,
        ];

        // Homeroom roll call only: subject attendance duplicates a student on the same day.
        $todayQuery = Attendance::query()
            ->where('date', $todayStr)
            ->whereNull('subject_id');

        $todayCount = (clone $todayQuery)->distinct()->count('student_id');
        $presentCount = (clone $todayQuery)
            ->whereIn('status', $presentStatuses)
            ->distinct()
            ->count('student_id');
        $todayRate = $todayCount > 0 ? round(($presentCount / $todayCount) * 100, 1) : 0.0;

        $classroomDist = Classroom::withCount('students')->get()->map(function ($c) {
            return [
                'id' => $c->id,
                'name' => $c->name,
                'grade_level' => $c->grade_level,
                'students_count' => $c->students_count,
            ];
        });

        return $this->successResponse([
            'total_students' => StudentProfile::count(),
            'total_teachers' => TeacherProfile::count(),
            'total_classrooms' => Classroom::count(),
            'total_subjects' => Subject::count(),
            'today_attendance_recorded' => $todayCount > 0,
            'today_attendance_rate' => $todayRate,
            'classroom_distribution' => $classroomDist,
        ], 'Admin dashboard metrics retrieved successfully');
    }

    /**
     * Scoped teaching schedule, roll-call status, and grading ledger.
     */
    public function teacherMetrics(Request $request): JsonResponse
    {
        $user = $request->user();
        $teacher = $user->teacherProfile;

        if (! $teacher) {
            return $this->errorResponse('Teacher profile not found', 404);
        }

        $homeroomClasses = $teacher->homeroomClassrooms()->withCount('students')->get();
        $subjects = $teacher->subjects()->with('classroom')->get();

        $todayStr = now()->toDateString();
        $homeroomIds = $homeroomClasses->pluck('id');
        $homeroomStudentIds = StudentProfile::query()
            ->whereIn('classroom_id', $homeroomIds)
            ->pluck('id');
        $recordedStudentIds = Attendance::query()
            ->whereIn('classroom_id', $homeroomIds)
            ->where('date', $todayStr)
            ->whereNull('subject_id')
            ->pluck('student_id')
            ->unique();

        // Complete only when every homeroom student has a homeroom record today.
        $hasTakenAttendanceToday = $homeroomIds->isNotEmpty()
            && $homeroomStudentIds->isNotEmpty()
            && $homeroomStudentIds->diff($recordedStudentIds)->isEmpty();

        $recentGrades = Grade::with(['student.user', 'subject'])
            ->where('graded_by', $user->id)
            ->latest()
            ->take(6)
            ->get();

        return $this->successResponse([
            'today_roll_call_completed' => $hasTakenAttendanceToday,
            'assigned_classrooms' => $homeroomClasses->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'grade_level' => $c->grade_level,
                'students_count' => $c->students_count,
            ]),
            'assigned_subjects' => $subjects->map(fn ($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'code' => $s->code,
                'classroom_id' => $s->classroom_id,
                'classroom_name' => $s->classroom?->name,
            ]),
            'recent_grades' => GradeResource::collection($recentGrades),
        ], 'Teacher dashboard metrics retrieved successfully');
    }

    /**
     * Personalized student report card, GPA, and attendance breakdown.
     */
    public function studentMetrics(Request $request): JsonResponse
    {
        $user = $request->user();
        $student = $user->studentProfile;

        if (! $student) {
            return $this->errorResponse('Student profile not found', 404);
        }

        // Grades calculation
        $grades = $student->grades()->with(['subject', 'grader'])->latest()->get();
        $gradeSummary = $this->calculationService->calculateStudentSummary($grades);

        // Attendance calculation: homeroom records represent one school day each.
        $attendances = $student->attendances()
            ->whereNull('subject_id')
            ->latest('date')
            ->get();
        $totalDays = $attendances->count();
        $presentDays = $attendances->whereIn('status', [
            AttendanceStatusEnum::PRESENT,
            AttendanceStatusEnum::LATE,
        ])->count();
        $attendanceRate = $totalDays > 0 ? round(($presentDays / $totalDays) * 100, 1) : 0.0;

        // Enrolled Subjects
        $enrolledSubjects = $student->classroom
            ? $student->classroom->subjects()->with('teacher.user')->get()->map(fn ($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'code' => $s->code,
                'teacher_name' => $s->teacher?->user?->name,
            ])
            : collect();

        return $this->successResponse([
            'gpa' => $gradeSummary['gpa'],
            'average_percentage' => $gradeSummary['average_percentage'],
            'letter_grade' => $gradeSummary['letter_grade'],
            'attendance_rate' => $attendanceRate,
            'total_attendance_days' => $totalDays,
            'total_present_days' => $presentDays,
            'recent_grades' => GradeResource::collection($grades->take(6)),
            'enrolled_subjects' => $enrolledSubjects,
        ], 'Student dashboard metrics retrieved successfully');
    }
}
