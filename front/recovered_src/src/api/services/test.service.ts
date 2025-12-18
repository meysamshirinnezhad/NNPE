import apiClient, { handleApiError } from '../client';
import type {
  PracticeTest,
  StartTestRequest,
  StartTestResponse,
  SubmitAnswerRequest,
  TestResultResponse,
  TestResultsResponse,
} from '../types';

export interface TestHistoryItem {
  id: string;
  test_type: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  time_spent_seconds: number;
  started_at: string;
  completed_at?: string;
  status: string;
}

class TestService {
  /**
   * Start a new practice test
   */
  async startTest(data: StartTestRequest): Promise<StartTestResponse> {
    try {
      const response = await apiClient.post<StartTestResponse>('/practice-tests', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get practice test details
   */
  async getTest(testId: string): Promise<PracticeTest> {
    try {
      const response = await apiClient.get<PracticeTest>(`/practice-tests/${testId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Submit answer during test
   */
  async submitTestAnswer(
    testId: string,
    position: number,
    data: SubmitAnswerRequest
  ): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>(
        `/practice-tests/${testId}/questions/${position}/answer`,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Complete practice test
   */
  async completeTest(testId: string): Promise<TestResultResponse> {
    try {
      const response = await apiClient.post<TestResultResponse>(
        `/practice-tests/${testId}/complete`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get comprehensive test results (matching TEST_RESULTS_API_SPECIFICATION.md)
   */
  async getTestResults(testId: string): Promise<TestResultsResponse> {
    try {
      const response = await apiClient.get<TestResultsResponse>(
        `/practice-tests/${testId}/results`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get test review (all questions with answers)
   */
  async reviewTest(testId: string): Promise<PracticeTest> {
    try {
      const response = await apiClient.get<PracticeTest>(
        `/practice-tests/${testId}/review`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get user's test history
   */
  async getTestHistory(): Promise<PracticeTest[]> {
    try {
      const response = await apiClient.get<PracticeTest[]>('/users/me/practice-tests');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get filtered test history with pagination
   */
  async listHistory(params?: {
    topic_id?: string;
    test_type?: string;
    status?: 'completed' | 'in_progress' | 'all';
    page?: number;
    page_size?: number;
  }): Promise<{
    items: PracticeTest[];
    page: number;
    page_size: number;
    total: number;
  }> {
    try {
      const queryParams: any = {
        page: params?.page || 1,
        page_size: params?.page_size || 5,
      };

      if (params?.topic_id) queryParams.topic_id = params.topic_id;
      if (params?.test_type) queryParams.test_type = params.test_type;
      if (params?.status && params.status !== 'all') queryParams.status = params.status;

      const response = await apiClient.get<PracticeTest[]>('/users/me/practice-tests', {
        params: queryParams,
      });

      // Backend doesn't return pagination metadata yet, so we create it
      const items = response.data;
      return {
        items,
        page: queryParams.page,
        page_size: queryParams.page_size,
        total: items.length, // Will be accurate once backend adds pagination
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get optimized test history for profile display
   */
  async getTestHistorySummary(): Promise<TestHistoryItem[]> {
    try {
      const response = await apiClient.get<TestHistoryItem[]>('/users/me/practice-tests/summary');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new TestService();
