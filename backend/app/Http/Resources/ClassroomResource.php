<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClassroomResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'grade_level' => $this->grade_level,
            'academic_year' => $this->academic_year,
            'homeroom_teacher_id' => $this->homeroom_teacher_id,
            'homeroom_teacher' => $this->whenLoaded('homeroomTeacher', function () {
                return $this->homeroomTeacher ? [
                    'id' => $this->homeroomTeacher->id,
                    'name' => $this->homeroomTeacher->user?->name,
                    'employee_code' => $this->homeroomTeacher->employee_code,
                ] : null;
            }),
            'students_count' => $this->whenCounted('students'),
            'subjects_count' => $this->whenCounted('subjects'),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
