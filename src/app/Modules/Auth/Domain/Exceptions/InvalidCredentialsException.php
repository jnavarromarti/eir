<?php

namespace App\Modules\Auth\Domain\Exceptions;

use App\Shared\Domain\DomainException;

class InvalidCredentialsException extends DomainException
{
    public function __construct()
    {
        parent::__construct('Las credenciales proporcionadas son incorrectas.');
    }
}
