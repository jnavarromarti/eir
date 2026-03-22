<?php

namespace App\Models;

use App\Shared\Domain\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, HasUuids, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'specialty_id',
        'is_active',
        'two_factor_secret',
        'two_factor_enabled',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at'  => 'datetime',
            'password'           => 'hashed',
            'role'               => UserRole::class,
            'is_active'          => 'boolean',
            'two_factor_enabled' => 'boolean',
        ];
    }

    // --- Relationships ---

    public function specialty(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Specialty::class);
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'practitioner_id');
    }

    public function clinicalRecords(): HasMany
    {
        return $this->hasMany(ClinicalRecord::class, 'practitioner_id');
    }

    // --- Helpers ---

    public function isAdmin(): bool
    {
        return $this->role === UserRole::ADMIN;
    }

    public function hasRole(UserRole $role): bool
    {
        return $this->role === $role || $this->isAdmin();
    }

    public function hasAnyRole(array $roles): bool
    {
        return $this->isAdmin() || in_array($this->role, $roles, true);
    }
}
