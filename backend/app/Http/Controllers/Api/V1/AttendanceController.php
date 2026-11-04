<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Attendance\BatchStoreAttendanceRequest;
use App\Http\Resources\AttendanceResource;
use App\Models\Attendance;
use App\Models\Classroom;
use App\Models\Subject;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Attendance::with(['student.user', 'classroom', 'subject', 'recorder']);

        // Student privacy isolation: students only ever see their own records.
        if ($user->hasRole('student')) {
            $query->where('student_id', $user->studentProfile?->id);
        } else {
            // Teachers may only read attendance for classrooms and subjects they own.
            if (! $user->hasRole('admin')) {
                $teacher = $user->teacherProfile;

                if (! $teacher) {
                    return $this->errorResponse('Teacher profile not found.', 403);
                }

                $query->where(function ($scope) use ($teacher) {
                    $scope->whereIn('classroom_id', Classroom::query()
                        ->select('id')
                        ->where('homeroom_teacher_id', $teacher->id))
                        ->orWhereIn('subject_id', Subject::query()
                            ->select('id')
                            ->where('teacher_id', $teacher->id));
                });
            }

            if ($request->filled('student_id')) {
                $query->where('student_id', $request->query('student_id'));
            }
        }

        if ($request->filled('classroom_id')) {
            $query->where('classroom_id', $request->query('classroom_id'));
        }

        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->query('subject_id'));
        }

        if ($request->boolean('homeroom')) {
            $query->whereNull('subject_id');
        }

        if ($request->filled('date')) {
            $query->where('date', $request->query('date'));
        }

        $attendances = $query->latest('date')->get();

        return $this->successResponse(
            AttendanceResource::collection($attendances),
            'Attendance records retrieved successfully'
        );
    }

    public function batchStore(BatchStoreAttendanceRequest $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();
        $classroomId = $validated['classroom_id'];
        $subjectId = $validated['subject_id'] ?? null;
        $date = $validated['date'];

        // Authorization check: Admin has full access, Teacher must be homeroom or subject teacher
        if (! $user->hasRole('admin')) {
            if (! $user->hasRole('teacher') || ! $user->teacherProfile) {
                return $this->errorResponse('Unauthorized to record attendance', 403);
            }

            $teacherProfileId = $user->teacherProfile->id;

            if ($subjectId) {
                $subject = Subject::find($subjectId);
                if (! $subject || $subject->teacher_id !== $teacherProfileId) {
                    return $this->errorResponse('You are not authorized to take attendance for this subject', 403);
                }
            } else {
                $classroom = Classroom::find($classroomId);
                if (! $classroom || $classroom->homeroom_teacher_id !== $teacherProfileId) {
                    return $this->errorResponse('You are not authorized as homeroom teacher for this classroom', 403);
                }
            }
        }

        DB::transaction(function () use ($validated, $classroomId, $subjectId, $date, $user) {
            foreach ($validated['records'] as $record) {
                Attendance::updateOrCreate(
                    [
                        'student_id' => $record['student_id'],
                        'date' => $date,
                        'subject_id' => $subjectId,
                    ],
                    [
                        'classroom_id' => $classroomId,
                        'status' => $record['status'],
                        'remarks' => $record['remarks'] ?? null,
                        'recorded_by' => $user->id,
                    ]
                );
            }
        });

        return $this->successResponse(null, 'Attendance recorded successfully');
    }
}
