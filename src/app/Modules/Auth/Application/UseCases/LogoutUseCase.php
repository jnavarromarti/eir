<?php

namespace App\Modules\Auth\Application\UseCases;

use App\Models\User;

class LogoutUseCase
{
    public function execute(User $user): void
    {
        $user->currentAccessToken()->delete();
    }
}
