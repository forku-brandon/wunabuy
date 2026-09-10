import { apiRequest } from './apiClient';

export interface DashboardDayChart {
  day: string;
  gmv: number;
  escrow: number;
  date: string;
}

export interface DashboardDonutSegment {
  name: string;
  value: number;
  count: number;
  color: string;
}

export interface DashboardStats {
  total_gmv: number;
  locked_in_escrow: number;
  pending_kyc_count: number;
  active_trips_count: number;
  open_disputes_count: number;
  total_users_count: number;
  chart_data: DashboardDayChart[];
  donut_data: DashboardDonutSegment[];
}

export const dashboardApi = {
  /**
   * Fetch real-time executive dashboard KPIs, GMV area curve, and status distribution donut.
   * API Endpoint: GET /api/v1/staff/dashboard/stats
   */
  getDashboardStats: async () => {
    return apiRequest<DashboardStats>('/staff/dashboard/stats', {
      method: 'GET',
    });
  },
};
