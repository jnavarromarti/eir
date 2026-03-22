<?php

namespace App\Modules\Analytics\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Invoice;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function overview(Request $request): JsonResponse
    {
        $now = Carbon::now();
        $weekStart = $now->copy()->startOfWeek();
        $weekEnd = $now->copy()->endOfWeek();
        $monthStart = $now->copy()->startOfMonth();
        $monthEnd = $now->copy()->endOfMonth();
        $yearStart = $now->copy()->startOfYear();
        $yearEnd = $now->copy()->endOfYear();

        // Revenue totals (PAID invoices only)
        $revenueWeek = Invoice::where('status', 'PAID')
            ->whereBetween('paid_at', [$weekStart, $weekEnd])
            ->sum('total');

        $revenueMonth = Invoice::where('status', 'PAID')
            ->whereBetween('paid_at', [$monthStart, $monthEnd])
            ->sum('total');

        $revenueYear = Invoice::where('status', 'PAID')
            ->whereBetween('paid_at', [$yearStart, $yearEnd])
            ->sum('total');

        $revenueTotal = Invoice::where('status', 'PAID')->sum('total');

        // Pending revenue (ISSUED invoices)
        $pendingRevenue = Invoice::where('status', 'ISSUED')->sum('total');

        // Appointment counts
        $appointmentsWeek = Appointment::whereBetween('starts_at', [$weekStart, $weekEnd])->count();
        $appointmentsMonth = Appointment::whereBetween('starts_at', [$monthStart, $monthEnd])->count();

        $completedMonth = Appointment::where('status', 'COMPLETED')
            ->whereBetween('starts_at', [$monthStart, $monthEnd])
            ->count();

        $cancelledMonth = Appointment::whereIn('status', ['CANCELLED', 'NO_SHOW'])
            ->whereBetween('starts_at', [$monthStart, $monthEnd])
            ->count();

        // Invoice status breakdown
        $invoicesByStatus = Invoice::selectRaw('status, COUNT(*) as count, SUM(total) as total')
            ->groupBy('status')
            ->get()
            ->keyBy('status')
            ->map(fn ($row) => [
                'count' => (int) $row->count,
                'total' => round((float) $row->total, 2),
            ]);

        return response()->json([
            'revenue' => [
                'week'    => round((float) $revenueWeek, 2),
                'month'   => round((float) $revenueMonth, 2),
                'year'    => round((float) $revenueYear, 2),
                'total'   => round((float) $revenueTotal, 2),
                'pending' => round((float) $pendingRevenue, 2),
            ],
            'appointments' => [
                'week'            => $appointmentsWeek,
                'month'           => $appointmentsMonth,
                'completed_month' => $completedMonth,
                'cancelled_month' => $cancelledMonth,
            ],
            'invoices_by_status' => $invoicesByStatus,
        ]);
    }

    public function practitioners(Request $request): JsonResponse
    {
        $now = Carbon::now();
        $weekStart = $now->copy()->startOfWeek();
        $weekEnd = $now->copy()->endOfWeek();
        $monthStart = $now->copy()->startOfMonth();
        $monthEnd = $now->copy()->endOfMonth();
        $yearStart = $now->copy()->startOfYear();
        $yearEnd = $now->copy()->endOfYear();

        $practitioners = User::whereNotIn('role', ['ADMIN', 'ADMINISTRATIVE'])
            ->where('is_active', true)
            ->get(['id', 'name', 'role']);

        $result = $practitioners->map(function (User $user) use ($weekStart, $weekEnd, $monthStart, $monthEnd, $yearStart, $yearEnd) {
            // Appointments
            $aptsWeek = Appointment::where('practitioner_id', $user->id)
                ->whereBetween('starts_at', [$weekStart, $weekEnd])
                ->count();

            $aptsMonth = Appointment::where('practitioner_id', $user->id)
                ->whereBetween('starts_at', [$monthStart, $monthEnd])
                ->count();

            $aptsYear = Appointment::where('practitioner_id', $user->id)
                ->whereBetween('starts_at', [$yearStart, $yearEnd])
                ->count();

            $completedMonth = Appointment::where('practitioner_id', $user->id)
                ->where('status', 'COMPLETED')
                ->whereBetween('starts_at', [$monthStart, $monthEnd])
                ->count();

            $cancelledMonth = Appointment::where('practitioner_id', $user->id)
                ->whereIn('status', ['CANCELLED', 'NO_SHOW'])
                ->whereBetween('starts_at', [$monthStart, $monthEnd])
                ->count();

            // Revenue: sum invoice totals for patients this practitioner treated
            $patientIds = Appointment::where('practitioner_id', $user->id)
                ->where('status', 'COMPLETED')
                ->pluck('patient_id')
                ->unique();

            $revenueWeek = Invoice::where('status', 'PAID')
                ->whereIn('patient_id', $patientIds)
                ->whereBetween('paid_at', [$weekStart, $weekEnd])
                ->sum('total');

            $revenueMonth = Invoice::where('status', 'PAID')
                ->whereIn('patient_id', $patientIds)
                ->whereBetween('paid_at', [$monthStart, $monthEnd])
                ->sum('total');

            $revenueYear = Invoice::where('status', 'PAID')
                ->whereIn('patient_id', $patientIds)
                ->whereBetween('paid_at', [$yearStart, $yearEnd])
                ->sum('total');

            return [
                'id'   => $user->id,
                'name' => $user->name,
                'role' => $user->role,
                'appointments' => [
                    'week'            => $aptsWeek,
                    'month'           => $aptsMonth,
                    'year'            => $aptsYear,
                    'completed_month' => $completedMonth,
                    'cancelled_month' => $cancelledMonth,
                ],
                'revenue' => [
                    'week'  => round((float) $revenueWeek, 2),
                    'month' => round((float) $revenueMonth, 2),
                    'year'  => round((float) $revenueYear, 2),
                ],
            ];
        });

        return response()->json($result->values());
    }

    public function revenueChart(Request $request): JsonResponse
    {
        $period = $request->input('period', 'month'); // week, month, year
        $now = Carbon::now();

        $data = match ($period) {
            'week' => $this->weeklyChart($now),
            'year' => $this->yearlyChart($now),
            default => $this->monthlyChart($now),
        };

        return response()->json($data);
    }

    private function weeklyChart(Carbon $now): array
    {
        $weekStart = $now->copy()->startOfWeek();
        $points = [];

        for ($i = 0; $i < 7; $i++) {
            $day = $weekStart->copy()->addDays($i);
            $revenue = Invoice::where('status', 'PAID')
                ->whereDate('paid_at', $day)
                ->sum('total');

            $appointments = Appointment::whereDate('starts_at', $day)->count();

            $points[] = [
                'label' => $day->translatedFormat('D d'),
                'revenue' => round((float) $revenue, 2),
                'appointments' => $appointments,
            ];
        }

        return $points;
    }

    private function monthlyChart(Carbon $now): array
    {
        $monthStart = $now->copy()->startOfMonth();
        $weeks = [];

        for ($w = 0; $w < 5; $w++) {
            $start = $monthStart->copy()->addWeeks($w)->startOfWeek();
            $end = $start->copy()->endOfWeek();

            if ($start->month !== $now->month && $end->month !== $now->month) continue;

            $revenue = Invoice::where('status', 'PAID')
                ->whereBetween('paid_at', [$start, $end])
                ->sum('total');

            $appointments = Appointment::whereBetween('starts_at', [$start, $end])->count();

            $weeks[] = [
                'label' => 'Sem ' . ($w + 1),
                'revenue' => round((float) $revenue, 2),
                'appointments' => $appointments,
            ];
        }

        return $weeks;
    }

    private function yearlyChart(Carbon $now): array
    {
        $months = [];

        for ($m = 1; $m <= 12; $m++) {
            $start = Carbon::create($now->year, $m, 1)->startOfMonth();
            $end = $start->copy()->endOfMonth();

            $revenue = Invoice::where('status', 'PAID')
                ->whereBetween('paid_at', [$start, $end])
                ->sum('total');

            $appointments = Appointment::whereBetween('starts_at', [$start, $end])->count();

            $months[] = [
                'label' => $start->translatedFormat('M'),
                'revenue' => round((float) $revenue, 2),
                'appointments' => $appointments,
            ];
        }

        return $months;
    }
}
