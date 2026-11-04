<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\RoleEnums;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreStudentRequest;
use App\Http\Requests\Admin\UpdateStudentRequest;
use App\Http\Resources\StudentResource;
use App\Models\StudentProfile;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class StudentController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = StudentProfile::with(['user', 'classroom']);

        if ($request->has('classroom_id')) {
            $query->where('classroom_id', $request->query('classroom_id'));
        }

        if ($request->has('search')) {
            $search = $request->query('search');
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            })->orWhere('student_code', 'like', "%{$search}%");
        }

        $students = $query->latest()->get();

        return $this->successResponse(
            StudentResource::collection($students),
            'Students retrieved successfully'
        );
    }

    public function store(StoreStudentRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $studentProfile = DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password'] ?? 'password'),
                'is_active' => true,
            ]);

            $role = Role::findOrCreate(RoleEnums::STUDENT->value, 'sanctum');
            $user->assignRole($role);

            return StudentProfile::create([
                'user_id' => $user->id,
                'student_code' => $validated['student_code'],
                'classroom_id' => $validated['classroom_id'] ?? null,
                'gender' => $validated['gender'] ?? null,
                'date_of_birth' => $validated['date_of_birth'] ?? null,
                'guardian_name' => $validated['guardian_name'] ?? null,
                'guardian_phone' => $validated['guardian_phone'] ?? null,
                'address' => $validated['address'] ?? null,
            ]);
        });

        return $this->successResponse(
            new StudentResource($studentProfile->load(['user', 'classroom'])),
            'Student enrolled successfully',
            201
        );
    }

    public function show(StudentProfile $student): JsonResponse
    {
        return $this->successResponse(
            new StudentResource($student->load(['user', 'classroom'])),
            'Student details retrieved'
        );
    }

    public function update(UpdateStudentRequest $request, StudentProfile $student): JsonResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($student, $validated) {
            if (isset($validated['name']) || isset($validated['email'])) {
                $student->user->update(array_filter([
                    'name' => $validated['name'] ?? null,
                    'email' => $validated['email'] ?? null,
                ]));
            }

            $student->update(array_filter([
                'student_code' => $validated['student_code'] ?? null,
                'classroom_id' => $validated['classroom_id'] ?? $student->classroom_id,
                'gender' => $validated['gender'] ?? null,
                'date_of_birth' => $validated['date_of_birth'] ?? null,
                'guardian_name' => $validated['guardian_name'] ?? null,
                'guardian_phone' => $validated['guardian_phone'] ?? null,
                'address' => $validated['address'] ?? null,
            ]));
        });

        return $this->successResponse(
            new StudentResource($student->fresh(['user', 'classroom'])),
            'Student updated successfully'
        );
    }

    public function destroy(StudentProfile $student): JsonResponse
    {
        DB::transaction(function () use ($student) {
            $user = $student->user;
            $student->delete();
            $user?->delete();
        });

        return $this->successResponse(null, 'Student deleted successfully');
    }
}
