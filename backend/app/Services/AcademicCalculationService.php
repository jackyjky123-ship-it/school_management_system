<?php

namespace App\Services;

use Illuminate\Support\Collection;

class AcademicCalculationService
{
    /**
     * Map a percentage score (0-100) to standard letter grade.
     */
    public function getLetterGrade(float $percentage): string
    {
        return match (true) {
            $percentage >= 90.0 => 'A',
            $percentage >= 80.0 => 'B',
            $percentage >= 70.0 => 'C',
            $percentage >= 60.0 => 'D',
            default => 'F',
        };
    }

    /**
     * Map a letter grade to standard 4.0 GPA grade points.
     */
    public function getGradePoint(string $letterGrade): float
    {
        return match (strtoupper($letterGrade)) {
            'A' => 4.0,
            'B' => 3.0,
            'C' => 2.0,
            'D' => 1.0,
            default => 0.0,
        };
    }

    /**
     * Calculate student GPA, overall percentage, and academic standing.
     */
    public function calculateStudentSummary(Collection $grades): array
    {
        if ($grades->isEmpty()) {
            return [
                'gpa' => 0.0,
                'average_percentage' => 0.0,
                'letter_grade' => 'N/A',
                'total_grades' => 0,
            ];
        }

        $totalPercentage = 0.0;
        $totalGradePoints = 0.0;
        $count = 0;

        foreach ($grades as $grade) {
            $max = $grade->max_score > 0 ? (float) $grade->max_score : 100.0;
            $percent = ((float) $grade->score / $max) * 100.0;
            $letter = $this->getLetterGrade($percent);
            $points = $this->getGradePoint($letter);

            $totalPercentage += $percent;
            $totalGradePoints += $points;
            $count++;
        }

        $avgPercent = round($totalPercentage / $count, 2);
        $gpa = round($totalGradePoints / $count, 2);

        return [
            'gpa' => $gpa,
            'average_percentage' => $avgPercent,
            'letter_grade' => $this->getLetterGrade($avgPercent),
            'total_grades' => $count,
        ];
    }
}
