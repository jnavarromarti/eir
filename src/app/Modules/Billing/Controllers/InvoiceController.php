<?php

namespace App\Modules\Billing\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Modules\Billing\Application\DTOs\CreateInvoiceRequest;
use App\Modules\Billing\Application\UseCases\CreateInvoiceUseCase;
use App\Shared\Domain\InvoiceStatus;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class InvoiceController extends Controller
{
    public function __construct(
        private readonly CreateInvoiceUseCase $createInvoice,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Invoice::with('patient:id,first_name,last_name')
            ->select('id', 'invoice_number', 'patient_id', 'status', 'total', 'issued_at', 'created_at');

        if ($request->has('patient_id')) {
            $query->where('patient_id', $request->input('patient_id'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        return response()->json(
            $query->orderByDesc('created_at')->paginate(25)
        );
    }

    public function store(CreateInvoiceRequest $request): JsonResponse
    {
        $invoice = $this->createInvoice->execute(
            $request->validated(),
            $request->user()->id,
        );

        $invoice->load(['patient:id,first_name,last_name', 'lines']);

        return response()->json($invoice, 201);
    }

    public function show(Invoice $invoice): JsonResponse
    {
        $invoice->load(['patient', 'issuer:id,name', 'lines.service:id,name']);

        return response()->json($invoice);
    }

    public function issue(Invoice $invoice): JsonResponse
    {
        $invoice->update([
            'status'    => InvoiceStatus::ISSUED->value,
            'issued_at' => now(),
        ]);

        return response()->json($invoice);
    }

    public function markPaid(Invoice $invoice): JsonResponse
    {
        $invoice->update([
            'status'  => InvoiceStatus::PAID->value,
            'paid_at' => now(),
        ]);

        return response()->json($invoice);
    }

    public function cancel(Invoice $invoice): JsonResponse
    {
        $invoice->update([
            'status' => InvoiceStatus::CANCELLED->value,
        ]);

        return response()->json($invoice);
    }

    public function pdf(Invoice $invoice): Response
    {
        $invoice->load(['patient', 'issuer:id,name', 'lines.service:id,name']);

        $pdf = Pdf::loadView('pdf.invoice', compact('invoice'))
            ->setPaper('a4')
            ->setOption('defaultFont', 'Helvetica');

        return $pdf->download("{$invoice->invoice_number}.pdf");
    }
}
