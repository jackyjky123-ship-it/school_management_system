<?php

namespace Database\Seeders;

use App\Enums\AttendanceStatusEnum;
use App\Enums\RoleEnums;
use App\Models\Attendance;
use App\Models\Classroom;
use App\Models\Grade;
use App\Models\StudentProfile;
use App\Models\Subject;
use App\Models\TeacherProfile;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DemoSchoolSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Roles
        $adminRole = Role::findOrCreate(RoleEnums::ADMIN->value);
        $teacherRole = Role::findOrCreate(RoleEnums::TEACHER->value);
        $studentRole = Role::findOrCreate(RoleEnums::STUDENT->value);

        $defaultPassword = Hash::make('password');

        // 2. Create Admin User
        $adminUser = User::updateOrCreate(
            ['email' => 'admin@school.test'],
            [
                'name' => 'System Administrator',
                'password' => $defaultPassword,
                'is_active' => true,
            ]
        );
        $adminUser->assignRole($adminRole);

        // 3. Create Teachers
        $teacherData = [
            [
                'name' => 'Dr. Sarah Jenkins',
                'email' => 'teacher.math@school.test',
                'employee_code' => 'TCH-001',
                'specialization' => 'Mathematics',
                'phone' => '+1-555-0101',
                'hire_date' => '2023-08-15',
            ],
            [
                'name' => 'Prof. Michael Chang',
                'email' => 'teacher.science@school.test',
                'employee_code' => 'TCH-002',
                'specialization' => 'Physical Science',
                'phone' => '+1-555-0102',
                'hire_date' => '2023-08-15',
            ],
            [
                'name' => 'Ms. Elena Rostova',
                'email' => 'teacher.english@school.test',
                'employee_code' => 'TCH-003',
                'specialization' => 'English Literature',
                'phone' => '+1-555-0103',
                'hire_date' => '2024-01-10',
            ],
        ];

        $teachers = [];
        foreach ($teacherData as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => $defaultPassword,
                    'is_active' => true,
                ]
            );
            $user->assignRole($teacherRole);

            $profile = TeacherProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'employee_code' => $data['employee_code'],
                    'specialization' => $data['specialization'],
                    'phone' => $data['phone'],
                    'hire_date' => $data['hire_date'],
                ]
            );
            $teachers[] = $profile;
        }

        // 4. Create Classrooms
        $classroomA = Classroom::updateOrCreate(
            ['name' => 'Grade 10 - A', 'academic_year' => '2026-2027'],
            [
                'grade_level' => 'Grade 10',
                'homeroom_teacher_id' => $teachers[0]->id,
            ]
        );

        $classroomB = Classroom::updateOrCreate(
            ['name' => 'Grade 10 - B', 'academic_year' => '2026-2027'],
            [
                'grade_level' => 'Grade 10',
                'homeroom_teacher_id' => $teachers[1]->id,
            ]
        );

        // 5. Create Subjects
        $subjectsA = [
            Subject::updateOrCreate(
                ['code' => 'MATH-10A'],
                ['name' => 'Mathematics 10A', 'classroom_id' => $classroomA->id, 'teacher_id' => $teachers[0]->id]
            ),
            Subject::updateOrCreate(
                ['code' => 'SCI-10A'],
                ['name' => 'Physics 10A', 'classroom_id' => $classroomA->id, 'teacher_id' => $teachers[1]->id]
            ),
            Subject::updateOrCreate(
                ['code' => 'ENG-10A'],
                ['name' => 'English 10A', 'classroom_id' => $classroomA->id, 'teacher_id' => $teachers[2]->id]
            ),
        ];

        $subjectsB = [
            Subject::updateOrCreate(
                ['code' => 'MATH-10B'],
                ['name' => 'Mathematics 10B', 'classroom_id' => $classroomB->id, 'teacher_id' => $teachers[0]->id]
            ),
            Subject::updateOrCreate(
                ['code' => 'SCI-10B'],
                ['name' => 'Physics 10B', 'classroom_id' => $classroomB->id, 'teacher_id' => $teachers[1]->id]
            ),
            Subject::updateOrCreate(
                ['code' => 'ENG-10B'],
                ['name' => 'English 10B', 'classroom_id' => $classroomB->id, 'teacher_id' => $teachers[2]->id]
            ),
        ];

        // 6. Create Students (20)
        $studentNames = [
            // Classroom A (10)
            ['Alex Morgan', 'male', 'student@school.test'],
            ['Emma Watson', 'female', 'student2@school.test'],
            ['Liam Johnson', 'male', 'student3@school.test'],
            ['Olivia Brown', 'female', 'student4@school.test'],
            ['Noah Garcia', 'male', 'student5@school.test'],
            ['Sophia Miller', 'female', 'student6@school.test'],
            ['Lucas Davis', 'male', 'student7@school.test'],
            ['Ava Rodriguez', 'female', 'student8@school.test'],
            ['Ethan Martinez', 'male', 'student9@school.test'],
            ['Mia Hernandez', 'female', 'student10@school.test'],
            // Classroom B (10)
            ['Mason Lopez', 'male', 'student11@school.test'],
            ['Isabella Gonzalez', 'female', 'student12@school.test'],
            ['Logan Wilson', 'male', 'student13@school.test'],
            ['Harper Anderson', 'female', 'student14@school.test'],
            ['James Thomas', 'male', 'student15@school.test'],
            ['Evelyn Taylor', 'female', 'student16@school.test'],
            ['Benjamin Moore', 'male', 'student17@school.test'],
            ['Charlotte Jackson', 'female', 'student18@school.test'],
            ['Henry Martin', 'male', 'student19@school.test'],
            ['Amelia Lee', 'female', 'student20@school.test'],
        ];

        $studentProfiles = [];
        foreach ($studentNames as $index => [$name, $gender, $email]) {
            $class = $index < 10 ? $classroomA : $classroomB;
            $code = sprintf('STD-%04d', 1001 + $index);

            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'password' => $defaultPassword,
                    'is_active' => true,
                ]
            );
            $user->assignRole($studentRole);

            $profile = StudentProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'student_code' => $code,
                    'classroom_id' => $class->id,
                    'gender' => $gender,
                    'date_of_birth' => '2010-05-' . sprintf('%02d', ($index % 25) + 1),
                    'guardian_name' => "Guardian of $name",
                    'guardian_phone' => '+1-555-' . sprintf('%04d', 2000 + $index),
                    'address' => (100 + $index) . ' Academy Boulevard, Metro City',
                ]
            );
            $studentProfiles[] = $profile;
        }

        // 7. Seed Attendance for the past 20 school days
        $schoolDays = [];
        $currentDate = Carbon::now()->subDays(30);
        while (count($schoolDays) < 20 && $currentDate->lessThanOrEqualTo(Carbon::now())) {
            if (!$currentDate->isWeekend()) {
                $schoolDays[] = $currentDate->toDateString();
            }
            $currentDate->addDay();
        }

        $statuses = [
            AttendanceStatusEnum::PRESENT,
            AttendanceStatusEnum::PRESENT,
            AttendanceStatusEnum::PRESENT,
            AttendanceStatusEnum::PRESENT,
            AttendanceStatusEnum::PRESENT,
            AttendanceStatusEnum::PRESENT,
            AttendanceStatusEnum::PRESENT,
            AttendanceStatusEnum::LATE,
            AttendanceStatusEnum::ABSENT,
            AttendanceStatusEnum::EXCUSED,
        ];

        foreach ($studentProfiles as $index => $student) {
            foreach ($schoolDays as $dayIndex => $dateStr) {
                // Determine a realistic status distribution
                $statusIndex = ($index + $dayIndex) % count($statuses);
                $status = $statuses[$statusIndex];

                Attendance::updateOrCreate(
                    [
                        'student_id' => $student->id,
                        'date' => $dateStr,
                        'subject_id' => null, // Homeroom Daily Attendance
                    ],
                    [
                        'classroom_id' => $student->classroom_id,
                        'status' => $status->value,
                        'recorded_by' => $adminUser->id,
                        'remarks' => $status === AttendanceStatusEnum::ABSENT ? 'Parent notified' : null,
                    ]
                );
            }
        }

        // 8. Seed Grades
        // Base exam performance per student
        $examTypes = ['Midterm', 'Quiz 1'];
        foreach ($studentProfiles as $index => $student) {
            $classSubjects = $student->classroom_id === $classroomA->id ? $subjectsA : $subjectsB;

            foreach ($classSubjects as $subIndex => $subject) {
                foreach ($examTypes as $examIndex => $exam) {
                    // Score variance between 68 and 98
                    $baseScore = 75 + (($index * 7 + $subIndex * 5 + $examIndex * 3) % 23);
                    $score = min(100.00, (float) $baseScore);

                    Grade::updateOrCreate(
                        [
                            'student_id' => $student->id,
                            'subject_id' => $subject->id,
                            'term' => 'Semester 1',
                            'exam_type' => $exam,
                        ],
                        [
                            'score' => $score,
                            'max_score' => 100.00,
                            'remarks' => $score >= 90 ? 'Excellent performance' : ($score >= 80 ? 'Good work' : 'Satisfactory'),
                            'graded_by' => $subject->teacher?->user_id ?? $adminUser->id,
                        ]
                    );
                }
            }
        }
    }
}
