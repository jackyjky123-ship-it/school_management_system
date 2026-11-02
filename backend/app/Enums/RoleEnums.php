<?php

namespace App\Enums;

enum RoleEnums: string
{
    case ADMIN = 'admin';
    case USER = 'teacher';
    case GUEST = 'student';

    public function label(): string
    {
        return match ($this) {
            self::ADMIN => 'Admin',
            self::USER => 'Teacher',
            self::GUEST => 'Student',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
