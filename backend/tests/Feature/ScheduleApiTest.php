<?php

namespace Tests\Feature;

use App\Enums\RoleEnums;
use App\Models\Classroom;
use App\Models\Schedule;
use App\Models\StudentProfile;
use App\Models\Subject;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ScheduleApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $teacherUser;

    protected TeacherProfile $teacher;

    protected User $otherTeacherUser;

    protected TeacherProfile $otherTeacher;

    protected User $studentUser;

    protected StudentProfile $student;

    protected Classroom $classroomA;

    protected Classroom $classroomB;

    protected Subject $subjectMath;

    protected function setUp(): void
    {
        parent::setUp();

        Role::findOrCreate(RoleEnums::ADMIN->value, 'sanctum');
        Role::findOrCreate(RoleEnums::TEACHER->value, 'sanctum');
        Role::findOrCreate(RoleEnums::STUDENT->value, 'sanctum');

        $this->admin = User::factory()->create(['name' => 'Admin User']);
        $this->admin->assignRole(RoleEnums::ADMIN->value);

        $this->teacherUser = User::factory()->create(['name' => 'Teacher Alpha']);
        $this->teacherUser->assignRole(RoleEnums::TEACHER->value);
        $this->teacher = TeacherProfile::create([
            'user_id' => $this->teacherUser->id,
            'employee_code' => 'TCH-001',
            'specialization' => 'Mathematics',
        ]);

        $this->otherTeacherUser = User::factory()->create(['name' => 'Teacher Beta']);
        $this->otherTeacherUser->assignRole(RoleEnums::TEACHER->value);
        $this->otherTeacher = TeacherProfile::create([
            'user_id' => $this->otherTeacherUser->id,
            'employee_code' => 'TCH-002',
            'specialization' => 'Physics',
        ]);

        $this->classroomA = Classroom::create([
            'name' => 'Grade 10 - A',
            'grade_level' => 'Grade 10',
            'academic_year' => '2026-2027',
            'homeroom_teacher_id' => $this->teacher->id,
        ]);

        $this->classroomB = Classroom::create([
            'name' => 'Grade 10 - B',
            'grade_level' => 'Grade 10',
            'academic_year' => '2026-2027',
            'homeroom_teacher_id' => $this->otherTeacher->id,
        ]);

        $this->studentUser = User::factory()->create(['name' => 'Student One']);
        $this->studentUser->assignRole(RoleEnums::STUDENT->value);
        $this->student = StudentProfile::create([
            'user_id' => $this->studentUser->id,
            'student_code' => 'STD-001',
            'classroom_id' => $this->classroomA->id,
        ]);

        $this->subjectMath = Subject::create([
            'name' => 'Algebra 1',
            'code' => 'ALG-101',
            'classroom_id' => $this->classroomA->id,
            'teacher_id' => $this->teacher->id,
        ]);
    }

    public function test_admin_can_create_schedule_and_prevent_classroom_overlap(): void
    {
        $adminToken = $this->admin->createToken('admin')->plainTextToken;

        // 1. Create schedule slot 08:00 - 09:30
        $res = $this->withHeader('Authorization', 'Bearer '.$adminToken)
            ->postJson('/api/v1/admin/schedules', [
                'classroom_id' => $this->classroomA->id,
                'subject_id' => $this->subjectMath->id,
                'teacher_id' => $this->teacher->id,
                'term' => 'Semester 1',
                'day_of_week' => 'monday',
                'start_time' => '08:00',
                'end_time' => '09:30',
                'room' => 'Room 101',
            ]);

        $res->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'classroom_id' => $this->classroomA->id,
                    'day_of_week' => 'monday',
                    'start_time' => '08:00:00',
                    'end_time' => '09:30:00',
                    'room' => 'Room 101',
                ],
            ]);

        $scheduleId = $res->json('data.id');

        // 2. Attempt overlapping schedule in same classroom (09:00 - 10:30 with other teacher)
        $conflictRes = $this->withHeader('Authorization', 'Bearer '.$adminToken)
            ->postJson('/api/v1/admin/schedules', [
                'classroom_id' => $this->classroomA->id,
                'subject_id' => null,
                'teacher_id' => $this->otherTeacher->id,
                'term' => 'Semester 1',
                'day_of_week' => 'monday',
                'start_time' => '09:00',
                'end_time' => '10:30',
                'room' => 'Room 101',
            ]);

        $conflictRes->assertStatus(422)
            ->assertJsonValidationErrors(['classroom_id']);
    }

    public function test_admin_can_prevent_teacher_overlap(): void
    {
        $adminToken = $this->admin->createToken('admin')->plainTextToken;

        // Create base schedule for teacher on Monday 08:00 - 09:30 in Classroom A
        Schedule::create([
            'classroom_id' => $this->classroomA->id,
            'subject_id' => $this->subjectMath->id,
            'teacher_id' => $this->teacher->id,
            'term' => 'Semester 1',
            'day_of_week' => 'monday',
            'start_time' => '08:00:00',
            'end_time' => '09:30:00',
            'room' => 'Room 101',
        ]);

        // Attempt scheduling the same teacher in Classroom B on Monday 08:30 - 10:00
        $conflictRes = $this->withHeader('Authorization', 'Bearer '.$adminToken)
            ->postJson('/api/v1/admin/schedules', [
                'classroom_id' => $this->classroomB->id,
                'subject_id' => null,
                'teacher_id' => $this->teacher->id,
                'term' => 'Semester 1',
                'day_of_week' => 'monday',
                'start_time' => '08:30',
                'end_time' => '10:00',
                'room' => 'Room 202',
            ]);

        $conflictRes->assertStatus(422)
            ->assertJsonValidationErrors(['teacher_id']);
    }

    public function test_admin_can_update_and_delete_schedule(): void
    {
        $adminToken = $this->admin->createToken('admin')->plainTextToken;

        $schedule = Schedule::create([
            'classroom_id' => $this->classroomA->id,
            'subject_id' => $this->subjectMath->id,
            'teacher_id' => $this->teacher->id,
            'term' => 'Semester 1',
            'day_of_week' => 'wednesday',
            'start_time' => '10:00:00',
            'end_time' => '11:30:00',
            'room' => 'Room 101',
        ]);

        // Update schedule room and time without conflict
        $updateRes = $this->withHeader('Authorization', 'Bearer '.$adminToken)
            ->putJson('/api/v1/admin/schedules/'.$schedule->id, [
                'classroom_id' => $this->classroomA->id,
                'subject_id' => $this->subjectMath->id,
                'teacher_id' => $this->teacher->id,
                'term' => 'Semester 1',
                'day_of_week' => 'wednesday',
                'start_time' => '10:30',
                'end_time' => '12:00',
                'room' => 'Room 105',
            ]);

        $updateRes->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'room' => 'Room 105',
                    'start_time' => '10:30:00',
                    'end_time' => '12:00:00',
                ],
            ]);

        // Delete schedule
        $deleteRes = $this->withHeader('Authorization', 'Bearer '.$adminToken)
            ->deleteJson('/api/v1/admin/schedules/'.$schedule->id);

        $deleteRes->assertStatus(200);
        $this->assertDatabaseMissing('schedules', ['id' => $schedule->id]);
    }

    public function test_role_scoped_schedule_retrieval(): void
    {
        // Classroom A schedule with Teacher Alpha
        $scheduleA = Schedule::create([
            'classroom_id' => $this->classroomA->id,
            'subject_id' => $this->subjectMath->id,
            'teacher_id' => $this->teacher->id,
            'term' => 'Semester 1',
            'day_of_week' => 'thursday',
            'start_time' => '08:00:00',
            'end_time' => '09:30:00',
            'room' => 'Room 101',
        ]);

        // Classroom B schedule with Teacher Beta
        $scheduleB = Schedule::create([
            'classroom_id' => $this->classroomB->id,
            'subject_id' => null,
            'teacher_id' => $this->otherTeacher->id,
            'term' => 'Semester 1',
            'day_of_week' => 'thursday',
            'start_time' => '09:00:00',
            'end_time' => '10:30:00',
            'room' => 'Room 202',
        ]);

        // 1. Teacher Alpha queries /api/v1/schedules -> should only see scheduleA
        $teacherToken = $this->teacherUser->createToken('teacher')->plainTextToken;
        $tRes = $this->withHeader('Authorization', 'Bearer '.$teacherToken)
            ->getJson('/api/v1/schedules');

        $tRes->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $scheduleA->id);

        $this->app['auth']->forgetGuards();

        // 2. Student in Classroom A queries /api/v1/schedules -> should only see scheduleA
        $studentToken = $this->studentUser->createToken('student')->plainTextToken;
        $sRes = $this->withHeader('Authorization', 'Bearer '.$studentToken)
            ->getJson('/api/v1/schedules');

        $sRes->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $scheduleA->id);

        $this->app['auth']->forgetGuards();

        // 3. Admin queries /api/v1/schedules?classroom_id=classroomB -> should see scheduleB
        $adminToken = $this->admin->createToken('admin')->plainTextToken;
        $aRes = $this->withHeader('Authorization', 'Bearer '.$adminToken)
            ->getJson('/api/v1/schedules?classroom_id='.$this->classroomB->id);

        $aRes->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $scheduleB->id);
    }
}
