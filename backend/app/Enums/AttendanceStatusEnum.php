<?php

namespace App\Enums;

enum AttendanceStatusEnum: string
{
    case PRESENT = 'present';
    case ABSENT = 'absent';
    case LATE = 'late';
    case EXCUSED = 'excused';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}