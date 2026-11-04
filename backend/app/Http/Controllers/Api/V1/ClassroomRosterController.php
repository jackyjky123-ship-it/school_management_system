<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\StudentResource;
use App\Models\Classroom;
use App\Models\StudentProfile;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClassroomRosterController extends Controller
{
    use ApiResponse;

    /**
     * List students in a classroom for admins and the teachers responsible for it.
     */
    public function index(Request $request, Classroom $classroom): JsonResponse
    {
        $user = $request->user();

        if (! $user->hasRole('admin')) {
            $teacher = $user->teacherProfile;

            $isHomeroomTeacher = $teacher && (int) $classroom->homeroom_teacher_id === (int) $teacher->id;
            $isSubjectTeacher = $teacher && $classroom->subjects()
                ->where('teacher_id', $teacher->id)
                ->exists();

            if (! $isHomeroomTeacher && ! $isSubjectTeacher) {
                return $this->errorResponse('You are not authorized to view this classroom roster.', 403);
            }
        }

        $students = StudentProfile::with(['user', 'classroom'])
            ->where('classroom_id', $classroom->id)
            ->orderBy('student_code')
            ->get();

        return $this->successResponse(
            StudentResource::collection($students),
            'Classroom roster retrieved successfully'
        );
    }
}
