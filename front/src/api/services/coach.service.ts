import apiClient, { handleApiError } from '../client';
import type { CoachResponse } from '../types';

class CoachService {
  /**
   * Get AI coaching advice
   */
  async getCoach(): Promise<CoachResponse> {
    try {
      const response = await apiClient.post<CoachResponse>('/users/me/ai/coach');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new CoachService();
