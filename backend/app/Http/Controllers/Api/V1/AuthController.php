<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\RoleEnums;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    use ApiResponse;

    /**
     * Authenticate user and issue Sanctum token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return $this->errorResponse(
                'Invalid credentials',
                422,
                ['email' => ['The provided credentials do not match our records.']]
            );
        }

        if (! $user->is_active) {
            return $this->errorResponse('Your account is currently disabled.', 403);
        }

        // Clean up stale tokens while allowing active multi-tab/concurrent demo review sessions
        $user->tokens()->where('created_at', '<', now()->subHours(24))->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->successResponse([
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => new UserResource($user->load(['roles', 'teacherProfile', 'studentProfile.classroom'])),
        ], 'Login successful');
    }

    /**
     * Retrieve the authenticated user profile.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['roles', 'teacherProfile', 'studentProfile.classroom']);

        return $this->successResponse(new UserResource($user), 'Profile retrieved successfully');
    }

    /**
     * 1-Click Demo Login for instant portfolio evaluation.
     */
    public function demoLogin(string $role): JsonResponse
    {
        if (! config('demo.enabled')) {
            return $this->errorResponse('Demo login is disabled in this environment.', 403);
        }

        $roleEnum = RoleEnums::tryFrom(strtolower($role));

        if (! $roleEnum) {
            return $this->errorResponse('Invalid role. Allowed roles: admin, teacher, student', 400);
        }

        $user = User::role($roleEnum->value)
            ->where('is_active', true)
            ->orderBy('id')
            ->first();

        if (! $user) {
            return $this->errorResponse("No active demo user found for role: {$roleEnum->value}", 404);
        }

        // Clean up stale tokens while allowing active multi-tab/concurrent demo review sessions
        $user->tokens()->where('created_at', '<', now()->subHours(24))->delete();
        $token = $user->createToken('demo_token')->plainTextToken;

        return $this->successResponse([
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => new UserResource($user->load(['roles', 'teacherProfile', 'studentProfile.classroom'])),
        ], 'Demo login successful');
    }

    /**
     * Log out user and revoke current access token.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return $this->successResponse(null, 'Logged out successfully');
    }
}
