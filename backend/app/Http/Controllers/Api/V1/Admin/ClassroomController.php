<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\AttendanceStatusEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreClassroomRequest;
use App\Http\Requests\Admin\UpdateClassroomRequest;
use App\Http\Resources\ClassroomResource;
use App\Http\Resources\ScheduleResource;
use App\Models\Attendance;
use App\Models\Classroom;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClassroomController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Classroom::with(['homeroomTeacher.user'])
            ->withCount(['students', 'subjects']);

        if ($request->filled('search')) {
            $search = $request->query('search');
            $op = DB::getDriverName() === 'pgsql' ? 'ilike' : 'like';
            $query->where(function ($q) use ($search, $op) {
                $q->where('name', $op, "%{$search}%")
                    ->orWhere('grade_level', $op, "%{$search}%");
            });
        }

        $classrooms = $query->latest()->get();

        return $this->successResponse(
            ClassroomResource::collection($classrooms),
            'Classrooms retrieved successfully'
        );
    }

    public function store(StoreClassroomRequest $request): JsonResponse
    {
        $classroom = Classroom::create($request->validated());

        return $this->successResponse(
            new ClassroomResource($classroom->load('homeroomTeacher.user')->loadCount(['students', 'subjects'])),
            'Classroom created successfully',
            201
        );
    }

    public function show(Classroom $classroom): JsonResponse
    {
        return $this->successResponse(
            new ClassroomResource($classroom->load(['homeroomTeacher.user'])->loadCount(['students', 'subjects'])),
            'Classroom details retrieved'
        );
    }

    public function update(UpdateClassroomRequest $request, Classroom $classroom): JsonResponse
    {
        $classroom->update($request->validated());

        return $this->successResponse(
            new ClassroomResource($classroom->fresh(['homeroomTeacher.user'])->loadCount(['students', 'subjects'])),
            'Classroom updated successfully'
        );
    }

    public function destroy(Classroom $classroom): JsonResponse
    {
        $classroom->delete();

        return $this->successResponse(null, 'Classroom deleted successfully');
    }

    public function hub(Classroom $classroom): JsonResponse
    {
        $classroom->load([
            'homeroomTeacher.user',
            'students.user',
            'subjects.teacher.user',
            'schedules.subject',
            'schedules.teacher.user',
        ]);

        $attendances = Attendance::where('classroom_id', $classroom->id);
        $totalRecords = (clone $attendances)->count();
        $presentCount = (clone $attendances)->where('status', AttendanceStatusEnum::PRESENT->value)->count();
        $lateCount = (clone $attendances)->where('status', AttendanceStatusEnum::LATE->value)->count();
        $absentCount = (clone $attendances)->where('status', AttendanceStatusEnum::ABSENT->value)->count();
        $excusedCount = (clone $attendances)->where('status', AttendanceStatusEnum::EXCUSED->value)->count();

        $distinctSessions = Attendance::where('classroom_id', $classroom->id)
            ->select('date', 'subject_id')
            ->distinct()
            ->get()
            ->count();

        $attendanceRate = $totalRecords > 0 ? round((($presentCount + $lateCount) / $totalRecords) * 100, 1) : 0.0;

        return $this->successResponse([
            'classroom' => [
                'id' => $classroom->id,
                'name' => $classroom->name,
                'grade_level' => $classroom->grade_level,
                'academic_year' => $classroom->academic_year,
                'homeroom_teacher' => $classroom->homeroomTeacher ? [
                    'id' => $classroom->homeroomTeacher->id,
                    'name' => $classroom->homeroomTeacher->user?->name,
                    'email' => $classroom->homeroomTeacher->user?->email,
                    'specialization' => $classroom->homeroomTeacher->specialization,
                ] : null,
            ],
            'counts' => [
                'students' => $classroom->students->count(),
                'subjects' => $classroom->subjects->count(),
                'schedules' => $classroom->schedules->count(),
            ],
            'students' => $classroom->students->map(fn ($student) => [
                'id' => $student->id,
                'user_id' => $student->user_id,
                'name' => $student->user?->name,
                'email' => $student->user?->email,
                'student_code' => $student->student_code,
                'gender' => $student->gender,
            ]),
            'subjects' => $classroom->subjects->map(fn ($subject) => [
                'id' => $subject->id,
                'name' => $subject->name,
                'code' => $subject->code,
                'teacher' => $subject->teacher ? [
                    'id' => $subject->teacher->id,
                    'name' => $subject->teacher->user?->name,
                    'email' => $subject->teacher->user?->email,
                ] : null,
            ]),
            'schedules' => ScheduleResource::collection($classroom->schedules),
            'attendance_stats' => [
                'total_sessions_recorded' => $distinctSessions,
                'total_records' => $totalRecords,
                'attendance_rate' => $attendanceRate,
                'present_count' => $presentCount,
                'late_count' => $lateCount,
                'absent_count' => $absentCount,
                'excused_count' => $excusedCount,
            ],
        ], 'Classroom hub retrieved successfully');
    }

    public function attendanceHistory(Request $request, Classroom $classroom): JsonResponse
    {
        $query = Attendance::where('classroom_id', $classroom->id)
            ->with(['subject', 'recorder', 'schedule'])
            ->select(
                'date',
                'subject_id',
                'schedule_id',
                DB::raw('COUNT(*) as total_students'),
                DB::raw("SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count"),
                DB::raw("SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_count"),
                DB::raw("SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_count"),
                DB::raw("SUM(CASE WHEN status = 'excused' THEN 1 ELSE 0 END) as excused_count"),
                DB::raw('MAX(recorded_by) as recorded_by_id'),
                DB::raw('MAX(created_at) as recorded_at')
            )
            ->groupBy('date', 'subject_id', 'schedule_id')
            ->orderBy('date', 'desc');

        if ($request->filled('start_date')) {
            $query->whereDate('date', '>=', $request->query('start_date'));
        }
        if ($request->filled('end_date')) {
            $query->whereDate('date', '<=', $request->query('end_date'));
        }
        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->query('subject_id'));
        }

        $sessions = $query->paginate($request->query('per_page', 15));

        $items = $sessions->getCollection()->map(function ($session) {
            $dateString = is_string($session->date) ? substr($session->date, 0, 10) : $session->date->format('Y-m-d');
            $total = (int) $session->total_students;
            $present = (int) $session->present_count;
            $late = (int) $session->late_count;
            $absent = (int) $session->absent_count;
            $excused = (int) $session->excused_count;
            $rate = $total > 0 ? round((($present + $late) / $total) * 100, 1) : 0.0;

            return [
                'date' => $dateString,
                'subject_id' => $session->subject_id,
                'subject_name' => $session->subject?->name ?? 'Homeroom Advisory',
                'subject_code' => $session->subject?->code,
                'schedule_id' => $session->schedule_id,
                'total_students' => $total,
                'present_count' => $present,
                'late_count' => $late,
                'absent_count' => $absent,
                'excused_count' => $excused,
                'attendance_rate' => $rate,
                'recorded_by_name' => $session->recorder?->name ?? 'System',
                'recorded_at' => $session->recorded_at,
            ];
        });

        return $this->successResponse([
            'items' => $items,
            'pagination' => [
                'current_page' => $sessions->currentPage(),
                'last_page' => $sessions->lastPage(),
                'per_page' => $sessions->perPage(),
                'total' => $sessions->total(),
            ],
        ], 'Classroom attendance history retrieved successfully');
    }
}
