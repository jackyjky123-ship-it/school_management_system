<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseApiRequest;
use Illuminate\Validation\Rule;

class StoreSubjectRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:30', 'unique:subjects,code'],
            'classroom_id' => ['required', 'exists:classrooms,id'],
            'teacher_id' => ['nullable', 'exists:teacher_profiles,id'],
        ];
    }
}
