<?php

namespace Tests\Feature;

use App\Enums\RoleEnums;
use App\Models\Attendance;
use App\Models\Classroom;
use App\Models\Grade;
use App\Models\StudentProfile;
use App\Models\Subject;
use App\Models\TeacherProfile;
use App\Models\User;
use Database\Seeders\MockDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MockDataSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_mock_data_seeder_populates_rich_testing_dataset(): void
    {
        $this->seed(MockDataSeeder::class);

        // 1. Verify Admin
        $admin = User::where('email', 'admin@school.test')->first();
        $this->assertNotNull($admin);
        $this->assertTrue($admin->hasRole(RoleEnums::ADMIN->value));

        // 2. Verify Faculty & Departments
        $teachers = TeacherProfile::with('user')->get();
        $this->assertGreaterThanOrEqual(7, $teachers->count());
        $this->assertDatabaseHas('teacher_profiles', [
            'employee_code' => 'TCH-005',
            'specialization' => 'Computer Science & AI',
        ]);

        // 3. Verify Classrooms
        $classrooms = Classroom::all();
        $this->assertGreaterThanOrEqual(5, $classrooms->count());
        $this->assertDatabaseHas('classrooms', ['name' => 'Grade 12 - Honors']);

        // 4. Verify Subjects
        $subjects = Subject::all();
        $this->assertGreaterThanOrEqual(15, $subjects->count());
        $this->assertDatabaseHas('subjects', ['code' => 'AI-12H']);

        // 5. Verify Student Profiles
        $students = StudentProfile::all();
        $this->assertGreaterThanOrEqual(40, $students->count());

        // 6. Verify Attendance Records
        $attendanceCount = Attendance::count();
        $this->assertGreaterThan(500, $attendanceCount);

        // 7. Verify Grade Records
        $gradeCount = Grade::count();
        $this->assertGreaterThan(200, $gradeCount);

        // 8. Verify Demo Student Alex Morgan Academic Overview
        $alexUser = User::where('email', 'student@school.test')->first();
        $this->assertNotNull($alexUser);
        $alexGrades = $alexUser->studentProfile->grades;
        $this->assertNotEmpty($alexGrades);
    }
}
