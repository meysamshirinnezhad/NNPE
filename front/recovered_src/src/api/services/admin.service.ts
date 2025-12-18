import apiClient, { handleApiError } from '../client';
import type {
  Question,
  UserProfile,
} from '../types';

interface AdminStatistics {
  total_users: number;
  active_users: number;
  total_questions: number;
  total_tests: number;
  revenue: number;
  conversion_rate: number;
}

interface CreateQuestionRequest {
  content: string;
  question_type: 'multiple_choice' | 'true_false';
  difficulty: 'easy' | 'medium' | 'hard';
  topic_id: string;
  sub_topic_id?: string;
  province?: string;
  explanation: string;
  reference_source: string;
  options: {
    content: string;
    is_correct: boolean;
    position: number;
  }[];
}

interface UpdateQuestionRequest extends Partial<CreateQuestionRequest> {
  is_active?: boolean;
}

class AdminService {
  /**
   * Get platform statistics (admin only)
   */
  async getStatistics(): Promise<AdminStatistics> {
    try {
      const response = await apiClient.get<AdminStatistics>('/admin/statistics');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get all users (admin only)
   */
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<{ users: UserProfile[]; total: number }> {
    try {
      const response = await apiClient.get<{ users: UserProfile[]; total: number }>(
        '/admin/users',
        { params }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create question (admin only)
   */
  async createQuestion(data: CreateQuestionRequest): Promise<Question> {
    try {
      const response = await apiClient.post<Question>('/admin/questions', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update question (admin only)
   */
  async updateQuestion(questionId: string, data: UpdateQuestionRequest): Promise<Question> {
    try {
      const response = await apiClient.put<Question>(`/admin/questions/${questionId}`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete question (admin only)
   */
  async deleteQuestion(questionId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(`/admin/questions/${questionId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new AdminService();