<?php

namespace App\Shared\Domain;

enum AppointmentStatus: string
{
    case SCHEDULED   = 'SCHEDULED';
    case CONFIRMED   = 'CONFIRMED';
    case IN_PROGRESS = 'IN_PROGRESS';
    case COMPLETED   = 'COMPLETED';
    case CANCELLED   = 'CANCELLED';
    case NO_SHOW     = 'NO_SHOW';

    public function label(): string
    {
        return match ($this) {
            self::SCHEDULED   => 'Programada',
            self::CONFIRMED   => 'Confirmada',
            self::IN_PROGRESS => 'En curso',
            self::COMPLETED   => 'Completada',
            self::CANCELLED   => 'Cancelada',
            self::NO_SHOW     => 'No presentado',
        };
    }
}
