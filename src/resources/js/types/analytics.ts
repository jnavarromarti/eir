export interface AnalyticsOverview {
  revenue: {
    week: number;
    month: number;
    year: number;
    total: number;
    pending: number;
  };
  appointments: {
    week: number;
    month: number;
    completed_month: number;
    cancelled_month: number;
  };
  invoices_by_status: Record<string, { count: number; total: number }>;
}

export interface PractitionerStats {
  id: string;
  name: string;
  role: string;
  appointments: {
    week: number;
    month: number;
    year: number;
    completed_month: number;
    cancelled_month: number;
  };
  revenue: {
    week: number;
    month: number;
    year: number;
  };
}

export interface ChartDataPoint {
  label: string;
  revenue: number;
  appointments: number;
}
