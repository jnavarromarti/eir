<?php

namespace App\Modules\Auth\Application\UseCases;

use App\Models\User;
use PragmaRX\Google2FA\Google2FA;

class EnableTwoFactorUseCase
{
    public function __construct(
        private readonly Google2FA $google2fa,
    ) {}

    /**
     * Generate a new 2FA secret for the user.
     * @return array{secret: string, qr_url: string}
     */
    public function execute(User $user): array
    {
        $secret = $this->google2fa->generateSecretKey();

        $user->update([
            'two_factor_secret'  => encrypt($secret),
            'two_factor_enabled' => true,
        ]);

        $qrUrl = $this->google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $secret
        );

        return [
            'secret' => $secret,
            'qr_url' => $qrUrl,
        ];
    }
}
