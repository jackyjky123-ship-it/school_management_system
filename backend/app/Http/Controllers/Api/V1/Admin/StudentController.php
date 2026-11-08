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

        if ($request->filled('classroom_id')) {
            $query->where('classroom_id', $request->query('classroom_id'));
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $op = DB::getDriverName() === 'pgsql' ? 'ilike' : 'like';
            $query->where(function ($q) use ($search, $op) {
                $q->whereHas('user', function ($userQuery) use ($search, $op) {
                    $userQuery->where('name', $op, "%{$search}%")
                        ->orWhere('email', $op, "%{$search}%");
                })->orWhere('student_code', $op, "%{$search}%");
            });
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
            $userData = array_intersect_key($validated, array_flip(['name', 'email']));

            if (! empty($userData)) {
                $student->user?->update($userData);
            }

            // Keep explicitly submitted nulls so optional fields can be cleared.
            $profileData = array_diff_key($validated, array_flip(['name', 'email']));

            if (! empty($profileData)) {
                $student->update($profileData);
            }
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
