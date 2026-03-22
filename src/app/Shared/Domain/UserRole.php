<?php

namespace App\Shared\Domain;

enum UserRole: string
{
    case ADMIN                = 'ADMIN';
    case ADMINISTRATIVE       = 'ADMINISTRATIVE';
    case CHIROPODIST          = 'CHIROPODIST';
    case PHYSIOTHERAPIST      = 'PHYSIOTHERAPIST';
    case SPEECH_THERAPIST     = 'SPEECH_THERAPIST';
    case DENTIST              = 'DENTIST';
    case RADIOLOGY_TECHNICIAN = 'RADIOLOGY_TECHNICIAN';

    public function label(): string
    {
        return match ($this) {
            self::ADMIN                => 'Administrador',
            self::ADMINISTRATIVE       => 'Administrativo/a',
            self::CHIROPODIST          => 'Podólogo/a',
            self::PHYSIOTHERAPIST      => 'Fisioterapeuta',
            self::SPEECH_THERAPIST     => 'Logopeda',
            self::DENTIST              => 'Dentista',
            self::RADIOLOGY_TECHNICIAN => 'Técnico de radiología',
        };
    }

    /** Roles activos en la primera fase */
    public static function activePhaseOne(): array
    {
        return [
            self::ADMIN,
            self::ADMINISTRATIVE,
            self::CHIROPODIST,
            self::RADIOLOGY_TECHNICIAN,
        ];
    }
}
