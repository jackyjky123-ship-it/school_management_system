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
use Database\Seeders\DemoSchoolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DemoSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_demo_school_seeder_creates_full_academic_environment(): void
    {
        $this->seed(DemoSchoolSeeder::class);

        // 1. Admin Verification
        $admin = User::where('email', 'admin@school.test')->first();
        $this->assertNotNull($admin, 'Admin account should exist');
        $this->assertTrue($admin->hasRole(RoleEnums::ADMIN->value));

        // 2. Teacher Verification
        $teachers = User::role(RoleEnums::TEACHER->value)->get();
        $this->assertCount(3, $teachers, 'Should have exactly 3 demo teachers');
        $this->assertEquals(3, TeacherProfile::count());

        // 3. Classrooms & Subjects Verification
        $classrooms = Classroom::all();
        $this->assertCount(2, $classrooms, 'Should have 2 classrooms');
        $subjects = Subject::all();
        $this->assertGreaterThanOrEqual(3, $subjects->count(), 'Should have at least 3 subjects');

        // 4. Students Verification
        $students = User::role(RoleEnums::STUDENT->value)->get();
        $this->assertEquals(20, $students->count(), 'Should have 20 demo students');
        $this->assertEquals(20, StudentProfile::count());

        // 5. Attendance & Grade Records
        $attendanceCount = Attendance::count();
        $this->assertGreaterThanOrEqual(300, $attendanceCount, 'Should have at least 300 attendance records');

        $gradeCount = Grade::count();
        $this->assertGreaterThanOrEqual(40, $gradeCount, 'Should have at least 40 grade records');
    }
}
