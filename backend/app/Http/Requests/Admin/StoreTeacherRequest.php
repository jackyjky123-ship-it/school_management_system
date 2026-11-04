<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseApiRequest;

class StoreTeacherRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['nullable', 'string', 'min:6'],
            'employee_code' => ['required', 'string', 'max:30', 'unique:teacher_profiles,employee_code'],
            'specialization' => ['required', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:30'],
            'hire_date' => ['nullable', 'date'],
        ];
    }
}
