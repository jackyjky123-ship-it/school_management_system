<?php

use App\Http\Controllers\Api\V1\Admin\ClassroomController;
use App\Http\Controllers\Api\V1\Admin\StudentController;
use App\Http\Controllers\Api\V1\Admin\SubjectController;
use App\Http\Controllers\Api\V1\Admin\TeacherController;
use App\Http\Controllers\Api\V1\AttendanceController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ClassroomRosterController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\GradeController;
use App\Http\Controllers\Api\V1\ScheduleController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Health Check
    Route::get('/health', function () {
        try {
            DB::connection()->getPdo();
            $dbName = DB::connection()->getDatabaseName();

            return response()->json([
                'status' => 'ok',
                'message' => 'API and database are reachable.',
                // Expose infrastructure details only while debugging.
                'laravel_version' => config('app.debug') ? app()->version() : null,
                'database' => config('app.debug') ? $dbName : null,
                'timestamp' => now()->toIso8601String(),
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Database connection failed.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal Server Error',
            ], 500);
        }
    });

    // Public Auth Endpoints
    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');
        Route::post('/demo/{role}', [AuthController::class, 'demoLogin'])->middleware('throttle:demo-login');

        // Protected Auth Endpoints
        Route::middleware('auth:sanctum')->group(function () {
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/logout', [AuthController::class, 'logout']);
        });
    });

    // Role-Scoped Dashboard Analytics
    Route::middleware('auth:sanctum')->prefix('dashboard')->group(function () {
        Route::get('/admin', [DashboardController::class, 'adminMetrics'])->middleware('role:admin,sanctum');
        Route::get('/teacher', [DashboardController::class, 'teacherMetrics'])->middleware('role:teacher,sanctum');
        Route::get('/student', [DashboardController::class, 'studentMetrics'])->middleware('role:student,sanctum');
    });

    // Authenticated Academic Operations (Shared / Role Governed)
    Route::middleware('auth:sanctum')->group(function () {
        // Classroom roster (admin, homeroom teacher, or subject teacher of that classroom)
        Route::get('/classrooms/{classroom}/students', [ClassroomRosterController::class, 'index']);

        // Attendance Endpoints
        Route::get('/attendances', [AttendanceController::class, 'index']);
        Route::post('/attendances/batch', [AttendanceController::class, 'batchStore']);

        // Grade Endpoints
        Route::get('/grades', [GradeController::class, 'index']);
        Route::post('/grades/batch', [GradeController::class, 'batchStore']);

        // Schedule Retrieval
        Route::get('/schedules', [ScheduleController::class, 'index']);
    });

    // Admin Management Endpoints
    Route::middleware(['auth:sanctum', 'role:admin,sanctum'])->prefix('admin')->group(function () {
        Route::get('classrooms/{classroom}/hub', [ClassroomController::class, 'hub']);
        Route::get('classrooms/{classroom}/attendance-history', [ClassroomController::class, 'attendanceHistory']);
        Route::apiResource('classrooms', ClassroomController::class);
        Route::apiResource('teachers', TeacherController::class);
        Route::apiResource('students', StudentController::class);
        Route::apiResource('subjects', SubjectController::class);
        Route::apiResource('schedules', ScheduleController::class);
    });
});
