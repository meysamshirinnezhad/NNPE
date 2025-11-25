import apiClient, { handleApiError } from '../client';
import type {
  Question,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  ListQuestionsResponse,
  QuestionFilters,
  BulkOperationRequest,
  Topic,
  SubTopic,
} from '../types';

class AdminQuestionsService {
  /**
   * List all questions with filters and pagination (admin only)
   */
  async listQuestions(filters?: QuestionFilters): Promise<ListQuestionsResponse> {
    try {
      const response = await apiClient.get<ListQuestionsResponse>('/admin/questions', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get a single question by ID (admin only)
   */
  async getQuestion(id: string): Promise<Question> {
    try {
      const response = await apiClient.get<Question>(`/admin/questions/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create a new question (admin only)
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
   * Update an existing question (admin only)
   */
  async updateQuestion(id: string, data: UpdateQuestionRequest): Promise<Question> {
    try {
      const response = await apiClient.put<Question>(`/admin/questions/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete a question (admin only)
   */
  async deleteQuestion(id: string): Promise<void> {
    try {
      await apiClient.delete(`/admin/questions/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Perform bulk operations on questions (admin only)
   */
  async bulkOperation(data: BulkOperationRequest): Promise<{ message: string; count: number }> {
    try {
      const response = await apiClient.post<{ message: string; count: number }>(
        '/admin/questions/bulk',
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get all topics for question creation/editing
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
   * Get a topic with its subtopics
   */
  async getTopicWithSubtopics(topicId: string): Promise<{ topic: Topic; sub_topics: SubTopic[] }> {
    try {
      const response = await apiClient.get<{ topic: Topic; sub_topics: SubTopic[] }>(
        `/topics/${topicId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Validate question data before submission
   */
  validateQuestionData(data: CreateQuestionRequest | UpdateQuestionRequest): string | null {
    const req = data as CreateQuestionRequest;
    
    // Check content length
    if (req.content && req.content.length < 10) {
      return 'Question content must be at least 10 characters';
    }

    // Check options
    if (req.options && req.options.length < 2) {
      return 'At least 2 options are required';
    }

    if (req.options) {
      const correctCount = req.options.filter(opt => opt.is_correct).length;
      
      if (correctCount === 0) {
        return 'At least one option must be marked as correct';
      }

      if (req.question_type === 'multiple_choice_single' && correctCount !== 1) {
        return 'Single choice questions must have exactly one correct answer';
      }

      if (req.question_type === 'true_false' && req.options.length !== 2) {
        return 'True/False questions must have exactly 2 options';
      }

      // Check for empty option text
      const emptyOptions = req.options.filter(opt => !opt.option_text || opt.option_text.trim() === '');
      if (emptyOptions.length > 0) {
        return 'All options must have text';
      }
    }

    return null;
  }
}

export default new AdminQuestionsService();