<?php

namespace Tests\Feature;

use App\Enums\RoleEnums;
use App\Models\Classroom;
use App\Models\Schedule;
use App\Models\Subject;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ScheduleModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_schedule_can_be_created_with_relationships_and_cascades(): void
    {
        Role::findOrCreate(RoleEnums::ADMIN->value, 'sanctum');
        Role::findOrCreate(RoleEnums::TEACHER->value, 'sanctum');

        $user = User::factory()->create();
        $user->assignRole(RoleEnums::TEACHER->value);
        $teacher = TeacherProfile::create([
            'user_id' => $user->id,
            'employee_code' => 'TCH-TEST-01',
            'specialization' => 'Physics',
        ]);

        $classroom = Classroom::create([
            'name' => 'Grade 11 - A',
            'grade_level' => 'Grade 11',
            'academic_year' => '2026-2027',
            'homeroom_teacher_id' => $teacher->id,
        ]);

        $subject = Subject::create([
            'name' => 'Physics 101',
            'code' => 'PHY-101',
            'classroom_id' => $classroom->id,
            'teacher_id' => $teacher->id,
        ]);

        $schedule = Schedule::create([
            'classroom_id' => $classroom->id,
            'subject_id' => $subject->id,
            'teacher_id' => $teacher->id,
            'term' => 'Semester 1',
            'day_of_week' => 'monday',
            'start_time' => '08:00:00',
            'end_time' => '09:30:00',
            'room' => 'Lab 1',
        ]);

        $this->assertDatabaseHas('schedules', [
            'id' => $schedule->id,
            'classroom_id' => $classroom->id,
            'subject_id' => $subject->id,
            'teacher_id' => $teacher->id,
            'day_of_week' => 'monday',
            'room' => 'Lab 1',
        ]);

        $this->assertEquals($classroom->id, $schedule->classroom->id);
        $this->assertEquals($subject->id, $schedule->subject->id);
        $this->assertEquals($teacher->id, $schedule->teacher->id);
        $this->assertTrue($classroom->schedules->contains($schedule));
        $this->assertTrue($subject->schedules->contains($schedule));
        $this->assertTrue($teacher->schedules->contains($schedule));

        // Test nullable subject for Homeroom advisory period
        $homeroomSchedule = Schedule::create([
            'classroom_id' => $classroom->id,
            'subject_id' => null,
            'teacher_id' => $teacher->id,
            'term' => 'Semester 1',
            'day_of_week' => 'tuesday',
            'start_time' => '08:00:00',
            'end_time' => '08:30:00',
            'room' => 'Home 101',
        ]);

        $this->assertNull($homeroomSchedule->subject);
        $this->assertEquals('Home 101', $homeroomSchedule->room);
    }
}
