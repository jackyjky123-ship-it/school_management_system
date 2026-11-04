<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreClassroomRequest;
use App\Http\Requests\Admin\UpdateClassroomRequest;
use App\Http\Resources\ClassroomResource;
use App\Models\Classroom;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClassroomController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Classroom::with(['homeroomTeacher.user'])
            ->withCount(['students', 'subjects']);

        if ($request->has('search')) {
            $search = $request->query('search');
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('grade_level', 'like', "%{$search}%");
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
            new ClassroomResource($classroom->load('homeroomTeacher.user')),
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
}
