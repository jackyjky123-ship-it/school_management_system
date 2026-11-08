<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseApiRequest;
use App\Models\Schedule;
use App\Models\Subject;

class StoreScheduleRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'classroom_id' => ['required', 'integer', 'exists:classrooms,id'],
            'subject_id' => ['nullable', 'integer', 'exists:subjects,id'],
            'teacher_id' => ['required', 'integer', 'exists:teacher_profiles,id'],
            'term' => ['required', 'string', 'max:50'],
            'day_of_week' => ['required', 'string', 'in:monday,tuesday,wednesday,thursday,friday,saturday,sunday'],
            'start_time' => ['required', 'date_format:H:i,H:i:s'],
            'end_time' => ['required', 'date_format:H:i,H:i:s'],
            'room' => ['nullable', 'string', 'max:50'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $startTime = date('H:i:s', strtotime($this->start_time));
            $endTime = date('H:i:s', strtotime($this->end_time));

            if ($startTime >= $endTime) {
                $validator->errors()->add('end_time', 'The end time must be after start time.');

                return;
            }

            if ($this->filled('subject_id')) {
                $subjectExistsInClassroom = Subject::where('id', $this->subject_id)
                    ->where('classroom_id', $this->classroom_id)
                    ->exists();

                if (! $subjectExistsInClassroom) {
                    $validator->errors()->add('subject_id', 'The selected subject does not belong to this classroom.');
                }
            }

            $dayOfWeek = strtolower($this->day_of_week);

            // Check classroom collision
            $classroomConflict = Schedule::where('classroom_id', $this->classroom_id)
                ->where('term', $this->term)
                ->where('day_of_week', $dayOfWeek)
                ->where('start_time', '<', $endTime)
                ->where('end_time', '>', $startTime)
                ->exists();

            if ($classroomConflict) {
                $validator->errors()->add('classroom_id', 'The classroom is already booked during this time window.');
            }

            // Check teacher collision
            $teacherConflict = Schedule::where('teacher_id', $this->teacher_id)
                ->where('term', $this->term)
                ->where('day_of_week', $dayOfWeek)
                ->where('start_time', '<', $endTime)
                ->where('end_time', '>', $startTime)
                ->exists();

            if ($teacherConflict) {
                $validator->errors()->add('teacher_id', 'The teacher is already scheduled for another class during this time window.');
            }
        });
    }

    public function validated($key = null, $default = null): array
    {
        $data = parent::validated($key, $default);
        if (isset($data['start_time'])) {
            $data['start_time'] = date('H:i:s', strtotime($data['start_time']));
        }
        if (isset($data['end_time'])) {
            $data['end_time'] = date('H:i:s', strtotime($data['end_time']));
        }
        if (isset($data['day_of_week'])) {
            $data['day_of_week'] = strtolower($data['day_of_week']);
        }

        return $data;
    }
}
