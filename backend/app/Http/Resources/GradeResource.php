<?php

namespace App\Http\Resources;

use App\Services\AcademicCalculationService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GradeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $service = app(AcademicCalculationService::class);
        $score = (float) $this->score;
        $max = (float) $this->max_score > 0 ? (float) $this->max_score : 100.0;
        $percentage = round(($score / $max) * 100.0, 2);
        $letter = $service->getLetterGrade($percentage);

        return [
            'id' => $this->id,
            'student_id' => $this->student_id,
            'student_name' => $this->student?->user?->name,
            'student_code' => $this->student?->student_code,
            'subject_id' => $this->subject_id,
            'subject_name' => $this->subject?->name,
            'subject_code' => $this->subject?->code,
            'term' => $this->term,
            'exam_type' => $this->exam_type,
            'score' => $score,
            'max_score' => $max,
            'percentage' => $percentage,
            'letter_grade' => $letter,
            'remarks' => $this->remarks,
            'graded_by' => $this->graded_by,
            'graded_by_name' => $this->grader?->name,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
