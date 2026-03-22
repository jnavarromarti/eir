<?php

namespace App\Modules\Appointments\Application\UseCases;

use App\Models\Appointment;
use App\Shared\Domain\DomainException;

class CheckOverlapUseCase
{
    /**
     * @throws DomainException
     */
    public function execute(
        string $practitionerId,
        string $startsAt,
        string $endsAt,
        ?string $excludeAppointmentId = null,
    ): void {
        $query = Appointment::where('practitioner_id', $practitionerId)
            ->where('starts_at', '<', $endsAt)
            ->where('ends_at', '>', $startsAt)
            ->whereNotIn('status', ['CANCELLED', 'NO_SHOW']);

        if ($excludeAppointmentId) {
            $query->where('id', '!=', $excludeAppointmentId);
        }

        if ($query->exists()) {
            throw new class extends DomainException {
                public function __construct()
                {
                    parent::__construct('El profesional ya tiene una cita en ese horario.');
                }
            };
        }
    }
}
