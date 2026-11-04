<?php

namespace Tests\Feature;

use App\Enums\AttendanceStatusEnum;
use App\Enums\RoleEnums;
use App\Models\Attendance;
use App\Models\Classroom;
use App\Models\Grade;
use App\Models\StudentProfile;
use App\Models\Subject;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class DashboardApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $teacher;
    protected User $student;
    protected Classroom $classroom;
    protected Subject $subject;
    protected TeacherProfile $teacherProfile;
    protected StudentProfile $studentProfile;

    protected function setUp(): void
    {
        parent::setUp();

        Role::findOrCreate(RoleEnums::ADMIN->value, 'sanctum');
        Role::findOrCreate(RoleEnums::TEACHER->value, 'sanctum');
        Role::findOrCreate(RoleEnums::STUDENT->value, 'sanctum');

        // Admin
        $this->admin = User::factory()->create(['email' => 'admin@school.test']);
        $this->admin->assignRole(RoleEnums::ADMIN->value);

        // Teacher
        $this->teacher = User::factory()->create(['email' => 'teacher@school.test']);
        $this->teacher->assignRole(RoleEnums::TEACHER->value);
        $this->teacherProfile = TeacherProfile::create([
            'user_id' => $this->teacher->id,
            'employee_code' => 'TCH-001',
            'specialization' => 'Mathematics',
        ]);

        // Classroom
        $this->classroom = Classroom::create([
            'name' => 'Grade 10 - A',
            'grade_level' => 'Grade 10',
            'academic_year' => '2026-2027',
            'homeroom_teacher_id' => $this->teacherProfile->id,
        ]);

        // Subject
        $this->subject = Subject::create([
            'name' => 'Mathematics 10A',
            'code' => 'MATH-10A',
            'classroom_id' => $this->classroom->id,
            'teacher_id' => $this->teacherProfile->id,
        ]);

        // Student
        $this->student = User::factory()->create(['email' => 'student@school.test']);
        $this->student->assignRole(RoleEnums::STUDENT->value);
        $this->studentProfile = StudentProfile::create([
            'user_id' => $this->student->id,
            'student_code' => 'STD-001',
            'classroom_id' => $this->classroom->id,
        ]);

        // Seed sample attendance and grade
        Attendance::create([
            'student_id' => $this->studentProfile->id,
            'classroom_id' => $this->classroom->id,
            'date' => now()->toDateString(),
            'status' => AttendanceStatusEnum::PRESENT->value,
            'recorded_by' => $this->teacher->id,
        ]);

        Grade::create([
            'student_id' => $this->studentProfile->id,
            'subject_id' => $this->subject->id,
            'term' => 'Semester 1',
            'exam_type' => 'Midterm',
            'score' => 90.00,
            'max_score' => 100.00,
            'graded_by' => $this->teacher->id,
        ]);
    }

    public function test_admin_dashboard_metrics(): void
    {
        $token = $this->admin->createToken('admin-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/dashboard/admin');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'total_students' => 1,
                    'total_teachers' => 1,
                    'total_classrooms' => 1,
                    'total_subjects' => 1,
                ],
            ])
            ->assertJsonStructure([
                'data' => [
                    'total_students',
                    'total_teachers',
                    'total_classrooms',
                    'total_subjects',
                    'today_attendance_rate',
                    'classroom_distribution',
                ],
            ]);
    }

    public function test_teacher_dashboard_metrics(): void
    {
        $token = $this->teacher->createToken('teacher-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/dashboard/teacher');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'today_roll_call_completed' => true,
                ],
            ])
            ->assertJsonStructure([
                'data' => [
                    'today_roll_call_completed',
                    'assigned_classrooms',
                    'assigned_subjects',
                    'recent_grades',
                ],
            ]);
    }

    public function test_student_dashboard_metrics(): void
    {
        $token = $this->student->createToken('student-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/dashboard/student');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'gpa' => 4.0,
                    'letter_grade' => 'A',
                    'average_percentage' => 90.0,
                    'total_attendance_days' => 1,
                    'attendance_rate' => 100.0,
                ],
            ])
            ->assertJsonStructure([
                'data' => [
                    'gpa',
                    'average_percentage',
                    'letter_grade',
                    'attendance_rate',
                    'total_attendance_days',
                    'recent_grades',
                    'enrolled_subjects',
                ],
            ]);
    }
}
