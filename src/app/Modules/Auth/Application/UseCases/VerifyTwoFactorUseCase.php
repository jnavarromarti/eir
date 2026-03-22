<?php

namespace App\Modules\Auth\Application\UseCases;

use App\Models\User;
use App\Modules\Auth\Domain\Exceptions\InvalidCredentialsException;
use App\Modules\Auth\Domain\Exceptions\InvalidTwoFactorCodeException;
use Illuminate\Support\Facades\Cache;
use PragmaRX\Google2FA\Google2FA;

class VerifyTwoFactorUseCase
{
    public function __construct(
        private readonly Google2FA $google2fa,
    ) {}

    /**
     * @return array{token: string, user: User}
     * @throws InvalidCredentialsException
     * @throws InvalidTwoFactorCodeException
     */
    public function execute(string $tempToken, string $code): array
    {
        $userId = Cache::pull("2fa_temp:{$tempToken}");

        if (!$userId) {
            throw new InvalidCredentialsException();
        }

        $user = User::findOrFail($userId);

        $valid = $this->google2fa->verifyKey(
            decrypt($user->two_factor_secret),
            $code
        );

        if (!$valid) {
            throw new InvalidTwoFactorCodeException();
        }

        $token = $user->createToken('session', ['*'], now()->addHours(8))->plainTextToken;

        return [
            'token' => $token,
            'user'  => $user,
        ];
    }
}
