<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseApiRequest;
use App\Models\TeacherProfile;
use Illuminate\Validation\Rule;

class UpdateTeacherRequest extends BaseApiRequest
{
    public function rules(): array
    {
        $teacher = $this->route('teacher');
        $teacherId = $teacher instanceof TeacherProfile ? $teacher->id : $teacher;
        $userId = $teacher instanceof TeacherProfile ? $teacher->user_id : null;

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
            'employee_code' => [
                'sometimes',
                'required',
                'string',
                'max:30',
                Rule::unique('teacher_profiles', 'employee_code')->ignore($teacherId),
            ],
            'specialization' => ['sometimes', 'required', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:30'],
            'hire_date' => ['nullable', 'date'],
        ];
    }
}
