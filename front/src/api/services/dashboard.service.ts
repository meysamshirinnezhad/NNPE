import apiClient, { handleApiError } from '../client';
import type {
  DashboardData,
  AnalyticsData,
  WeakTopic,
} from '../types';

class DashboardService {
  /**
   * Get dashboard statistics
   */
  async getDashboard(): Promise<DashboardData> {
    try {
      const response = await apiClient.get<DashboardData>('/users/me/dashboard');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get performance analytics
   */
  async getAnalytics(timeframe: '7d' | '30d' | '90d' | 'all' = '30d'): Promise<AnalyticsData> {
    try {
      const response = await apiClient.get<AnalyticsData>('/users/me/analytics', {
        params: { timeframe },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get weakness report
   */
  async getWeaknesses(): Promise<{ weak_topics: WeakTopic[] }> {
    try {
      const response = await apiClient.get<{ weak_topics: WeakTopic[] }>('/users/me/weaknesses');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new DashboardService();