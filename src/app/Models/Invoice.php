<?php

namespace App\Models;

use App\Shared\Domain\InvoiceStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Invoice extends Model
{
    use HasUuids;

    protected $fillable = [
        'invoice_number',
        'patient_id',
        'issued_by',
        'status',
        'subtotal',
        'total',
        'issued_at',
        'paid_at',
        'notes',
        'reference_clinic',
    ];

    protected function casts(): array
    {
        return [
            'status'     => InvoiceStatus::class,
            'subtotal'   => 'decimal:2',
            'total'      => 'decimal:2',
            'issued_at'  => 'date',
            'paid_at'    => 'date',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function issuer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    public function lines(): HasMany
    {
        return $this->hasMany(InvoiceLine::class);
    }

    public function recalculateTotals(): void
    {
        $this->subtotal = $this->lines->sum('line_total');
        $this->total    = $this->subtotal;
    }
}
