<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Auth\Application\DTOs\LoginRequest;
use App\Modules\Auth\Application\DTOs\VerifyTwoFactorRequest;
use App\Modules\Auth\Application\UseCases\EnableTwoFactorUseCase;
use App\Modules\Auth\Application\UseCases\LoginUseCase;
use App\Modules\Auth\Application\UseCases\LogoutUseCase;
use App\Modules\Auth\Application\UseCases\VerifyTwoFactorUseCase;
use App\Modules\Auth\Domain\Exceptions\InvalidCredentialsException;
use App\Modules\Auth\Domain\Exceptions\InvalidTwoFactorCodeException;
use App\Modules\Auth\Domain\Exceptions\TwoFactorRequiredException;
use App\Modules\Auth\Domain\Exceptions\UserNotActiveException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(
        private readonly LoginUseCase $loginUseCase,
        private readonly VerifyTwoFactorUseCase $verifyTwoFactorUseCase,
        private readonly EnableTwoFactorUseCase $enableTwoFactorUseCase,
        private readonly LogoutUseCase $logoutUseCase,
    ) {}

    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $result = $this->loginUseCase->execute(
                $request->validated('username'),
                $request->validated('password'),
            );

            return response()->json([
                'token' => $result['token'],
                'user'  => $this->formatUser($result['user']),
            ]);
        } catch (TwoFactorRequiredException $e) {
            return response()->json([
                'two_factor_required' => true,
                'temp_token'          => $e->getTempToken(),
            ]);
        } catch (InvalidCredentialsException|UserNotActiveException $e) {
            return response()->json(['message' => $e->getMessage()], 401);
        }
    }

    public function verifyTwoFactor(VerifyTwoFactorRequest $request): JsonResponse
    {
        try {
            $result = $this->verifyTwoFactorUseCase->execute(
                $request->validated('temp_token'),
                $request->validated('code'),
            );

            return response()->json([
                'token' => $result['token'],
                'user'  => $this->formatUser($result['user']),
            ]);
        } catch (InvalidCredentialsException|InvalidTwoFactorCodeException $e) {
            return response()->json(['message' => $e->getMessage()], 401);
        }
    }

    public function enableTwoFactor(Request $request): JsonResponse
    {
        $result = $this->enableTwoFactorUseCase->execute($request->user());

        return response()->json([
            'secret' => $result['secret'],
            'qr_url' => $result['qr_url'],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->logoutUseCase->execute($request->user());

        return response()->json(['message' => 'Sesión cerrada correctamente.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($this->formatUser($request->user()));
    }

    private function formatUser($user): array
    {
        return [
            'id'    => $user->id,
            'name'  => $user->name,
            'email' => $user->email,
            'role'  => $user->role->value,
            'two_factor_enabled' => $user->two_factor_enabled,
        ];
    }
}
