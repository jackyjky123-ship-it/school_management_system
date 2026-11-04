<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'student_id' => $this->student_id,
            'student_name' => $this->student?->user?->name,
            'student_code' => $this->student?->student_code,
            'classroom_id' => $this->classroom_id,
            'classroom_name' => $this->classroom?->name,
            'subject_id' => $this->subject_id,
            'subject_name' => $this->subject?->name,
            'date' => $this->date instanceof \DateTimeInterface ? $this->date->format('Y-m-d') : $this->date,
            'status' => $this->status instanceof \BackedEnum ? $this->status->value : $this->status,
            'remarks' => $this->remarks,
            'recorded_by' => $this->recorded_by,
            'recorded_by_name' => $this->recorder?->name,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
