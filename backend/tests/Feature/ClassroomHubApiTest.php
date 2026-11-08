<?php

namespace Tests\Feature;

use App\Enums\AttendanceStatusEnum;
use App\Enums\RoleEnums;
use App\Models\Attendance;
use App\Models\Classroom;
use App\Models\Schedule;
use App\Models\StudentProfile;
use App\Models\Subject;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ClassroomHubApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $teacherUser;

    protected TeacherProfile $teacher;

    protected Classroom $classroom;

    protected Subject $subject;

    protected StudentProfile $student1;

    protected StudentProfile $student2;

    protected Schedule $schedule;

    protected function setUp(): void
    {
        parent::setUp();

        Role::findOrCreate(RoleEnums::ADMIN->value, 'sanctum');
        Role::findOrCreate(RoleEnums::TEACHER->value, 'sanctum');
        Role::findOrCreate(RoleEnums::STUDENT->value, 'sanctum');

        $this->admin = User::factory()->create(['name' => 'Admin Boss']);
        $this->admin->assignRole(RoleEnums::ADMIN->value);

        $this->teacherUser = User::factory()->create(['name' => 'Professor Smith']);
        $this->teacherUser->assignRole(RoleEnums::TEACHER->value);
        $this->teacher = TeacherProfile::create([
            'user_id' => $this->teacherUser->id,
            'employee_code' => 'TCH-HUB-01',
            'specialization' => 'Mathematics',
        ]);

        $this->classroom = Classroom::create([
            'name' => 'Grade 12 - Advanced',
            'grade_level' => 'Grade 12',
            'academic_year' => '2026-2027',
            'homeroom_teacher_id' => $this->teacher->id,
        ]);

        $this->subject = Subject::create([
            'name' => 'Calculus AB',
            'code' => 'CALC-12A',
            'classroom_id' => $this->classroom->id,
            'teacher_id' => $this->teacher->id,
        ]);

        $studentUser1 = User::factory()->create(['name' => 'Alice Walker']);
        $studentUser1->assignRole(RoleEnums::STUDENT->value);
        $this->student1 = StudentProfile::create([
            'user_id' => $studentUser1->id,
            'student_code' => 'STD-1201',
            'classroom_id' => $this->classroom->id,
            'gender' => 'female',
        ]);

        $studentUser2 = User::factory()->create(['name' => 'Bob Builder']);
        $studentUser2->assignRole(RoleEnums::STUDENT->value);
        $this->student2 = StudentProfile::create([
            'user_id' => $studentUser2->id,
            'student_code' => 'STD-1202',
            'classroom_id' => $this->classroom->id,
            'gender' => 'male',
        ]);

        $this->schedule = Schedule::create([
            'classroom_id' => $this->classroom->id,
            'subject_id' => $this->subject->id,
            'teacher_id' => $this->teacher->id,
            'term' => 'Semester 1',
            'day_of_week' => 'monday',
            'start_time' => '08:00:00',
            'end_time' => '09:30:00',
            'room' => 'Hall 4',
        ]);

        // Record attendance for session 1 (Calculus)
        Attendance::create([
            'classroom_id' => $this->classroom->id,
            'student_id' => $this->student1->id,
            'subject_id' => $this->subject->id,
            'schedule_id' => $this->schedule->id,
            'date' => '2026-11-02',
            'status' => AttendanceStatusEnum::PRESENT,
            'recorded_by' => $this->teacherUser->id,
        ]);

        Attendance::create([
            'classroom_id' => $this->classroom->id,
            'student_id' => $this->student2->id,
            'subject_id' => $this->subject->id,
            'schedule_id' => $this->schedule->id,
            'date' => '2026-11-02',
            'status' => AttendanceStatusEnum::ABSENT,
            'remarks' => 'Unexcused illness',
            'recorded_by' => $this->teacherUser->id,
        ]);
    }

    public function test_admin_can_retrieve_classroom_hub_data(): void
    {
        $adminToken = $this->admin->createToken('admin')->plainTextToken;

        $res = $this->withHeader('Authorization', 'Bearer '.$adminToken)
            ->getJson('/api/v1/admin/classrooms/'.$this->classroom->id.'/hub');

        $res->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'classroom' => [
                        'id' => $this->classroom->id,
                        'name' => 'Grade 12 - Advanced',
                    ],
                    'counts' => [
                        'students' => 2,
                        'subjects' => 1,
                        'schedules' => 1,
                    ],
                    'attendance_stats' => [
                        'total_records' => 2,
                        'total_sessions_recorded' => 1,
                        'present_count' => 1,
                        'absent_count' => 1,
                        'attendance_rate' => 50.0,
                    ],
                ],
            ])
            ->assertJsonCount(2, 'data.students')
            ->assertJsonCount(1, 'data.subjects')
            ->assertJsonCount(1, 'data.schedules');
    }

    public function test_admin_can_retrieve_classroom_attendance_history(): void
    {
        $adminToken = $this->admin->createToken('admin')->plainTextToken;

        $res = $this->withHeader('Authorization', 'Bearer '.$adminToken)
            ->getJson('/api/v1/admin/classrooms/'.$this->classroom->id.'/attendance-history');

        $res->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'items' => [
                        [
                            'date' => '2026-11-02',
                            'subject_id' => $this->subject->id,
                            'subject_name' => 'Calculus AB',
                            'total_students' => 2,
                            'present_count' => 1,
                            'absent_count' => 1,
                            'attendance_rate' => 50.0,
                        ],
                    ],
                ],
            ]);
    }

    public function test_teacher_can_record_attendance_with_schedule_id(): void
    {
        $teacherToken = $this->teacherUser->createToken('teacher')->plainTextToken;

        $res = $this->withHeader('Authorization', 'Bearer '.$teacherToken)
            ->postJson('/api/v1/attendances/batch', [
                'classroom_id' => $this->classroom->id,
                'subject_id' => $this->subject->id,
                'schedule_id' => $this->schedule->id,
                'date' => '2026-11-03',
                'records' => [
                    [
                        'student_id' => $this->student1->id,
                        'status' => AttendanceStatusEnum::PRESENT->value,
                    ],
                    [
                        'student_id' => $this->student2->id,
                        'status' => AttendanceStatusEnum::LATE->value,
                        'remarks' => '10 minutes late',
                    ],
                ],
            ]);

        $res->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('attendances', [
            'classroom_id' => $this->classroom->id,
            'student_id' => $this->student1->id,
            'subject_id' => $this->subject->id,
            'schedule_id' => $this->schedule->id,
            'date' => '2026-11-03',
            'status' => AttendanceStatusEnum::PRESENT->value,
        ]);

        $this->assertDatabaseHas('attendances', [
            'classroom_id' => $this->classroom->id,
            'student_id' => $this->student2->id,
            'subject_id' => $this->subject->id,
            'schedule_id' => $this->schedule->id,
            'date' => '2026-11-03',
            'status' => AttendanceStatusEnum::LATE->value,
        ]);
    }
}
