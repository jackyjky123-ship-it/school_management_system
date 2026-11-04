<?php

namespace App\Http\Requests\Grade;

use App\Http\Requests\BaseApiRequest;
use App\Models\Subject;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\Rule;

class BatchStoreGradeRequest extends BaseApiRequest
{
    public function rules(): array
    {
        $subjectId = $this->input('subject_id');
        $classroomId = is_numeric($subjectId)
            ? Subject::query()->whereKey($subjectId)->value('classroom_id')
            : null;

        return [
            'subject_id' => ['required', 'integer', 'exists:subjects,id'],
            'term' => ['required', 'string', 'max:50'],
            'exam_type' => ['required', 'string', 'max:50'],
            'records' => ['required', 'array', 'min:1'],
            'records.*.student_id' => [
                'required',
                'integer',
                'distinct',
                Rule::exists('student_profiles', 'id')->where(
                    fn ($query) => $query->where('classroom_id', $classroomId ?? 0)
                ),
            ],
            'records.*.score' => ['required', 'numeric', 'min:0', 'max:999.99'],
            'records.*.max_score' => ['nullable', 'numeric', 'min:1', 'max:999.99'],
            'records.*.remarks' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * Ensure a score can never exceed the scale it was recorded against.
     */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->has('records')) {
                    return;
                }

                foreach ((array) $this->input('records', []) as $index => $record) {
                    if (! is_array($record) || ! isset($record['score']) || ! is_numeric($record['score'])) {
                        continue;
                    }

                    $maxScore = isset($record['max_score']) && is_numeric($record['max_score'])
                        ? (float) $record['max_score']
                        : 100.0;

                    if ((float) $record['score'] > $maxScore) {
                        $validator->errors()->add(
                            "records.{$index}.score",
                            'The score may not be greater than the max score.'
                        );
                    }
                }
            },
        ];
    }
}
