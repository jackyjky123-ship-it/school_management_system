<?php

namespace App\Enums;

enum RoleEnums: string
{
    case ADMIN = 'admin';
    case TEACHER = 'teacher';
    case STUDENT = 'student';

    public function label(): string
    {
        return match ($this) {
            self::ADMIN => 'Admin',
            self::TEACHER => 'Teacher',
            self::STUDENT => 'Student',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
