<?php

namespace App\Http\Requests\Attendance;

use App\Enums\AttendanceStatusEnum;
use App\Http\Requests\BaseApiRequest;
use Illuminate\Validation\Rule;

class BatchStoreAttendanceRequest extends BaseApiRequest
{
    public function rules(): array
    {
        $classroomId = $this->input('classroom_id');
        $classroomId = is_numeric($classroomId) ? (int) $classroomId : 0;

        return [
            'classroom_id' => ['required', 'integer', 'exists:classrooms,id'],
            'subject_id' => [
                'nullable',
                'integer',
                Rule::exists('subjects', 'id')->where(
                    fn ($query) => $query->where('classroom_id', $classroomId)
                ),
            ],
            'date' => ['required', 'date'],
            'records' => ['required', 'array', 'min:1'],
            'records.*.student_id' => [
                'required',
                'integer',
                'distinct',
                Rule::exists('student_profiles', 'id')->where(
                    fn ($query) => $query->where('classroom_id', $classroomId)
                ),
            ],
            'records.*.status' => ['required', 'string', Rule::in(AttendanceStatusEnum::values())],
            'records.*.remarks' => ['nullable', 'string', 'max:255'],
        ];
    }
}
