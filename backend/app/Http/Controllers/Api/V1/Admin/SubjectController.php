<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSubjectRequest;
use App\Http\Requests\Admin\UpdateSubjectRequest;
use App\Http\Resources\SubjectResource;
use App\Models\Subject;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubjectController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Subject::with(['classroom', 'teacher.user']);

        if ($request->filled('classroom_id')) {
            $query->where('classroom_id', $request->query('classroom_id'));
        }

        if ($request->filled('teacher_id')) {
            $query->where('teacher_id', $request->query('teacher_id'));
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $op = DB::getDriverName() === 'pgsql' ? 'ilike' : 'like';
            $query->where(function ($q) use ($search, $op) {
                $q->where('name', $op, "%{$search}%")
                    ->orWhere('code', $op, "%{$search}%");
            });
        }

        $subjects = $query->latest()->get();

        return $this->successResponse(
            SubjectResource::collection($subjects),
            'Subjects retrieved successfully'
        );
    }

    public function store(StoreSubjectRequest $request): JsonResponse
    {
        $subject = Subject::create($request->validated());

        return $this->successResponse(
            new SubjectResource($subject->load(['classroom', 'teacher.user'])),
            'Subject created successfully',
            201
        );
    }

    public function show(Subject $subject): JsonResponse
    {
        return $this->successResponse(
            new SubjectResource($subject->load(['classroom', 'teacher.user'])),
            'Subject details retrieved'
        );
    }

    public function update(UpdateSubjectRequest $request, Subject $subject): JsonResponse
    {
        $subject->update($request->validated());

        return $this->successResponse(
            new SubjectResource($subject->fresh(['classroom', 'teacher.user'])),
            'Subject updated successfully'
        );
    }

    public function destroy(Subject $subject): JsonResponse
    {
        $subject->delete();

        return $this->successResponse(null, 'Subject deleted successfully');
    }
}
