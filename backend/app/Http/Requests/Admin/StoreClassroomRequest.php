<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseApiRequest;
use Illuminate\Validation\Rule;

class StoreClassroomRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:50',
                Rule::unique('classrooms')->where(function ($query) {
                    return $query->where('academic_year', $this->academic_year);
                }),
            ],
            'grade_level' => ['required', 'string', 'max:20'],
            'academic_year' => ['required', 'string', 'max:20'],
            'homeroom_teacher_id' => ['nullable', 'exists:teacher_profiles,id'],
        ];
    }
}
