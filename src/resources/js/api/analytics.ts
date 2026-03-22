import client from './client';
import type { AnalyticsOverview, PractitionerStats, ChartDataPoint } from '@/types/analytics';

export const analyticsApi = {
  overview() {
    return client.get<AnalyticsOverview>('/analytics/overview');
  },

  practitioners() {
    return client.get<PractitionerStats[]>('/analytics/practitioners');
  },

  revenueChart(period: 'week' | 'month' | 'year') {
    return client.get<ChartDataPoint[]>('/analytics/revenue-chart', { params: { period } });
  },
};
