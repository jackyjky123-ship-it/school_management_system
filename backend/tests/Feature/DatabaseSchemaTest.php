<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Classroom;
use App\Models\Grade;
use App\Models\StudentProfile;
use App\Models\Subject;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Tests\TestCase;

class DatabaseSchemaTest extends TestCase
{
    public function test_models_and_relationships_are_correctly_configured(): void
    {
        $user = new User;
        $this->assertEquals('users', $user->getTable());
        $this->assertInstanceOf(HasOne::class, $user->teacherProfile());
        $this->assertInstanceOf(HasOne::class, $user->studentProfile());

        $teacher = new TeacherProfile;
        $this->assertEquals('teacher_profiles', $teacher->getTable());
        $this->assertInstanceOf(BelongsTo::class, $teacher->user());
        $this->assertInstanceOf(HasMany::class, $teacher->homeroomClassrooms());
        $this->assertInstanceOf(HasMany::class, $teacher->subjects());

        $student = new StudentProfile;
        $this->assertEquals('student_profiles', $student->getTable());
        $this->assertInstanceOf(BelongsTo::class, $student->user());
        $this->assertInstanceOf(BelongsTo::class, $student->classroom());
        $this->assertInstanceOf(HasMany::class, $student->attendances());
        $this->assertInstanceOf(HasMany::class, $student->grades());

        $classroom = new Classroom;
        $this->assertEquals('classrooms', $classroom->getTable());
        $this->assertInstanceOf(BelongsTo::class, $classroom->homeroomTeacher());
        $this->assertInstanceOf(HasMany::class, $classroom->students());
        $this->assertInstanceOf(HasMany::class, $classroom->subjects());

        $this->assertTrue(class_exists(Subject::class));
        $subject = new Subject;
        $this->assertEquals('subjects', $subject->getTable());
        $this->assertInstanceOf(BelongsTo::class, $subject->classroom());
        $this->assertInstanceOf(BelongsTo::class, $subject->teacher());
        $this->assertInstanceOf(HasMany::class, $subject->grades());

        $attendance = new Attendance;
        $this->assertEquals('attendances', $attendance->getTable());
        $this->assertInstanceOf(BelongsTo::class, $attendance->student());
        $this->assertInstanceOf(BelongsTo::class, $attendance->classroom());
        $this->assertInstanceOf(BelongsTo::class, $attendance->subject());
        $this->assertInstanceOf(BelongsTo::class, $attendance->recorder());

        $grade = new Grade;
        $this->assertEquals('grades', $grade->getTable());
        $this->assertInstanceOf(BelongsTo::class, $grade->student());
        $this->assertInstanceOf(BelongsTo::class, $grade->subject());
        $this->assertInstanceOf(BelongsTo::class, $grade->grader());
    }
}
