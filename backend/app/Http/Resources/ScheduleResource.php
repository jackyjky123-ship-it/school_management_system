<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ScheduleResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'classroom_id' => $this->classroom_id,
            'classroom_name' => $this->classroom?->name,
            'grade_level' => $this->classroom?->grade_level,
            'academic_year' => $this->classroom?->academic_year,
            'subject_id' => $this->subject_id,
            'subject_name' => $this->subject?->name ?? 'Homeroom Advisory',
            'subject_code' => $this->subject?->code,
            'teacher_id' => $this->teacher_id,
            'teacher_name' => $this->teacher?->user?->name,
            'teacher_email' => $this->teacher?->user?->email,
            'term' => $this->term,
            'day_of_week' => $this->day_of_week,
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'room' => $this->room,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
