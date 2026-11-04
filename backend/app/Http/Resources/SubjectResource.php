<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'classroom_id' => $this->classroom_id,
            'classroom_name' => $this->classroom?->name,
            'teacher_id' => $this->teacher_id,
            'teacher_name' => $this->teacher?->user?->name,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
