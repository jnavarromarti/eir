<?php

namespace App\Shared\Domain;

enum InvoiceStatus: string
{
    case DRAFT     = 'DRAFT';
    case ISSUED    = 'ISSUED';
    case PAID      = 'PAID';
    case CANCELLED = 'CANCELLED';

    public function label(): string
    {
        return match ($this) {
            self::DRAFT     => 'Borrador',
            self::ISSUED    => 'Emitida',
            self::PAID      => 'Pagada',
            self::CANCELLED => 'Anulada',
        };
    }
}
