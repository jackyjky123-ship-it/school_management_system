<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseApiRequest;
use App\Models\StudentProfile;
use Illuminate\Validation\Rule;

class UpdateStudentRequest extends BaseApiRequest
{
    public function rules(): array
    {
        $student = $this->route('student');
        $studentId = $student instanceof StudentProfile ? $student->id : $student;
        $userId = $student instanceof StudentProfile ? $student->user_id : null;

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'student_code' => [
                'sometimes',
                'required',
                'string',
                'max:30',
                Rule::unique('student_profiles', 'student_code')->ignore($studentId),
            ],
            'classroom_id' => ['nullable', 'exists:classrooms,id'],
            'gender' => ['nullable', 'in:male,female,other'],
            'date_of_birth' => ['nullable', 'date'],
            'guardian_name' => ['nullable', 'string', 'max:100'],
            'guardian_phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:255'],
        ];
    }
}
