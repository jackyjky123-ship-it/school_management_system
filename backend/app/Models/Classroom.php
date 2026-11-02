<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('classrooms')]
#[Fillable(['name', 'grade_level', 'academic_year', 'homeroom_teacher_id'])]
class Classroom extends Model
{
    use HasFactory;

    public function homeroomTeacher(): BelongsTo
    {
        return $this->belongsTo(TeacherProfile::class, 'homeroom_teacher_id');
    }

    public function students(): HasMany
    {
        return $this->hasMany(StudentProfile::class, 'classroom_id');
    }

    public function subjects(): HasMany
    {
        return $this->hasMany(Subject::class, 'classroom_id');
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class, 'classroom_id');
    }
}