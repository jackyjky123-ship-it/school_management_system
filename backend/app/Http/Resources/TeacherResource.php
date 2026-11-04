<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeacherResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'name' => $this->user?->name,
            'email' => $this->user?->email,
            'role' => 'teacher',
            'employee_code' => $this->employee_code,
            'specialization' => $this->specialization,
            'phone' => $this->phone,
            'hire_date' => $this->hire_date?->format('Y-m-d'),
            'homeroom_classrooms' => ClassroomResource::collection($this->whenLoaded('homeroomClassrooms')),
            'subjects' => SubjectResource::collection($this->whenLoaded('subjects')),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
