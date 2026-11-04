<?php

namespace App\Http\Requests\Attendance;

use App\Enums\AttendanceStatusEnum;
use App\Http\Requests\BaseApiRequest;
use Illuminate\Validation\Rule;

class BatchStoreAttendanceRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'classroom_id' => ['required', 'exists:classrooms,id'],
            'subject_id' => ['nullable', 'exists:subjects,id'],
            'date' => ['required', 'date'],
            'records' => ['required', 'array', 'min:1'],
            'records.*.student_id' => ['required', 'exists:student_profiles,id'],
            'records.*.status' => ['required', 'string', Rule::in(AttendanceStatusEnum::values())],
            'records.*.remarks' => ['nullable', 'string', 'max:255'],
        ];
    }
}
