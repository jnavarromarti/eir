<?php

namespace App\Modules\Auth\Application\UseCases;

use App\Models\User;
use App\Modules\Auth\Domain\Exceptions\InvalidCredentialsException;
use App\Modules\Auth\Domain\Exceptions\TwoFactorRequiredException;
use App\Modules\Auth\Domain\Exceptions\UserNotActiveException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;

class LoginUseCase
{
    /**
     * @return array{token: string, user: User}
     * @throws InvalidCredentialsException
     * @throws TwoFactorRequiredException
     * @throws UserNotActiveException
     */
    public function execute(string $username, string $password): array
    {
        $user = User::where('email', $username)
            ->orWhere('name', $username)
            ->first();

        if (!$user || !Hash::check($password, $user->password)) {
            throw new InvalidCredentialsException();
        }

        if (!$user->is_active) {
            throw new UserNotActiveException();
        }

        // If 2FA enabled, generate temp token and require verification
        if ($user->two_factor_enabled) {
            $tempToken = Str::random(64);
            Cache::put("2fa_temp:{$tempToken}", $user->id, now()->addMinutes(5));
            throw new TwoFactorRequiredException($tempToken);
        }

        // No 2FA — issue Sanctum token directly
        $token = $user->createToken('session', ['*'], now()->addHours(8))->plainTextToken;

        return [
            'token' => $token,
            'user'  => $user,
        ];
    }
}
