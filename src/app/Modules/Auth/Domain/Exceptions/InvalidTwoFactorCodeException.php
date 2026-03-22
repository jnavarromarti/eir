<?php

namespace App\Modules\Auth\Domain\Exceptions;

use App\Shared\Domain\DomainException;

class InvalidTwoFactorCodeException extends DomainException
{
    public function __construct()
    {
        parent::__construct('El código de verificación 2FA es inválido.');
    }
}
