<?php

use App\Enums\AttendanceStatusEnum;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Teacher Profile (1 to 1 with users)
        Schema::create('teacher_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('employee_code', 30)->unique();
            $table->string('specialization', 100);
            $table->string('phone', 30)->nullable();
            $table->date('hire_date')->nullable();
            $table->timestamps();
        });

        // Classroom (Reference teacher_profiles for homeroom teacher)
        Schema::create('classrooms', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50); // e.g., "Grade 10 - A"
            $table->string('grade_level', 20); // e.g., "Grade 10"
            $table->string('academic_year', 20); // e.g., "2026-2027"
            $table->foreignId('homeroom_teacher_id')
                ->nullable()
                ->constrained('teacher_profiles')
                ->nullOnDelete();
            $table->timestamps();

            $table->unique(['name', 'academic_year']);
        });

        // Student Profiles (1 to 1 with users, belongs to a classroom)
        Schema::create('student_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('student_code', 30)->unique();
            $table->foreignId('classroom_id')
                ->nullable()
                ->constrained('classrooms')
                ->nullOnDelete();
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->string('guardian_name', 100)->nullable();
            $table->string('guardian_phone', 30)->nullable();
            $table->string('address')->nullable();
            $table->timestamps();
        });

        // Subjects (Linked to a Classroom and assigned to a Teacher)
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100); // e.g., "Mathematics"
            $table->string('code', 30)->unique(); // e.g., "MATH-10A"
            $table->foreignId('classroom_id')->constrained('classrooms')->cascadeOnDelete();
            $table->foreignId('teacher_id')
                ->nullable()
                ->constrained('teacher_profiles')
                ->nullOnDelete();
            $table->timestamps();
        });

        // Attendances (Supports daily homeroom roll call where subject_id is null, or per-subject roll call)
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('student_profiles')->cascadeOnDelete();
            $table->foreignId('classroom_id')->constrained('classrooms')->cascadeOnDelete();
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->nullOnDelete();
            $table->date('date');
            $table->string('status', 20)->default(AttendanceStatusEnum::PRESENT->value);
            $table->string('remarks', 255)->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            // Prevent duplicate attendance entries for the same student on the same day for the same subject/homeroom
            $table->unique(['student_id', 'date', 'subject_id']);
            $table->index(['classroom_id', 'date']);
        });

        // Grades (Student score per Subject, Term, and Exam Type)
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('student_profiles')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
            $table->string('term', 30); // e.g., "Semester 1", "Semester 2"
            $table->string('exam_type', 50)->default('Final'); // e.g., "Midterm", "Final", "Quiz"
            $table->decimal('score', 5, 2);
            $table->decimal('max_score', 5, 2)->default(100.00);
            $table->string('remarks', 255)->nullable();
            $table->foreignId('graded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            // Prevent duplicate grade entries for the same student, subject, term, and exam type
            $table->unique(['student_id', 'subject_id', 'term', 'exam_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grades');
        Schema::dropIfExists('attendances');
        Schema::dropIfExists('subjects');
        Schema::dropIfExists('student_profiles');
        Schema::dropIfExists('classrooms');
        Schema::dropIfExists('teacher_profiles');
    }
};
