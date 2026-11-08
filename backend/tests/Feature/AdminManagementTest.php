<?php

namespace Tests\Feature;

use App\Enums\RoleEnums;
use App\Models\Classroom;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $student;

    protected function setUp(): void
    {
        parent::setUp();

        Role::findOrCreate(RoleEnums::ADMIN->value, 'sanctum');
        Role::findOrCreate(RoleEnums::TEACHER->value, 'sanctum');
        Role::findOrCreate(RoleEnums::STUDENT->value, 'sanctum');

        $this->admin = User::factory()->create(['email' => 'admin@school.test']);
        $this->admin->assignRole(RoleEnums::ADMIN->value);

        $this->student = User::factory()->create(['email' => 'student@school.test']);
        $this->student->assignRole(RoleEnums::STUDENT->value);
    }

    public function test_admin_can_crud_classrooms(): void
    {
        $token = $this->admin->createToken('admin-token')->plainTextToken;

        // 1. Create Classroom
        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/admin/classrooms', [
                'name' => 'Grade 11 - A',
                'grade_level' => 'Grade 11',
                'academic_year' => '2026-2027',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'name' => 'Grade 11 - A',
                    'grade_level' => 'Grade 11',
                ],
            ]);

        $classroomId = $response->json('data.id');

        // 2. List Classrooms
        $listResponse = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/admin/classrooms');

        $listResponse->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure(['data' => [['id', 'name', 'grade_level', 'academic_year']]]);

        // 3. Update Classroom
        $updateResponse = $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson('/api/v1/admin/classrooms/'.$classroomId, [
                'name' => 'Grade 11 - A Honors',
                'grade_level' => 'Grade 11',
                'academic_year' => '2026-2027',
            ]);

        $updateResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => ['name' => 'Grade 11 - A Honors'],
            ]);

        // 4. Delete Classroom
        $deleteResponse = $this->withHeader('Authorization', 'Bearer '.$token)
            ->deleteJson('/api/v1/admin/classrooms/'.$classroomId);

        $deleteResponse->assertStatus(200);
        $this->assertDatabaseMissing('classrooms', ['id' => $classroomId]);
    }

    public function test_admin_can_create_teacher(): void
    {
        $token = $this->admin->createToken('admin-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/admin/teachers', [
                'name' => 'Professor X',
                'email' => 'profx@school.test',
                'employee_code' => 'TCH-999',
                'specialization' => 'Advanced Physics',
                'phone' => '+1-555-0999',
                'hire_date' => '2024-09-01',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'name' => 'Professor X',
                    'email' => 'profx@school.test',
                    'role' => 'teacher',
                    'employee_code' => 'TCH-999',
                    'specialization' => 'Advanced Physics',
                ],
            ]);

        $this->assertDatabaseHas('users', ['email' => 'profx@school.test']);
        $this->assertDatabaseHas('teacher_profiles', ['employee_code' => 'TCH-999']);
    }

    public function test_admin_can_create_student(): void
    {
        $token = $this->admin->createToken('admin-token')->plainTextToken;
        $classroom = Classroom::create([
            'name' => 'Grade 10 - A',
            'grade_level' => 'Grade 10',
            'academic_year' => '2026-2027',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/admin/students', [
                'name' => 'Peter Parker',
                'email' => 'spidey@school.test',
                'student_code' => 'STD-9999',
                'classroom_id' => $classroom->id,
                'gender' => 'male',
                'date_of_birth' => '2010-08-10',
                'guardian_name' => 'May Parker',
                'guardian_phone' => '+1-555-0199',
                'address' => '20 Ingram St, Forest Hills',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'name' => 'Peter Parker',
                    'email' => 'spidey@school.test',
                    'role' => 'student',
                    'student_code' => 'STD-9999',
                    'classroom_id' => $classroom->id,
                ],
            ]);

        $this->assertDatabaseHas('users', ['email' => 'spidey@school.test']);
        $this->assertDatabaseHas('student_profiles', ['student_code' => 'STD-9999']);
    }

    public function test_non_admin_users_receive_403_forbidden(): void
    {
        $studentToken = $this->student->createToken('student-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$studentToken)
            ->postJson('/api/v1/admin/classrooms', [
                'name' => 'Hacker Class',
                'grade_level' => 'Grade 10',
                'academic_year' => '2026-2027',
            ]);

        $response->assertStatus(403);
    }
}
