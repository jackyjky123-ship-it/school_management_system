<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Grade\BatchStoreGradeRequest;
use App\Http\Resources\GradeResource;
use App\Models\Grade;
use App\Models\Subject;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GradeController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Grade::with(['student.user', 'subject', 'grader']);

        // Student privacy isolation: students only ever see their own records.
        if ($user->hasRole('student')) {
            $query->where('student_id', $user->studentProfile?->id);
        } else {
            // Teachers may only read grades for subjects assigned to them.
            if (! $user->hasRole('admin')) {
                $teacher = $user->teacherProfile;

                if (! $teacher) {
                    return $this->errorResponse('Teacher profile not found.', 403);
                }

                $query->whereIn('subject_id', Subject::query()
                    ->select('id')
                    ->where('teacher_id', $teacher->id));
            }

            if ($request->filled('student_id')) {
                $query->where('student_id', $request->query('student_id'));
            }
        }

        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->query('subject_id'));
        }

        if ($request->filled('term')) {
            $query->where('term', $request->query('term'));
        }

        if ($request->filled('exam_type')) {
            $query->where('exam_type', $request->query('exam_type'));
        }

        $grades = $query->latest()->get();

        return $this->successResponse(
            GradeResource::collection($grades),
            'Grades retrieved successfully'
        );
    }

    public function batchStore(BatchStoreGradeRequest $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();
        $subjectId = $validated['subject_id'];
        $term = $validated['term'];
        $examType = $validated['exam_type'];

        $subject = Subject::findOrFail($subjectId);

        // Authorization check: Admin has full access, Teacher must be assigned to the subject
        if (! $user->hasRole('admin')) {
            if (! $user->hasRole('teacher') || ! $user->teacherProfile || (int) $subject->teacher_id !== (int) $user->teacherProfile->id) {
                return $this->errorResponse('You are not authorized to grade this subject.', 403);
            }
        }

        DB::transaction(function () use ($validated, $subjectId, $term, $examType, $user) {
            foreach ($validated['records'] as $record) {
                Grade::updateOrCreate(
                    [
                        'student_id' => $record['student_id'],
                        'subject_id' => $subjectId,
                        'term' => $term,
                        'exam_type' => $examType,
                    ],
                    [
                        'score' => $record['score'],
                        'max_score' => $record['max_score'] ?? 100.00,
                        'remarks' => $record['remarks'] ?? null,
                        'graded_by' => $user->id,
                    ]
                );
            }
        });

        return $this->successResponse(null, 'Grades recorded successfully');
    }
}
