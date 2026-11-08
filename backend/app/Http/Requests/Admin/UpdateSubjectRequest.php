<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseApiRequest;
use App\Models\Subject;
use Illuminate\Validation\Rule;

class UpdateSubjectRequest extends BaseApiRequest
{
    public function rules(): array
    {
        $subject = $this->route('subject');
        $subjectId = $subject instanceof Subject ? $subject->id : $subject;

        return [
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'code' => [
                'sometimes',
                'required',
                'string',
                'max:30',
                Rule::unique('subjects', 'code')->ignore($subjectId),
            ],
            'classroom_id' => ['sometimes', 'required', 'exists:classrooms,id'],
            'teacher_id' => ['nullable', 'exists:teacher_profiles,id'],
        ];
    }
}
