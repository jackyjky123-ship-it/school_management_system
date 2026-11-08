<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\RoleEnums;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreScheduleRequest;
use App\Http\Requests\Admin\UpdateScheduleRequest;
use App\Http\Resources\ScheduleResource;
use App\Models\Schedule;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Schedule::with(['classroom', 'subject', 'teacher.user']);

        if ($user->hasRole(RoleEnums::ADMIN->value)) {
            if ($request->filled('classroom_id')) {
                $query->where('classroom_id', $request->query('classroom_id'));
            }
            if ($request->filled('teacher_id')) {
                $query->where('teacher_id', $request->query('teacher_id'));
            }
        } elseif ($user->hasRole(RoleEnums::TEACHER->value)) {
            $teacherProfile = $user->teacherProfile;
            $teacherId = $teacherProfile ? $teacherProfile->id : 0;
            $query->where('teacher_id', $teacherId);
        } elseif ($user->hasRole(RoleEnums::STUDENT->value)) {
            $studentProfile = $user->studentProfile;
            $classroomId = $studentProfile ? $studentProfile->classroom_id : 0;
            $query->where('classroom_id', $classroomId);
        } else {
            return $this->errorResponse('Unauthorized access to schedule.', 403);
        }

        if ($request->filled('term')) {
            $query->where('term', $request->query('term'));
        }

        if ($request->filled('day_of_week')) {
            $query->where('day_of_week', strtolower($request->query('day_of_week')));
        }

        $schedules = $query
            ->orderByRaw("CASE day_of_week
                WHEN 'monday' THEN 1
                WHEN 'tuesday' THEN 2
                WHEN 'wednesday' THEN 3
                WHEN 'thursday' THEN 4
                WHEN 'friday' THEN 5
                WHEN 'saturday' THEN 6
                WHEN 'sunday' THEN 7
                ELSE 8 END")
            ->orderBy('start_time')
            ->get();

        return $this->successResponse(
            ScheduleResource::collection($schedules),
            'Schedules retrieved successfully'
        );
    }

    public function store(StoreScheduleRequest $request): JsonResponse
    {
        $schedule = Schedule::create($request->validated());

        return $this->successResponse(
            new ScheduleResource($schedule->load(['classroom', 'subject', 'teacher.user'])),
            'Schedule slot created successfully',
            201
        );
    }

    public function show(Schedule $schedule): JsonResponse
    {
        return $this->successResponse(
            new ScheduleResource($schedule->load(['classroom', 'subject', 'teacher.user'])),
            'Schedule details retrieved'
        );
    }

    public function update(UpdateScheduleRequest $request, Schedule $schedule): JsonResponse
    {
        $schedule->update($request->validated());

        return $this->successResponse(
            new ScheduleResource($schedule->fresh(['classroom', 'subject', 'teacher.user'])),
            'Schedule slot updated successfully'
        );
    }

    public function destroy(Schedule $schedule): JsonResponse
    {
        $schedule->delete();

        return $this->successResponse(null, 'Schedule slot deleted successfully');
    }
}
