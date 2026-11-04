<?php

namespace App\Http\Requests\Grade;

use App\Http\Requests\BaseApiRequest;

class BatchStoreGradeRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'subject_id' => ['required', 'exists:subjects,id'],
            'term' => ['required', 'string', 'max:50'],
            'exam_type' => ['required', 'string', 'max:50'],
            'records' => ['required', 'array', 'min:1'],
            'records.*.student_id' => ['required', 'exists:student_profiles,id'],
            'records.*.score' => ['required', 'numeric', 'min:0'],
            'records.*.max_score' => ['nullable', 'numeric', 'min:1'],
            'records.*.remarks' => ['nullable', 'string', 'max:255'],
        ];
    }
}
