import apiClient, { handleApiError } from '../client';
import type {
  StudyPath,
  UpdateModuleProgressRequest,
} from '../types';

class StudyService {
  /**
   * Get user's study path
   */
  async getStudyPath(): Promise<StudyPath> {
    try {
      const response = await apiClient.get<StudyPath>('/users/me/study-path');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update module progress
   */
  async updateModuleProgress(
    moduleId: string,
    data: UpdateModuleProgressRequest
  ): Promise<{ message: string }> {
    try {
      const response = await apiClient.put<{ message: string }>(
        `/study-path/modules/${moduleId}/progress`,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Mark module as complete
   */
  async completeModule(moduleId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>(
        `/study-path/modules/${moduleId}/complete`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new StudyService();
