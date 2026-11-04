<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseApiRequest;

class StoreStudentRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['nullable', 'string', 'min:6'],
            'student_code' => ['required', 'string', 'max:30', 'unique:student_profiles,student_code'],
            'classroom_id' => ['nullable', 'exists:classrooms,id'],
            'gender' => ['nullable', 'in:male,female,other'],
            'date_of_birth' => ['nullable', 'date'],
            'guardian_name' => ['nullable', 'string', 'max:100'],
            'guardian_phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:255'],
        ];
    }
}
