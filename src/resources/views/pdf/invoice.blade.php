<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>{{ $invoice->invoice_number }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 13px;
            color: #1a1a1a;
            line-height: 1.5;
            padding: 40px 50px;
        }

        /* ── Header ── */
        .header {
            display: table;
            width: 100%;
            margin-bottom: 30px;
            border-bottom: 3px solid #6A1B7C;
            padding-bottom: 20px;
        }
        .header-left {
            display: table-cell;
            vertical-align: top;
            width: 55%;
        }
        .header-right {
            display: table-cell;
            vertical-align: top;
            width: 45%;
            text-align: right;
        }
        .clinic-name {
            font-size: 26px;
            font-weight: 700;
            color: #6A1B7C;
            letter-spacing: -0.5px;
        }
        .clinic-subtitle {
            font-size: 12px;
            color: #8C3FA3;
            margin-top: 2px;
        }
        .invoice-title {
            font-size: 22px;
            font-weight: 700;
            color: #1a1a1a;
        }
        .invoice-number {
            font-size: 14px;
            color: #6b7280;
            margin-top: 2px;
        }
        .invoice-status {
            display: inline-block;
            margin-top: 6px;
            padding: 3px 12px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .status-draft      { background: #f3f4f6; color: #6B7280; }
        .status-issued     { background: #dbeafe; color: #3B82F6; }
        .status-paid       { background: #dcfce7; color: #10B981; }
        .status-cancelled  { background: #fee2e2; color: #EF4444; }

        /* ── Info blocks ── */
        .info-row {
            display: table;
            width: 100%;
            margin-bottom: 28px;
        }
        .info-block {
            display: table-cell;
            vertical-align: top;
            width: 33.33%;
        }
        .info-block h3 {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #8C3FA3;
            margin-bottom: 6px;
        }
        .info-block p {
            font-size: 13px;
            color: #374151;
            margin-bottom: 2px;
        }
        .info-block .name {
            font-weight: 600;
            color: #1a1a1a;
            font-size: 14px;
        }

        /* ── Table ── */
        .lines-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
        }
        .lines-table thead th {
            background: #FDF5FB;
            border-bottom: 2px solid #EDCBE3;
            padding: 10px 14px;
            text-align: left;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #6A1B7C;
        }
        .lines-table thead th.right {
            text-align: right;
        }
        .lines-table tbody td {
            padding: 10px 14px;
            border-bottom: 1px solid #f3f4f6;
            font-size: 13px;
            color: #374151;
        }
        .lines-table tbody td.right {
            text-align: right;
        }
        .lines-table tbody td.description {
            font-weight: 500;
            color: #1a1a1a;
        }

        /* ── Totals ── */
        .totals-wrapper {
            display: table;
            width: 100%;
        }
        .totals-spacer {
            display: table-cell;
            width: 55%;
        }
        .totals-box {
            display: table-cell;
            width: 45%;
        }
        .totals-table {
            width: 100%;
            border-collapse: collapse;
        }
        .totals-table td {
            padding: 6px 14px;
            font-size: 13px;
        }
        .totals-table .label {
            color: #6b7280;
            text-align: left;
        }
        .totals-table .value {
            text-align: right;
            font-weight: 500;
            color: #374151;
        }
        .totals-table .total-row td {
            border-top: 2px solid #D451B1;
            padding-top: 10px;
            font-size: 16px;
            font-weight: 700;
        }
        .totals-table .total-row .label {
            color: #1a1a1a;
        }
        .totals-table .total-row .value {
            color: #D451B1;
        }

        /* ── Notes ── */
        .notes {
            margin-top: 28px;
            padding: 14px 18px;
            background: #FDF5FB;
            border-left: 3px solid #D451B1;
            border-radius: 0 4px 4px 0;
        }
        .notes h4 {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #8C3FA3;
            margin-bottom: 4px;
        }
        .notes p {
            font-size: 12px;
            color: #6b7280;
        }

        /* ── Reference clinic ── */
        .reference-clinic {
            margin-bottom: 24px;
            padding: 12px 18px;
            background: #F6EEF8;
            border-left: 3px solid #8C3FA3;
            border-radius: 0 4px 4px 0;
        }
        .reference-clinic h4 {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #8C3FA3;
            margin-bottom: 4px;
        }
        .reference-clinic p {
            font-size: 13px;
            font-weight: 500;
            color: #374151;
        }

        /* ── Footer ── */
        .footer {
            margin-top: 40px;
            padding-top: 16px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 11px;
            color: #9ca3af;
        }
    </style>
</head>
<body>

    <!-- Header -->
    <div class="header">
        <div class="header-left">
            <div class="clinic-name">IMD</div>
            <div class="clinic-subtitle">Imagen Médica Digital</div>
        </div>
        <div class="header-right">
            <div class="invoice-title">FACTURA</div>
            <div class="invoice-number">{{ $invoice->invoice_number }}</div>
            @php
                $statusClass = match($invoice->status->value) {
                    'DRAFT'     => 'status-draft',
                    'ISSUED'    => 'status-issued',
                    'PAID'      => 'status-paid',
                    'CANCELLED' => 'status-cancelled',
                    default     => 'status-draft',
                };
                $statusLabel = $invoice->status->label();
            @endphp
            <div class="invoice-status {{ $statusClass }}">{{ $statusLabel }}</div>
        </div>
    </div>

    <!-- Info row: Paciente | Atendido por | Fechas -->
    <div class="info-row">
        <div class="info-block">
            <h3>Paciente</h3>
            <p class="name">{{ $invoice->patient->first_name }} {{ $invoice->patient->last_name }}</p>
            @if($invoice->patient->dni)
                <p>DNI: {{ $invoice->patient->dni }}</p>
            @endif
            @if($invoice->patient->address)
                <p>{{ $invoice->patient->address }}</p>
            @endif
            @if($invoice->patient->postal_code || $invoice->patient->city)
                <p>{{ $invoice->patient->postal_code }} {{ $invoice->patient->city }}{{ $invoice->patient->province ? ', ' . $invoice->patient->province : '' }}</p>
            @endif
            @if($invoice->patient->phone)
                <p>Tel: {{ $invoice->patient->phone }}</p>
            @endif
            @if($invoice->patient->email)
                <p>{{ $invoice->patient->email }}</p>
            @endif
        </div>

        <div class="info-block">
            <h3>Atendido por</h3>
            @if($invoice->issuer)
                <p class="name">{{ $invoice->issuer->name }}</p>
            @else
                <p>—</p>
            @endif
        </div>

        <div class="info-block">
            <h3>Fechas</h3>
            <p><strong>Creación:</strong> {{ $invoice->created_at->format('d/m/Y') }}</p>
            @if($invoice->issued_at)
                <p><strong>Emisión:</strong> {{ $invoice->issued_at->format('d/m/Y') }}</p>
            @endif
            @if($invoice->paid_at)
                <p><strong>Pago:</strong> {{ $invoice->paid_at->format('d/m/Y') }}</p>
            @endif
        </div>
    </div>

    <!-- Reference clinic -->
    @if($invoice->reference_clinic)
        <div class="reference-clinic">
            <h4>Clínica de referencia</h4>
            <p>{{ $invoice->reference_clinic }}</p>
        </div>
    @endif

    <!-- Lines table -->
    <table class="lines-table">
        <thead>
            <tr>
                <th style="width: 50%;">Concepto</th>
                <th class="right" style="width: 10%;">Cant.</th>
                <th class="right" style="width: 20%;">Precio Ud.</th>
                <th class="right" style="width: 20%;">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($invoice->lines as $line)
                <tr>
                    <td class="description">{{ $line->description }}</td>
                    <td class="right">{{ $line->quantity }}</td>
                    <td class="right">{{ number_format($line->unit_price, 2, ',', '.') }} €</td>
                    <td class="right">{{ number_format($line->line_total, 2, ',', '.') }} €</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Totals -->
    <div class="totals-wrapper">
        <div class="totals-spacer"></div>
        <div class="totals-box">
            <table class="totals-table">
                <tr class="total-row">
                    <td class="label">Total</td>
                    <td class="value">{{ number_format($invoice->total, 2, ',', '.') }} €</td>
                </tr>
            </table>
        </div>
    </div>

    <!-- Notes -->
    @if($invoice->notes)
        <div class="notes">
            <h4>Observaciones</h4>
            <p>{{ $invoice->notes }}</p>
        </div>
    @endif

    <!-- Footer -->
    <div class="footer">
        <span style="color: #6A1B7C; font-weight: 600;">IMD —  Imagen Médica Digital</span> &middot; Documento generado el {{ now()->format('d/m/Y H:i') }}
    </div>

</body>
</html>
