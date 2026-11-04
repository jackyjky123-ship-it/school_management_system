<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'name' => $this->user?->name,
            'email' => $this->user?->email,
            'role' => 'student',
            'student_code' => $this->student_code,
            'classroom_id' => $this->classroom_id,
            'classroom' => $this->whenLoaded('classroom', function () {
                return $this->classroom ? [
                    'id' => $this->classroom->id,
                    'name' => $this->classroom->name,
                    'grade_level' => $this->classroom->grade_level,
                ] : null;
            }),
            'gender' => $this->gender,
            'date_of_birth' => $this->date_of_birth?->format('Y-m-d'),
            'guardian_name' => $this->guardian_name,
            'guardian_phone' => $this->guardian_phone,
            'address' => $this->address,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
