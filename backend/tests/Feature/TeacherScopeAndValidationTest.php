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
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class TeacherScopeAndValidationTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $teacherUser;

    protected TeacherProfile $teacher;

    protected User $otherTeacherUser;

    protected TeacherProfile $otherTeacher;

    protected Classroom $classroom;

    protected Classroom $otherClassroom;

    protected Subject $subject;

    protected Subject $otherSubject;

    protected StudentProfile $student;

    protected StudentProfile $otherStudent;

    protected function setUp(): void
    {
        parent::setUp();

        Role::findOrCreate(RoleEnums::ADMIN->value, 'sanctum');
        Role::findOrCreate(RoleEnums::TEACHER->value, 'sanctum');
        Role::findOrCreate(RoleEnums::STUDENT->value, 'sanctum');

        $this->admin = User::factory()->create();
        $this->admin->assignRole(RoleEnums::ADMIN->value);

        $this->teacherUser = User::factory()->create();
        $this->teacherUser->assignRole(RoleEnums::TEACHER->value);
        $this->teacher = TeacherProfile::create([
            'user_id' => $this->teacherUser->id,
            'employee_code' => 'TCH-201',
            'specialization' => 'Mathematics',
        ]);

        $this->otherTeacherUser = User::factory()->create();
        $this->otherTeacherUser->assignRole(RoleEnums::TEACHER->value);
        $this->otherTeacher = TeacherProfile::create([
            'user_id' => $this->otherTeacherUser->id,
            'employee_code' => 'TCH-202',
            'specialization' => 'History',
        ]);

        $this->classroom = Classroom::create([
            'name' => 'Grade 10 - A',
            'grade_level' => 'Grade 10',
            'academic_year' => '2026-2027',
            'homeroom_teacher_id' => $this->teacher->id,
        ]);

        $this->otherClassroom = Classroom::create([
            'name' => 'Grade 10 - B',
            'grade_level' => 'Grade 10',
            'academic_year' => '2026-2027',
            'homeroom_teacher_id' => $this->otherTeacher->id,
        ]);

        $this->subject = Subject::create([
            'name' => 'Mathematics 10A',
            'code' => 'MATH-10A',
            'classroom_id' => $this->classroom->id,
            'teacher_id' => $this->teacher->id,
        ]);

        $this->otherSubject = Subject::create([
            'name' => 'History 10B',
            'code' => 'HIST-10B',
            'classroom_id' => $this->otherClassroom->id,
            'teacher_id' => $this->otherTeacher->id,
        ]);

        $this->student = $this->createStudent($this->classroom, 'STD-201');
        $this->otherStudent = $this->createStudent($this->otherClassroom, 'STD-202');
    }

    public function test_teacher_can_view_roster_for_homeroom_and_subject_classrooms(): void
    {
        $token = $this->teacherUser->createToken('teacher-token')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/classrooms/'.$this->classroom->id.'/students')
            ->assertOk()
            ->assertJsonPath('data.0.student_code', 'STD-201');
    }

    public function test_teacher_cannot_view_an_unrelated_classroom_roster(): void
    {
        $token = $this->teacherUser->createToken('teacher-token')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/classrooms/'.$this->otherClassroom->id.'/students')
            ->assertForbidden();
    }

    public function test_admin_can_view_any_classroom_roster_but_students_cannot(): void
    {
        $adminToken = $this->admin->createToken('admin-token')->plainTextToken;
        $studentToken = $this->student->user->createToken('student-token')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$adminToken)
            ->getJson('/api/v1/classrooms/'.$this->otherClassroom->id.'/students')
            ->assertOk();

        $this->app['auth']->forgetGuards();

        $this->withHeader('Authorization', 'Bearer '.$studentToken)
            ->getJson('/api/v1/classrooms/'.$this->classroom->id.'/students')
            ->assertForbidden();
    }

    public function test_teacher_only_reads_grades_for_assigned_subjects(): void
    {
        Grade::create([
            'student_id' => $this->student->id,
            'subject_id' => $this->subject->id,
            'term' => 'Semester 1',
            'exam_type' => 'Midterm',
            'score' => 90,
            'max_score' => 100,
            'graded_by' => $this->teacherUser->id,
        ]);
        Grade::create([
            'student_id' => $this->otherStudent->id,
            'subject_id' => $this->otherSubject->id,
            'term' => 'Semester 1',
            'exam_type' => 'Midterm',
            'score' => 70,
            'max_score' => 100,
            'graded_by' => $this->otherTeacherUser->id,
        ]);

        $token = $this->teacherUser->createToken('teacher-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/grades');

        $response->assertOk()->assertJsonCount(1, 'data');
        $this->assertSame($this->subject->id, $response->json('data.0.subject_id'));
    }

    public function test_teacher_only_reads_attendance_for_assigned_scope(): void
    {
        Attendance::create([
            'student_id' => $this->student->id,
            'classroom_id' => $this->classroom->id,
            'date' => '2026-11-04',
            'status' => 'present',
            'recorded_by' => $this->teacherUser->id,
        ]);
        Attendance::create([
            'student_id' => $this->otherStudent->id,
            'classroom_id' => $this->otherClassroom->id,
            'date' => '2026-11-04',
            'status' => 'present',
            'recorded_by' => $this->otherTeacherUser->id,
        ]);

        $token = $this->teacherUser->createToken('teacher-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/attendances');

        $response->assertOk()->assertJsonCount(1, 'data');
        $this->assertSame($this->student->id, $response->json('data.0.student_id'));
    }

    public function test_attendance_batch_rejects_students_outside_the_classroom(): void
    {
        $token = $this->teacherUser->createToken('teacher-token')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/attendances/batch', [
                'classroom_id' => $this->classroom->id,
                'date' => '2026-11-04',
                'records' => [
                    ['student_id' => $this->otherStudent->id, 'status' => 'present'],
                ],
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['records.0.student_id']);
    }

    public function test_attendance_batch_rejects_subject_from_another_classroom(): void
    {
        $token = $this->teacherUser->createToken('teacher-token')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/attendances/batch', [
                'classroom_id' => $this->classroom->id,
                'subject_id' => $this->otherSubject->id,
                'date' => '2026-11-04',
                'records' => [
                    ['student_id' => $this->student->id, 'status' => 'present'],
                ],
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['subject_id']);
    }

    public function test_grade_batch_rejects_students_outside_the_subject_classroom(): void
    {
        $token = $this->teacherUser->createToken('teacher-token')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/grades/batch', [
                'subject_id' => $this->subject->id,
                'term' => 'Semester 1',
                'exam_type' => 'Midterm',
                'records' => [
                    ['student_id' => $this->otherStudent->id, 'score' => 90],
                ],
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['records.0.student_id']);
    }

    public function test_grade_batch_rejects_a_score_above_the_max_score(): void
    {
        $token = $this->teacherUser->createToken('teacher-token')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/grades/batch', [
                'subject_id' => $this->subject->id,
                'term' => 'Semester 1',
                'exam_type' => 'Midterm',
                'records' => [
                    ['student_id' => $this->student->id, 'score' => 110, 'max_score' => 100],
                ],
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['records.0.score']);
    }

    public function test_student_search_stays_inside_the_selected_classroom(): void
    {
        $this->student->user->update(['name' => 'Alex Morgan']);
        $this->otherStudent->user->update(['name' => 'Alex Morgan']);

        $token = $this->admin->createToken('admin-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/admin/students?classroom_id='.$this->classroom->id.'&search=Alex');

        $response->assertOk()->assertJsonCount(1, 'data');
        $this->assertSame($this->student->id, $response->json('data.0.id'));
    }

    public function test_student_update_can_clear_optional_fields_and_unassign_classroom(): void
    {
        $token = $this->admin->createToken('admin-token')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson('/api/v1/admin/students/'.$this->student->id, [
                'guardian_name' => null,
                'guardian_phone' => null,
                'classroom_id' => null,
            ])
            ->assertOk();

        $this->student->refresh();
        $this->assertNull($this->student->guardian_name);
        $this->assertNull($this->student->guardian_phone);
        $this->assertNull($this->student->classroom_id);
    }

    public function test_demo_login_is_disabled_when_configuration_turns_it_off(): void
    {
        config(['demo.enabled' => false]);

        $this->postJson('/api/v1/auth/demo/admin')->assertForbidden();
    }

    private function createStudent(Classroom $classroom, string $code): StudentProfile
    {
        $user = User::factory()->create();
        $user->assignRole(RoleEnums::STUDENT->value);

        return StudentProfile::create([
            'user_id' => $user->id,
            'student_code' => $code,
            'classroom_id' => $classroom->id,
        ]);
    }
}
