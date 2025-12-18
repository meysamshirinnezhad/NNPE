import apiClient, { handleApiError } from '../client';
import type {
  Question,
  Topic,
  GetQuestionsParams,
  QuestionsResponse,
  SubmitAnswerRequest,
  AnswerResponse,
} from '../types';

class QuestionService {
  /**
   * Get questions with filters
   */
  async getQuestions(params?: GetQuestionsParams): Promise<QuestionsResponse> {
    try {
      const response = await apiClient.get<QuestionsResponse>('/questions', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get single question by ID
   */
  async getQuestion(questionId: string): Promise<Question> {
    try {
      const response = await apiClient.get<Question>(`/questions/${questionId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Submit answer to a question
   */
  async submitAnswer(
    questionId: string,
    data: SubmitAnswerRequest
  ): Promise<AnswerResponse> {
    try {
      const response = await apiClient.post<AnswerResponse>(
        `/questions/${questionId}/answer`,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Bookmark a question
   */
  async bookmarkQuestion(questionId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>(
        `/questions/${questionId}/bookmark`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Remove bookmark from a question
   */
  async removeBookmark(questionId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(
        `/questions/${questionId}/bookmark`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get all topics
   */
  async getTopics(): Promise<Topic[]> {
    try {
      const response = await apiClient.get<Topic[]>('/topics');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get single topic by ID
   */
  async getTopic(topicId: string): Promise<Topic> {
    try {
      const response = await apiClient.get<Topic>(`/topics/${topicId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new QuestionService();