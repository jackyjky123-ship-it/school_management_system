<?php

namespace Tests\Feature;

use Database\Seeders\DemoSchoolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EndToEndAcademicLifecycleTest extends TestCase
{
    use RefreshDatabase;

    public function test_full_academic_lifecycle_across_all_three_personas(): void
    {
        // 1. Seed complete base school environment
        $this->seed(DemoSchoolSeeder::class);

        // --- STEP 1: ADMIN OPERATIONS ---
        // Admin performs 1-click Demo Login
        $adminLoginRes = $this->postJson('/api/v1/auth/demo/admin');
        $adminLoginRes->assertStatus(200);
        $adminToken = $adminLoginRes->json('data.token');
        $this->assertNotEmpty($adminToken);

        // Admin verifies dashboard statistics
        $adminStatsRes = $this->withHeader('Authorization', 'Bearer '.$adminToken)
            ->getJson('/api/v1/dashboard/admin');
        $adminStatsRes->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'total_students' => 20,
                    'total_teachers' => 3,
                    'total_classrooms' => 2,
                ],
            ]);

        // Admin creates a new Classroom
        $classroomRes = $this->withHeader('Authorization', 'Bearer '.$adminToken)
            ->postJson('/api/v1/admin/classrooms', [
                'name' => 'Grade 11 - Advanced',
                'grade_level' => 'Grade 11',
                'academic_year' => '2026-2027',
            ]);
        $classroomRes->assertStatus(201);
        $newClassroomId = $classroomRes->json('data.id');

        // Admin enrolls a new Student in Grade 11 - Advanced
        $studentRes = $this->withHeader('Authorization', 'Bearer '.$adminToken)
            ->postJson('/api/v1/admin/students', [
                'name' => 'Miles Morales',
                'email' => 'miles.morales@school.test',
                'student_code' => 'STD-7777',
                'classroom_id' => $newClassroomId,
                'gender' => 'male',
                'date_of_birth' => '2010-09-15',
                'guardian_name' => 'Rio Morales',
                'guardian_phone' => '+1-555-7777',
                'address' => 'Brooklyn, NY',
            ]);
        $studentRes->assertStatus(201);
        $newStudentProfileId = $studentRes->json('data.id');

        // Find teacher Dr. Sarah Jenkins
        $teachersRes = $this->withHeader('Authorization', 'Bearer '.$adminToken)
            ->getJson('/api/v1/admin/teachers?search=Jenkins');
        $teachersRes->assertStatus(200);
        $teacherJenkinsId = $teachersRes->json('data.0.id');

        // Admin assigns a new Subject to Grade 11 - Advanced instructed by Dr. Jenkins
        $subjectRes = $this->withHeader('Authorization', 'Bearer '.$adminToken)
            ->postJson('/api/v1/admin/subjects', [
                'name' => 'Quantum Mechanics 11',
                'code' => 'QM-11',
                'classroom_id' => $newClassroomId,
                'teacher_id' => $teacherJenkinsId,
            ]);
        $subjectRes->assertStatus(201);
        $newSubjectId = $subjectRes->json('data.id');

        // Admin assigns Dr. Jenkins as homeroom teacher for Grade 11 - Advanced
        $this->withHeader('Authorization', 'Bearer '.$adminToken)
            ->putJson('/api/v1/admin/classrooms/'.$newClassroomId, [
                'name' => 'Grade 11 - Advanced',
                'grade_level' => 'Grade 11',
                'academic_year' => '2026-2027',
                'homeroom_teacher_id' => $teacherJenkinsId,
            ])
            ->assertStatus(200);

        // --- STEP 2: TEACHER OPERATIONS ---
        $this->app['auth']->forgetGuards();
        // Teacher Jenkins logs in
        $teacherLoginRes = $this->postJson('/api/v1/auth/login', [
            'email' => 'teacher.math@school.test',
            'password' => 'password',
        ]);
        $teacherLoginRes->assertStatus(200);
        $teacherToken = $teacherLoginRes->json('data.token');
        $this->assertNotEmpty($teacherToken);

        // Teacher records roll call attendance for Grade 11 - Advanced
        $todayDate = now()->toDateString();
        $attendanceRes = $this->withHeader('Authorization', 'Bearer '.$teacherToken)
            ->postJson('/api/v1/attendances/batch', [
                'classroom_id' => $newClassroomId,
                'date' => $todayDate,
                'records' => [
                    [
                        'student_id' => $newStudentProfileId,
                        'status' => 'present',
                        'remarks' => 'First day in Advanced class',
                    ],
                ],
            ]);
        $attendanceRes->assertStatus(200);

        // Teacher submits Midterm Grade for Miles Morales in Quantum Mechanics 11
        $gradeRes = $this->withHeader('Authorization', 'Bearer '.$teacherToken)
            ->postJson('/api/v1/grades/batch', [
                'subject_id' => $newSubjectId,
                'term' => 'Semester 1',
                'exam_type' => 'Midterm',
                'records' => [
                    [
                        'student_id' => $newStudentProfileId,
                        'score' => 96.50,
                        'max_score' => 100.00,
                        'remarks' => 'Exceptional theoretical understanding',
                    ],
                ],
            ]);
        $gradeRes->assertStatus(200);

        // --- STEP 3: STUDENT OPERATIONS ---
        // Miles Morales logs in with default password
        $studentLoginRes = $this->postJson('/api/v1/auth/login', [
            'email' => 'miles.morales@school.test',
            'password' => 'password',
        ]);
        $studentLoginRes->assertStatus(200);
        $studentToken = $studentLoginRes->json('data.token');
        $this->assertNotEmpty($studentToken);

        // Miles fetches his personalized student dashboard
        $this->app['auth']->forgetGuards();
        $studentMetricsRes = $this->withHeader('Authorization', 'Bearer '.$studentToken)
            ->getJson('/api/v1/dashboard/student');

        $studentMetricsRes->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'gpa' => 4.0,
                    'letter_grade' => 'A',
                    'average_percentage' => 96.5,
                    'attendance_rate' => 100.0,
                    'total_attendance_days' => 1,
                    'total_present_days' => 1,
                ],
            ]);

        // Miles views his full report card
        $reportCardRes = $this->withHeader('Authorization', 'Bearer '.$studentToken)
            ->getJson('/api/v1/grades');

        $reportCardRes->assertStatus(200)
            ->assertJsonStructure(['data' => [['subject_name', 'score', 'percentage', 'letter_grade']]])
            ->assertJson([
                'data' => [
                    [
                        'subject_name' => 'Quantum Mechanics 11',
                        'score' => 96.5,
                        'percentage' => 96.5,
                        'letter_grade' => 'A',
                    ],
                ],
            ]);
    }
}
