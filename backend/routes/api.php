<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
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
});
