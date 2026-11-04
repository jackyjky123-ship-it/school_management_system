<?php

use App\Http\Controllers\Api\V1\Admin\ClassroomController;
use App\Http\Controllers\Api\V1\Admin\StudentController;
use App\Http\Controllers\Api\V1\Admin\SubjectController;
use App\Http\Controllers\Api\V1\Admin\TeacherController;
use App\Http\Controllers\Api\V1\AuthController;
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
                'laravel_version' => app()->version(),
                'message' => 'Laravel 13 API & Neon PostgreSQL are connected.',
                'database' => $dbName,
                'timestamp' => now()->toIso8601String(),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Database connection failed.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal Server Error',
            ], 500);
        }
    });

    // Public Auth Endpoints
    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/demo/{role}', [AuthController::class, 'demoLogin']);

        // Protected Auth Endpoints
        Route::middleware('auth:sanctum')->group(function () {
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/logout', [AuthController::class, 'logout']);
        });
    });

    // Admin Endpoints
    Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
        Route::apiResource('classrooms', ClassroomController::class);
        Route::apiResource('teachers', TeacherController::class);
        Route::apiResource('students', StudentController::class);
        Route::apiResource('subjects', SubjectController::class);
    });
});
