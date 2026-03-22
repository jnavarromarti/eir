<?php

namespace App\Modules\Auth\Domain\Exceptions;

use App\Shared\Domain\DomainException;

class TwoFactorRequiredException extends DomainException
{
    private string $tempToken;

    public function __construct(string $tempToken)
    {
        parent::__construct('Se requiere verificación de doble factor.');
        $this->tempToken = $tempToken;
    }

    public function getTempToken(): string
    {
        return $this->tempToken;
    }
}
