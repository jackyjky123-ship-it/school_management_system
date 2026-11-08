<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('subjects')]
#[Fillable(['name', 'code', 'classroom_id', 'teacher_id'])]
class Subject extends Model
{
    use HasFactory;

    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(TeacherProfile::class, 'teacher_id');
    }

    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class, 'subject_id');
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class, 'subject_id');
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class, 'subject_id');
    }
}
