<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $role = $this->roles->first()?->name ?? 'student';

        $profile = null;
        if ($this->relationLoaded('teacherProfile') && $this->teacherProfile) {
            $profile = [
                'type' => 'teacher',
                'employee_code' => $this->teacherProfile->employee_code,
                'specialization' => $this->teacherProfile->specialization,
                'phone' => $this->teacherProfile->phone,
            ];
        } elseif ($this->relationLoaded('studentProfile') && $this->studentProfile) {
            $profile = [
                'type' => 'student',
                'student_code' => $this->studentProfile->student_code,
                'classroom_id' => $this->studentProfile->classroom_id,
                'classroom' => $this->studentProfile->classroom?->name,
                'gender' => $this->studentProfile->gender,
            ];
        }

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $role,
            'is_active' => (bool) $this->is_active,
            'profile' => $profile,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
