import { apiRequest } from './apiClient';

export interface ActiveTripItem {
  id: string;
  trip_code: string;
  driver_name: string;
  driver_phone: string;
  driver_vehicle: string;
  store_name: string;
  pickup_quarter: string;
  buyer_name: string;
  delivery_quarter: string;
  delivery_fee: number;
  stage: 1 | 2 | 3 | 4;
  stage_name: string;
  distance_km: number;
  elapsed_mins: number;
  status: 'en_route' | 'picked_up' | 'delivered' | 'sos';
  latitude: number;
  longitude: number;
}

export const logisticsApi = {
  /**
   * Fetch active driver GPS trip telemetry.
   * API Endpoint: GET /api/v1/staff/logistics/trips
   */
  getActiveTrips: async () => {
    return apiRequest<ActiveTripItem[]>('/staff/logistics/trips', {
      method: 'GET',
    });
  },

  /**
   * Execute manual trip stage override.
   * API Endpoint: POST /api/v1/staff/logistics/trips/{id}/override
   */
  overrideTripStage: async (id: string, stage: number, reason: string) => {
    return apiRequest<ActiveTripItem>(`/staff/logistics/trips/${id}/override`, {
      method: 'POST',
      body: JSON.stringify({ stage, reason }),
    });
  },
};
