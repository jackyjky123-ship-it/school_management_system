<?php

namespace Tests\Feature;

use App\Enums\RoleEnums;
use App\Models\Classroom;
use App\Models\Grade;
use App\Models\StudentProfile;
use App\Models\Subject;
use App\Models\TeacherProfile;
use App\Models\User;
use App\Services\AcademicCalculationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AcademicOperationsTest extends TestCase
{
    use RefreshDatabase;

    protected User $teacherUserA;

    protected TeacherProfile $teacherA;

    protected User $teacherUserB;

    protected TeacherProfile $teacherB;

    protected Classroom $classroom;

    protected Subject $subjectA;

    protected StudentProfile $student1;

    protected StudentProfile $student2;

    protected function setUp(): void
    {
        parent::setUp();

        Role::findOrCreate(RoleEnums::ADMIN->value, 'sanctum');
        Role::findOrCreate(RoleEnums::TEACHER->value, 'sanctum');
        Role::findOrCreate(RoleEnums::STUDENT->value, 'sanctum');

        // Teacher A
        $this->teacherUserA = User::factory()->create(['email' => 'teacherA@school.test']);
        $this->teacherUserA->assignRole(RoleEnums::TEACHER->value);
        $this->teacherA = TeacherProfile::create([
            'user_id' => $this->teacherUserA->id,
            'employee_code' => 'TCH-101',
            'specialization' => 'Math',
        ]);

        // Teacher B
        $this->teacherUserB = User::factory()->create(['email' => 'teacherB@school.test']);
        $this->teacherUserB->assignRole(RoleEnums::TEACHER->value);
        $this->teacherB = TeacherProfile::create([
            'user_id' => $this->teacherUserB->id,
            'employee_code' => 'TCH-102',
            'specialization' => 'History',
        ]);

        // Classroom
        $this->classroom = Classroom::create([
            'name' => 'Grade 10 - A',
            'grade_level' => 'Grade 10',
            'academic_year' => '2026-2027',
            'homeroom_teacher_id' => $this->teacherA->id,
        ]);

        // Subject assigned to Teacher A
        $this->subjectA = Subject::create([
            'name' => 'Algebra 101',
            'code' => 'ALG-101',
            'classroom_id' => $this->classroom->id,
            'teacher_id' => $this->teacherA->id,
        ]);

        // Students
        $user1 = User::factory()->create();
        $user1->assignRole(RoleEnums::STUDENT->value);
        $this->student1 = StudentProfile::create([
            'user_id' => $user1->id,
            'student_code' => 'STD-001',
            'classroom_id' => $this->classroom->id,
        ]);

        $user2 = User::factory()->create();
        $user2->assignRole(RoleEnums::STUDENT->value);
        $this->student2 = StudentProfile::create([
            'user_id' => $user2->id,
            'student_code' => 'STD-002',
            'classroom_id' => $this->classroom->id,
        ]);
    }

    public function test_batch_attendance_roll_call_upserts_records(): void
    {
        $token = $this->teacherUserA->createToken('teacher-token')->plainTextToken;

        // Initial Roll Call
        $payload = [
            'classroom_id' => $this->classroom->id,
            'date' => '2026-11-04',
            'records' => [
                [
                    'student_id' => $this->student1->id,
                    'status' => 'present',
                ],
                [
                    'student_id' => $this->student2->id,
                    'status' => 'absent',
                    'remarks' => 'Sick leave',
                ],
            ],
        ];

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/attendances/batch', $payload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Attendance recorded successfully',
            ]);

        $this->assertDatabaseHas('attendances', [
            'student_id' => $this->student1->id,
            'classroom_id' => $this->classroom->id,
            'date' => '2026-11-04',
            'status' => 'present',
        ]);

        // Update student 2 to 'late'
        $payload['records'][1]['status'] = 'late';
        $updateResponse = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/attendances/batch', $payload);

        $updateResponse->assertStatus(200);
        $this->assertDatabaseHas('attendances', [
            'student_id' => $this->student2->id,
            'date' => '2026-11-04',
            'status' => 'late',
        ]);
    }

    public function test_batch_grade_submission_upserts_scores(): void
    {
        $token = $this->teacherUserA->createToken('teacher-token')->plainTextToken;

        $payload = [
            'subject_id' => $this->subjectA->id,
            'term' => 'Semester 1',
            'exam_type' => 'Midterm',
            'records' => [
                [
                    'student_id' => $this->student1->id,
                    'score' => 92.50,
                    'max_score' => 100.00,
                    'remarks' => 'Great work',
                ],
                [
                    'student_id' => $this->student2->id,
                    'score' => 84.00,
                    'max_score' => 100.00,
                ],
            ],
        ];

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/grades/batch', $payload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Grades recorded successfully',
            ]);

        $this->assertDatabaseHas('grades', [
            'student_id' => $this->student1->id,
            'subject_id' => $this->subjectA->id,
            'score' => 92.50,
        ]);
    }

    public function test_teacher_cannot_grade_unassigned_subject(): void
    {
        // Teacher B tries to submit grades for Subject A (assigned to Teacher A)
        $tokenB = $this->teacherUserB->createToken('teacher-b-token')->plainTextToken;

        $payload = [
            'subject_id' => $this->subjectA->id,
            'term' => 'Semester 1',
            'exam_type' => 'Midterm',
            'records' => [
                ['student_id' => $this->student1->id, 'score' => 90.00],
            ],
        ];

        $response = $this->withHeader('Authorization', 'Bearer '.$tokenB)
            ->postJson('/api/v1/grades/batch', $payload);

        $response->assertStatus(403);
    }

    public function test_academic_calculation_service_computes_letter_grades_and_gpa(): void
    {
        $service = new AcademicCalculationService;

        // Check Letter Grade mappings
        $this->assertEquals('A', $service->getLetterGrade(95.0));
        $this->assertEquals('B', $service->getLetterGrade(85.0));
        $this->assertEquals('C', $service->getLetterGrade(75.0));
        $this->assertEquals('D', $service->getLetterGrade(65.0));
        $this->assertEquals('F', $service->getLetterGrade(50.0));

        // Check GPA point conversions
        $this->assertEquals(4.0, $service->getGradePoint('A'));
        $this->assertEquals(3.0, $service->getGradePoint('B'));
        $this->assertEquals(2.0, $service->getGradePoint('C'));
        $this->assertEquals(1.0, $service->getGradePoint('D'));
        $this->assertEquals(0.0, $service->getGradePoint('F'));

        // Check overall GPA from grade collection
        $grades = collect([
            new Grade(['score' => 90.0, 'max_score' => 100.0]), // A -> 4.0
            new Grade(['score' => 80.0, 'max_score' => 100.0]), // B -> 3.0
        ]);

        $summary = $service->calculateStudentSummary($grades);
        $this->assertEquals(3.5, $summary['gpa']);
        $this->assertEquals(85.0, $summary['average_percentage']);
    }
}
