import { apiRequest } from './apiClient';

export interface AdvertItem {
  id: string;
  target_audience: 'seller' | 'buyer' | 'transporter' | 'all';
  type: 'tip' | 'banner' | 'special_offer' | 'partner';
  badge?: string;
  badge_color?: string;
  title: string;
  subtitle?: string;
  cta_text?: string;
  action_screen?: string;
  action_url?: string;
  image_url?: string;
  icon_name?: string;
  icon_color?: string;
  category?: string;
  discount_percent?: number;
  sort_order: number;
  is_active: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export const advertsApi = {
  /**
   * List all adverts with optional filters
   */
  async getAdverts(params?: {
    audience?: string;
    type?: string;
    is_active?: boolean;
  }): Promise<AdvertItem[]> {
    const query = new URLSearchParams();
    if (params?.audience) query.append('audience', params.audience);
    if (params?.type) query.append('type', params.type);
    if (params?.is_active !== undefined) query.append('is_active', String(params.is_active));

    const url = `/staff/adverts${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await apiRequest<AdvertItem[]>(url);
    return res.data || [];
  },

  /**
   * Create a new advert, banner, tip, or partner
   */
  async createAdvert(advert: Partial<AdvertItem>): Promise<AdvertItem> {
    const res = await apiRequest<AdvertItem>('/staff/adverts', {
      method: 'POST',
      body: JSON.stringify(advert),
    });
    return res.data;
  },

  /**
   * Get single advert by ID
   */
  async getAdvert(id: string): Promise<AdvertItem> {
    const res = await apiRequest<AdvertItem>(`/staff/adverts/${id}`);
    return res.data;
  },

  /**
   * Update advert details or toggle active state
   */
  async updateAdvert(id: string, updates: Partial<AdvertItem>): Promise<AdvertItem> {
    const res = await apiRequest<AdvertItem>(`/staff/adverts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return res.data;
  },

  /**
   * Delete an advert
   */
  async deleteAdvert(id: string): Promise<void> {
    await apiRequest(`/staff/adverts/${id}`, {
      method: 'DELETE',
    });
  },
};

