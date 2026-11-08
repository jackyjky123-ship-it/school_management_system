<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseApiRequest;
use App\Models\Classroom;
use Illuminate\Validation\Rule;

class UpdateClassroomRequest extends BaseApiRequest
{
    public function rules(): array
    {
        $classroomId = $this->route('classroom') instanceof Classroom
            ? $this->route('classroom')->id
            : $this->route('classroom');

        return [
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:50',
                Rule::unique('classrooms')->where(function ($query) {
                    return $query->where('academic_year', $this->academic_year ?? $this->route('classroom')?->academic_year);
                })->ignore($classroomId),
            ],
            'grade_level' => ['sometimes', 'required', 'string', 'max:20'],
            'academic_year' => ['sometimes', 'required', 'string', 'max:20'],
            'homeroom_teacher_id' => ['nullable', 'exists:teacher_profiles,id'],
        ];
    }
}
