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
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class MockDataSeeder extends Seeder
{
    /**
     * Run the database seeds with rich mockup data for testing.
     */
    public function run(): void
    {
        $defaultPassword = Hash::make('password');

        // 1. Roles
        $adminRole = Role::findOrCreate(RoleEnums::ADMIN->value, 'sanctum');
        $teacherRole = Role::findOrCreate(RoleEnums::TEACHER->value, 'sanctum');
        $studentRole = Role::findOrCreate(RoleEnums::STUDENT->value, 'sanctum');

        // 2. Administrators
        $adminUser = User::updateOrCreate(
            ['email' => 'admin@school.test'],
            [
                'name' => 'System Administrator',
                'password' => $defaultPassword,
                'is_active' => true,
            ]
        );
        $adminUser->assignRole($adminRole);

        // 3. Faculty Teachers
        $facultyData = [
            [
                'name' => 'Dr. Sarah Jenkins',
                'email' => 'teacher.math@school.test',
                'employee_code' => 'TCH-001',
                'specialization' => 'Mathematics & Calculus',
                'phone' => '+1-555-0101',
                'hire_date' => '2022-08-15',
            ],
            [
                'name' => 'Prof. Michael Chang',
                'email' => 'teacher.science@school.test',
                'employee_code' => 'TCH-002',
                'specialization' => 'Physical Science & Physics',
                'phone' => '+1-555-0102',
                'hire_date' => '2022-08-15',
            ],
            [
                'name' => 'Ms. Elena Rostova',
                'email' => 'teacher.english@school.test',
                'employee_code' => 'TCH-003',
                'specialization' => 'English & World Literature',
                'phone' => '+1-555-0103',
                'hire_date' => '2023-01-10',
            ],
            [
                'name' => 'Mr. Arthur Pendelton',
                'email' => 'teacher.history@school.test',
                'employee_code' => 'TCH-004',
                'specialization' => 'European & Global History',
                'phone' => '+1-555-0104',
                'hire_date' => '2023-08-20',
            ],
            [
                'name' => 'Dr. Alan Turing',
                'email' => 'teacher.cs@school.test',
                'employee_code' => 'TCH-005',
                'specialization' => 'Computer Science & AI',
                'phone' => '+1-555-0105',
                'hire_date' => '2024-01-15',
            ],
            [
                'name' => 'Ms. Maya Lin',
                'email' => 'teacher.art@school.test',
                'employee_code' => 'TCH-006',
                'specialization' => 'Visual Arts & Architecture',
                'phone' => '+1-555-0106',
                'hire_date' => '2024-03-01',
            ],
            [
                'name' => 'Dr. Rosalind Franklin',
                'email' => 'teacher.biology@school.test',
                'employee_code' => 'TCH-007',
                'specialization' => 'Molecular Biology & Genetics',
                'phone' => '+1-555-0107',
                'hire_date' => '2024-06-15',
            ],
        ];

        $teachers = [];
        foreach ($facultyData as $f) {
            $user = User::updateOrCreate(
                ['email' => $f['email']],
                [
                    'name' => $f['name'],
                    'password' => $defaultPassword,
                    'is_active' => true,
                ]
            );
            $user->assignRole($teacherRole);

            $profile = TeacherProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'employee_code' => $f['employee_code'],
                    'specialization' => $f['specialization'],
                    'phone' => $f['phone'],
                    'hire_date' => $f['hire_date'],
                ]
            );
            $teachers[$f['employee_code']] = $profile;
        }

        // 4. Classrooms
        $classroomsData = [
            ['name' => 'Grade 10 - A', 'grade_level' => 'Grade 10', 'academic_year' => '2026-2027', 'homeroom_teacher' => 'TCH-001'],
            ['name' => 'Grade 10 - B', 'grade_level' => 'Grade 10', 'academic_year' => '2026-2027', 'homeroom_teacher' => 'TCH-002'],
            ['name' => 'Grade 11 - A', 'grade_level' => 'Grade 11', 'academic_year' => '2026-2027', 'homeroom_teacher' => 'TCH-003'],
            ['name' => 'Grade 11 - B', 'grade_level' => 'Grade 11', 'academic_year' => '2026-2027', 'homeroom_teacher' => 'TCH-004'],
            ['name' => 'Grade 12 - Honors', 'grade_level' => 'Grade 12', 'academic_year' => '2026-2027', 'homeroom_teacher' => 'TCH-005'],
        ];

        $classrooms = [];
        foreach ($classroomsData as $c) {
            $teacherId = isset($teachers[$c['homeroom_teacher']]) ? $teachers[$c['homeroom_teacher']]->id : null;
            $classroom = Classroom::updateOrCreate(
                ['name' => $c['name'], 'academic_year' => $c['academic_year']],
                [
                    'grade_level' => $c['grade_level'],
                    'homeroom_teacher_id' => $teacherId,
                ]
            );
            $classrooms[$c['name']] = $classroom;
        }

        // 5. Subjects across Classrooms
        $subjectsData = [
            // Grade 10 - A
            ['code' => 'MATH-10A', 'name' => 'Algebra & Geometry 10A', 'class' => 'Grade 10 - A', 'teacher' => 'TCH-001'],
            ['code' => 'SCI-10A', 'name' => 'Physical Science 10A', 'class' => 'Grade 10 - A', 'teacher' => 'TCH-002'],
            ['code' => 'ENG-10A', 'name' => 'World Literature 10A', 'class' => 'Grade 10 - A', 'teacher' => 'TCH-003'],
            ['code' => 'HIST-10A', 'name' => 'Global Civilizations 10A', 'class' => 'Grade 10 - A', 'teacher' => 'TCH-004'],
            ['code' => 'CS-10A', 'name' => 'Intro to Python 10A', 'class' => 'Grade 10 - A', 'teacher' => 'TCH-005'],

            // Grade 10 - B
            ['code' => 'MATH-10B', 'name' => 'Algebra & Geometry 10B', 'class' => 'Grade 10 - B', 'teacher' => 'TCH-001'],
            ['code' => 'SCI-10B', 'name' => 'Physical Science 10B', 'class' => 'Grade 10 - B', 'teacher' => 'TCH-002'],
            ['code' => 'ENG-10B', 'name' => 'World Literature 10B', 'class' => 'Grade 10 - B', 'teacher' => 'TCH-003'],
            ['code' => 'BIO-10B', 'name' => 'General Biology 10B', 'class' => 'Grade 10 - B', 'teacher' => 'TCH-007'],

            // Grade 11 - A
            ['code' => 'CALC-11A', 'name' => 'Pre-Calculus 11A', 'class' => 'Grade 11 - A', 'teacher' => 'TCH-001'],
            ['code' => 'PHYS-11A', 'name' => 'Classical Physics 11A', 'class' => 'Grade 11 - A', 'teacher' => 'TCH-002'],
            ['code' => 'APENG-11A', 'name' => 'AP English Language 11A', 'class' => 'Grade 11 - A', 'teacher' => 'TCH-003'],
            ['code' => 'ART-11A', 'name' => 'Studio Art & Design 11A', 'class' => 'Grade 11 - A', 'teacher' => 'TCH-006'],

            // Grade 11 - B
            ['code' => 'CALC-11B', 'name' => 'Pre-Calculus 11B', 'class' => 'Grade 11 - B', 'teacher' => 'TCH-001'],
            ['code' => 'HIST-11B', 'name' => 'Modern European History 11B', 'class' => 'Grade 11 - B', 'teacher' => 'TCH-004'],
            ['code' => 'BIO-11B', 'name' => 'Genetics & Cellular Biology 11B', 'class' => 'Grade 11 - B', 'teacher' => 'TCH-007'],

            // Grade 12 - Honors
            ['code' => 'APCALC-12H', 'name' => 'AP Calculus BC 12H', 'class' => 'Grade 12 - Honors', 'teacher' => 'TCH-001'],
            ['code' => 'QUANT-12H', 'name' => 'Quantum Mechanics & Modern Physics', 'class' => 'Grade 12 - Honors', 'teacher' => 'TCH-002'],
            ['code' => 'AI-12H', 'name' => 'Artificial Intelligence & Neural Nets', 'class' => 'Grade 12 - Honors', 'teacher' => 'TCH-005'],
        ];

        $subjects = [];
        foreach ($subjectsData as $s) {
            $classroomId = $classrooms[$s['class']]->id;
            $teacherId = $teachers[$s['teacher']]->id;
            $subject = Subject::updateOrCreate(
                ['code' => $s['code']],
                [
                    'name' => $s['name'],
                    'classroom_id' => $classroomId,
                    'teacher_id' => $teacherId,
                ]
            );
            $subjects[$s['code']] = $subject;
        }

        // 6. Comprehensive Student Profiles (45 Students)
        $studentsList = [
            // Grade 10 - A
            ['Alex Morgan', 'male', 'student@school.test', 'Grade 10 - A', '2010-04-12', 'Sarah Morgan', '+1-555-1001', '101 Pinecrest Way, Metro City'],
            ['Emma Watson', 'female', 'student2@school.test', 'Grade 10 - A', '2010-06-21', 'David Watson', '+1-555-1002', '102 Oakridge Ave, Metro City'],
            ['Liam Johnson', 'male', 'student3@school.test', 'Grade 10 - A', '2010-02-14', 'Carol Johnson', '+1-555-1003', '103 Maple Lane, Metro City'],
            ['Olivia Brown', 'female', 'student4@school.test', 'Grade 10 - A', '2010-08-09', 'Richard Brown', '+1-555-1004', '104 Cedar Blvd, Metro City'],
            ['Noah Garcia', 'male', 'student5@school.test', 'Grade 10 - A', '2010-11-30', 'Maria Garcia', '+1-555-1005', '105 Elm Court, Metro City'],
            ['Sophia Miller', 'female', 'student6@school.test', 'Grade 10 - A', '2010-03-25', 'Robert Miller', '+1-555-1006', '106 Birch St, Metro City'],
            ['Lucas Davis', 'male', 'student7@school.test', 'Grade 10 - A', '2010-07-19', 'Patricia Davis', '+1-555-1007', '107 Spruce Terr, Metro City'],
            ['Ava Rodriguez', 'female', 'student8@school.test', 'Grade 10 - A', '2010-09-04', 'Carlos Rodriguez', '+1-555-1008', '108 Willow Way, Metro City'],
            ['Ethan Martinez', 'male', 'student9@school.test', 'Grade 10 - A', '2010-01-17', 'Elena Martinez', '+1-555-1009', '109 Ash Drive, Metro City'],
            ['Mia Hernandez', 'female', 'student10@school.test', 'Grade 10 - A', '2010-12-05', 'Jose Hernandez', '+1-555-1010', '110 Walnut Rd, Metro City'],

            // Grade 10 - B
            ['Mason Lopez', 'male', 'student11@school.test', 'Grade 10 - B', '2010-05-18', 'Anita Lopez', '+1-555-1011', '201 Magnolia Ave, Metro City'],
            ['Isabella Gonzalez', 'female', 'student12@school.test', 'Grade 10 - B', '2010-10-22', 'Hector Gonzalez', '+1-555-1012', '202 Sycamore St, Metro City'],
            ['Logan Wilson', 'male', 'student13@school.test', 'Grade 10 - B', '2010-04-03', 'Grace Wilson', '+1-555-1013', '203 Poplar Way, Metro City'],
            ['Harper Anderson', 'female', 'student14@school.test', 'Grade 10 - B', '2010-08-16', 'James Anderson', '+1-555-1014', '204 Alder Court, Metro City'],
            ['James Thomas', 'male', 'student15@school.test', 'Grade 10 - B', '2010-02-28', 'Brenda Thomas', '+1-555-1015', '205 Chestnut St, Metro City'],
            ['Evelyn Taylor', 'female', 'student16@school.test', 'Grade 10 - B', '2010-07-11', 'Thomas Taylor', '+1-555-1016', '206 Hickory Blvd, Metro City'],
            ['Benjamin Moore', 'male', 'student17@school.test', 'Grade 10 - B', '2010-09-14', 'Laura Moore', '+1-555-1017', '207 Cypress Lane, Metro City'],
            ['Charlotte Jackson', 'female', 'student18@school.test', 'Grade 10 - B', '2010-11-02', 'Samuel Jackson', '+1-555-1018', '208 Redwood Dr, Metro City'],
            ['Henry Martin', 'male', 'student19@school.test', 'Grade 10 - B', '2010-03-08', 'Diane Martin', '+1-555-1019', '209 Sequoia Way, Metro City'],
            ['Amelia Lee', 'female', 'student20@school.test', 'Grade 10 - B', '2010-06-29', 'Kenneth Lee', '+1-555-1020', '210 Linden Pl, Metro City'],

            // Grade 11 - A
            ['Miles Morales', 'male', 'student21@school.test', 'Grade 11 - A', '2009-08-14', 'Rio Morales', '+1-555-2001', '301 Brooklyn St, Metro City'],
            ['Gwen Stacy', 'female', 'student22@school.test', 'Grade 11 - A', '2009-04-20', 'George Stacy', '+1-555-2002', '302 Queens Blvd, Metro City'],
            ['Peter Parker', 'male', 'student23@school.test', 'Grade 11 - A', '2009-08-10', 'May Parker', '+1-555-2003', '303 Forest Hills, Metro City'],
            ['Mary Jane Watson', 'female', 'student24@school.test', 'Grade 11 - A', '2009-09-18', 'Madeline Watson', '+1-555-2004', '304 Manhattan Ave, Metro City'],
            ['Harry Osborn', 'male', 'student25@school.test', 'Grade 11 - A', '2009-01-25', 'Norman Osborn', '+1-555-2005', '305 Central Park S, Metro City'],
            ['Felicia Hardy', 'female', 'student26@school.test', 'Grade 11 - A', '2009-07-07', 'Walter Hardy', '+1-555-2006', '306 Riverside Dr, Metro City'],
            ['Cindy Moon', 'female', 'student27@school.test', 'Grade 11 - A', '2009-11-12', 'Albert Moon', '+1-555-2007', '307 Hudson Yard, Metro City'],
            ['Anya Corazon', 'female', 'student28@school.test', 'Grade 11 - A', '2009-03-05', 'Gilberto Corazon', '+1-555-2008', '308 Bronx River Ave, Metro City'],

            // Grade 11 - B
            ['Alexander Hamilton', 'male', 'student29@school.test', 'Grade 11 - B', '2009-01-11', 'Rachel Fawcett', '+1-555-3001', '401 Constitution Ave, Metro City'],
            ['Eliza Schuyler', 'female', 'student30@school.test', 'Grade 11 - B', '2009-08-09', 'Philip Schuyler', '+1-555-3002', '402 Liberty Lane, Metro City'],
            ['Aaron Burr', 'male', 'student31@school.test', 'Grade 11 - B', '2009-02-06', 'Esther Edwards', '+1-555-3003', '403 Princeton Road, Metro City'],
            ['Angelica Schuyler', 'female', 'student32@school.test', 'Grade 11 - B', '2009-02-20', 'Philip Schuyler', '+1-555-3004', '404 Heritage Blvd, Metro City'],
            ['John Laurens', 'male', 'student33@school.test', 'Grade 11 - B', '2009-10-28', 'Henry Laurens', '+1-555-3005', '405 Freedom Way, Metro City'],
            ['Peggy Schuyler', 'female', 'student34@school.test', 'Grade 11 - B', '2009-09-19', 'Philip Schuyler', '+1-555-3006', '406 Independence St, Metro City'],

            // Grade 12 - Honors
            ['Isaac Newton', 'male', 'student35@school.test', 'Grade 12 - Honors', '2008-01-04', 'Hannah Ayscough', '+1-555-4001', '501 Principia Way, Metro City'],
            ['Marie Curie', 'female', 'student36@school.test', 'Grade 12 - Honors', '2008-11-07', 'Wladyslaw Sklodowski', '+1-555-4002', '502 Polonium Terrace, Metro City'],
            ['Albert Einstein', 'male', 'student37@school.test', 'Grade 12 - Honors', '2008-03-14', 'Hermann Einstein', '+1-555-4003', '503 Relativity Blvd, Metro City'],
            ['Ada Lovelace', 'female', 'student38@school.test', 'Grade 12 - Honors', '2008-12-10', 'Anne Byron', '+1-555-4004', '504 Algorithm Ave, Metro City'],
            ['Nikola Tesla', 'male', 'student39@school.test', 'Grade 12 - Honors', '2008-07-10', 'Milutin Tesla', '+1-555-4005', '505 Alternating Current Way, Metro City'],
            ['Katherine Johnson', 'female', 'student40@school.test', 'Grade 12 - Honors', '2008-08-26', 'Joshua Coleman', '+1-555-4006', '506 Apollo Court, Metro City'],
            ['Carl Sagan', 'male', 'student41@school.test', 'Grade 12 - Honors', '2008-11-09', 'Samuel Sagan', '+1-555-4007', '507 Cosmos Blvd, Metro City'],
            ['Grace Hopper', 'female', 'student42@school.test', 'Grade 12 - Honors', '2008-12-09', 'Walter Murray', '+1-555-4008', '508 Compiler Court, Metro City'],

            // Unassigned Students (to test unassigned filtering and classroom assignment flow)
            ['Jordan Taylor', 'other', 'student43@school.test', null, '2010-05-15', 'Morgan Taylor', '+1-555-5001', '601 Transit Road, Metro City'],
            ['Riley Cooper', 'female', 'student44@school.test', null, '2009-10-10', 'Casey Cooper', '+1-555-5002', '602 Gateway Circle, Metro City'],
            ['Sam Chen', 'male', 'student45@school.test', null, '2008-06-25', 'Wei Chen', '+1-555-5003', '603 Metro Turnpike, Metro City'],
        ];

        $studentProfiles = [];
        foreach ($studentsList as $index => [$name, $gender, $email, $className, $dob, $guardian, $phone, $address]) {
            $classroomId = $className && isset($classrooms[$className]) ? $classrooms[$className]->id : null;
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
                    'classroom_id' => $classroomId,
                    'gender' => $gender,
                    'date_of_birth' => $dob,
                    'guardian_name' => $guardian,
                    'guardian_phone' => $phone,
                    'address' => $address,
                ]
            );
            $studentProfiles[] = $profile;
        }

        // 7. Rich Attendance Records (past 25 school days up to today)
        $schoolDays = [];
        $dayCursor = Carbon::now()->subDays(35);
        $today = Carbon::now();

        while ($dayCursor->lessThanOrEqualTo($today)) {
            if (! $dayCursor->isWeekend()) {
                $schoolDays[] = $dayCursor->toDateString();
            }
            $dayCursor->addDay();
        }

        $attendanceStatuses = [
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

        DB::transaction(function () use ($studentProfiles, $schoolDays, $attendanceStatuses, $adminUser) {
            foreach ($studentProfiles as $stdIndex => $student) {
                if (! $student->classroom_id) {
                    continue;
                }

                foreach ($schoolDays as $dIndex => $dateStr) {
                    // Ensure Alex Morgan (student@school.test) has a pristine attendance record (95%+)
                    if ($stdIndex === 0) {
                        $status = ($dIndex % 15 === 0) ? AttendanceStatusEnum::LATE : AttendanceStatusEnum::PRESENT;
                    } else {
                        $status = $attendanceStatuses[($stdIndex * 3 + $dIndex) % count($attendanceStatuses)];
                    }

                    $remark = null;
                    if ($status === AttendanceStatusEnum::LATE) {
                        $remark = 'Arrived 10 minutes late due to transit';
                    } elseif ($status === AttendanceStatusEnum::ABSENT) {
                        $remark = 'Unexcused absence - guardian notified via SMS';
                    } elseif ($status === AttendanceStatusEnum::EXCUSED) {
                        $remark = 'Official medical documentation on file';
                    }

                    Attendance::updateOrCreate(
                        [
                            'student_id' => $student->id,
                            'date' => $dateStr,
                            'subject_id' => null, // Homeroom Daily Attendance
                        ],
                        [
                            'classroom_id' => $student->classroom_id,
                            'status' => $status->value,
                            'remarks' => $remark,
                            'recorded_by' => $adminUser->id,
                        ]
                    );
                }
            }
        });

        // 8. Rich Grading Ledger across Terms and Subjects
        $termsAndExams = [
            ['term' => 'Semester 1', 'exam_type' => 'Midterm'],
            ['term' => 'Semester 1', 'exam_type' => 'Final'],
            ['term' => 'Semester 1', 'exam_type' => 'Quiz 1'],
            ['term' => 'Semester 2', 'exam_type' => 'Midterm'],
            ['term' => 'Semester 2', 'exam_type' => 'Quiz 1'],
        ];

        $classroomSubjectsMap = [];
        foreach ($subjects as $s) {
            $classroomSubjectsMap[$s->classroom_id][] = $s;
        }

        DB::transaction(function () use ($studentProfiles, $classroomSubjectsMap, $termsAndExams, $adminUser) {
            foreach ($studentProfiles as $stdIndex => $student) {
                if (! $student->classroom_id || ! isset($classroomSubjectsMap[$student->classroom_id])) {
                    continue;
                }

                $enrolledSubjects = $classroomSubjectsMap[$student->classroom_id];

                foreach ($enrolledSubjects as $subIndex => $subject) {
                    foreach ($termsAndExams as $evalIndex => $eval) {
                        // Distinct academic profiles for varied demonstration:
                        if ($stdIndex === 0) {
                            // Alex Morgan: High-performing student (GPA 3.8 - 4.0)
                            $score = 88.0 + (($subIndex * 4 + $evalIndex * 3) % 12);
                        } elseif ($stdIndex % 5 === 0) {
                            // Mixed performer (Letter grades C to B)
                            $score = 70.0 + (($stdIndex + $subIndex * 6 + $evalIndex * 4) % 20);
                        } elseif ($stdIndex % 7 === 0) {
                            // Struggling performer in specific course (D to C)
                            $score = 62.0 + (($stdIndex + $subIndex * 5) % 18);
                        } else {
                            // Solid A/B student
                            $score = 78.0 + (($stdIndex * 7 + $subIndex * 3 + $evalIndex * 5) % 22);
                        }

                        $score = min(100.00, round((float) $score, 1));

                        $remark = match (true) {
                            $score >= 93.0 => 'Outstanding mastery of coursework and critical thinking.',
                            $score >= 85.0 => 'Very thorough understanding of subject concepts.',
                            $score >= 75.0 => 'Solid effort and consistent homework participation.',
                            $score >= 65.0 => 'Needs focused review on core assignment modules.',
                            default => 'Additional tutoring recommended before next assessment period.',
                        };

                        Grade::updateOrCreate(
                            [
                                'student_id' => $student->id,
                                'subject_id' => $subject->id,
                                'term' => $eval['term'],
                                'exam_type' => $eval['exam_type'],
                            ],
                            [
                                'score' => $score,
                                'max_score' => 100.00,
                                'remarks' => $remark,
                                'graded_by' => $subject->teacher?->user_id ?? $adminUser->id,
                            ]
                        );
                    }
                }
            }
        });
    }
}
