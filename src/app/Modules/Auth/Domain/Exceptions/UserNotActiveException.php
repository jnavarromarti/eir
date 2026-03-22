<?php

namespace App\Modules\Auth\Domain\Exceptions;

use App\Shared\Domain\DomainException;

class UserNotActiveException extends DomainException
{
    public function __construct()
    {
        parent::__construct('La cuenta de usuario no está activa.');
    }
}
