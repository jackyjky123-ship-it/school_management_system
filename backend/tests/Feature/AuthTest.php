<?php

namespace Tests\Feature;

use App\Enums\RoleEnums;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::findOrCreate(RoleEnums::ADMIN->value, 'sanctum');
        Role::findOrCreate(RoleEnums::TEACHER->value, 'sanctum');
        Role::findOrCreate(RoleEnums::STUDENT->value, 'sanctum');
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'admin@school.test',
            'password' => bcrypt('password123'),
        ]);
        $user->assignRole(RoleEnums::ADMIN->value);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@school.test',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Login successful',
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'token',
                    'token_type',
                    'user' => [
                        'id',
                        'name',
                        'email',
                        'role',
                    ],
                ],
            ]);
    }

    public function test_login_fails_with_invalid_credentials(): void
    {
        User::factory()->create([
            'email' => 'admin@school.test',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@school.test',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ])
            ->assertJsonStructure(['success', 'message', 'errors']);
    }

    public function test_authenticated_user_can_fetch_profile_via_me(): void
    {
        $user = User::factory()->create([
            'email' => 'teacher@school.test',
        ]);
        $user->assignRole(RoleEnums::TEACHER->value);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/auth/me');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'role' => RoleEnums::TEACHER->value,
                ],
            ]);
    }

    public function test_demo_login_generates_token_for_valid_roles(): void
    {
        $admin = User::factory()->create(['email' => 'admin@school.test']);
        $admin->assignRole(RoleEnums::ADMIN->value);

        $response = $this->postJson('/api/v1/auth/demo/admin');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'user' => [
                        'email' => 'admin@school.test',
                        'role' => RoleEnums::ADMIN->value,
                    ],
                ],
            ]);
    }

    public function test_user_can_logout_and_revoke_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/auth/logout');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Logged out successfully',
            ]);

        $this->assertCount(0, $user->fresh()->tokens);
    }
}
