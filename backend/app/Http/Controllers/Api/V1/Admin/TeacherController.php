<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\RoleEnums;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTeacherRequest;
use App\Http\Requests\Admin\UpdateTeacherRequest;
use App\Http\Resources\TeacherResource;
use App\Models\TeacherProfile;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class TeacherController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = TeacherProfile::with(['user', 'homeroomClassrooms', 'subjects']);

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($userQuery) use ($search) {
                    $userQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })->orWhere('employee_code', 'like', "%{$search}%")
                    ->orWhere('specialization', 'like', "%{$search}%");
            });
        }

        $teachers = $query->latest()->get();

        return $this->successResponse(
            TeacherResource::collection($teachers),
            'Teachers retrieved successfully'
        );
    }

    public function store(StoreTeacherRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $teacherProfile = DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password'] ?? 'password'),
                'is_active' => true,
            ]);

            $role = Role::findOrCreate(RoleEnums::TEACHER->value, 'sanctum');
            $user->assignRole($role);

            return TeacherProfile::create([
                'user_id' => $user->id,
                'employee_code' => $validated['employee_code'],
                'specialization' => $validated['specialization'],
                'phone' => $validated['phone'] ?? null,
                'hire_date' => $validated['hire_date'] ?? null,
            ]);
        });

        return $this->successResponse(
            new TeacherResource($teacherProfile->load(['user', 'homeroomClassrooms', 'subjects'])),
            'Teacher created successfully',
            201
        );
    }

    public function show(TeacherProfile $teacher): JsonResponse
    {
        return $this->successResponse(
            new TeacherResource($teacher->load(['user', 'homeroomClassrooms', 'subjects'])),
            'Teacher details retrieved'
        );
    }

    public function update(UpdateTeacherRequest $request, TeacherProfile $teacher): JsonResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($teacher, $validated) {
            $userData = array_intersect_key($validated, array_flip(['name', 'email']));

            if (! empty($userData)) {
                $teacher->user->update($userData);
            }

            // Keep explicitly submitted nulls so optional fields can be cleared.
            $profileData = array_diff_key($validated, array_flip(['name', 'email']));

            if (! empty($profileData)) {
                $teacher->update($profileData);
            }
        });

        return $this->successResponse(
            new TeacherResource($teacher->fresh(['user', 'homeroomClassrooms', 'subjects'])),
            'Teacher updated successfully'
        );
    }

    public function destroy(TeacherProfile $teacher): JsonResponse
    {
        DB::transaction(function () use ($teacher) {
            $user = $teacher->user;
            $teacher->delete();
            $user?->delete();
        });

        return $this->successResponse(null, 'Teacher deleted successfully');
    }
}
