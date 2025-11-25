import { useState, useEffect } from 'react';
import type { Topic, SubTopic, CreateQuestionRequest, UpdateQuestionRequest, Question } from '../../../api/types';
import adminQuestionsService from '../../../api/services/admin.questions.service';

interface QuestionFormProps {
  question?: Question;
  onSubmit: (data: CreateQuestionRequest | UpdateQuestionRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface OptionInput {
  id?: string;
  option_text: string;
  is_correct: boolean;
  position: number;
}

export default function QuestionForm({ question, onSubmit, onCancel, isLoading = false }: QuestionFormProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subTopics, setSubTopics] = useState<SubTopic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  
  const [formData, setFormData] = useState({
    content: question?.content || '',
    question_type: question?.question_type || 'multiple_choice_single' as const,
    difficulty: question?.difficulty || 'medium' as const,
    topic_id: question?.topic_id || '',
    sub_topic_id: question?.sub_topic_id || '',
    province: question?.province || '',
    explanation: question?.explanation || '',
    reference_source: question?.reference_source || '',
    is_active: question?.is_active ?? true,
  });

  const [options, setOptions] = useState<OptionInput[]>(
    question?.options?.map((opt, idx) => ({
      id: opt.id,
      option_text: opt.option_text,
      is_correct: opt.is_correct,
      position: idx + 1,
    })) || [
      { option_text: '', is_correct: false, position: 1 },
      { option_text: '', is_correct: false, position: 2 },
    ]
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load topics on mount
  useEffect(() => {
    loadTopics();
  }, []);

  // Load subtopics when topic changes
  useEffect(() => {
    if (formData.topic_id) {
      loadSubTopics(formData.topic_id);
    } else {
      setSubTopics([]);
      setFormData(prev => ({ ...prev, sub_topic_id: '' }));
    }
  }, [formData.topic_id]);

  const loadTopics = async () => {
    try {
      const data = await adminQuestionsService.getTopics();
      setTopics(data);
    } catch (error) {
      console.error('Failed to load topics:', error);
    } finally {
      setLoadingTopics(false);
    }
  };

  const loadSubTopics = async (topicId: string) => {
    try {
      const data = await adminQuestionsService.getTopicWithSubtopics(topicId);
      setSubTopics(data.sub_topics || []);
    } catch (error) {
      console.error('Failed to load subtopics:', error);
      setSubTopics([]);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleOptionChange = (index: number, field: keyof OptionInput, value: any) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
    setErrors(prev => ({ ...prev, [`option_${index}`]: '' }));
  };

  const handleCorrectChange = (index: number) => {
    const newOptions = [...options];
    
    if (formData.question_type === 'multiple_choice_single') {
      // Single choice: uncheck all others
      newOptions.forEach((opt, idx) => {
        opt.is_correct = idx === index;
      });
    } else {
      // Multi choice: toggle this one
      newOptions[index].is_correct = !newOptions[index].is_correct;
    }
    
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([
      ...options,
      { option_text: '', is_correct: false, position: options.length + 1 },
    ]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      return; // Must have at least 2 options
    }
    const newOptions = options.filter((_, idx) => idx !== index);
    // Update positions
    newOptions.forEach((opt, idx) => {
      opt.position = idx + 1;
    });
    setOptions(newOptions);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.content || formData.content.trim().length < 10) {
      newErrors.content = 'Question content must be at least 10 characters';
    }

    if (!formData.topic_id) {
      newErrors.topic_id = 'Please select a topic';
    }

    if (formData.question_type === 'true_false' && options.length !== 2) {
      newErrors.options = 'True/False questions must have exactly 2 options';
    }

    const correctCount = options.filter(opt => opt.is_correct).length;
    if (correctCount === 0) {
      newErrors.options = 'At least one option must be marked as correct';
    }

    if (formData.question_type === 'multiple_choice_single' && correctCount !== 1) {
      newErrors.options = 'Single choice questions must have exactly one correct answer';
    }

    options.forEach((opt, idx) => {
      if (!opt.option_text || opt.option_text.trim() === '') {
        newErrors[`option_${idx}`] = 'Option text is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    const requestData: any = {
      content: formData.content,
      question_type: formData.question_type,
      difficulty: formData.difficulty,
      topic_id: formData.topic_id,
      sub_topic_id: formData.sub_topic_id || undefined,
      province: formData.province || undefined,
      explanation: formData.explanation,
      reference_source: formData.reference_source,
      is_active: formData.is_active,
      options: options.map(opt => ({
        id: opt.id,
        option_text: opt.option_text,
        is_correct: opt.is_correct,
        position: opt.position,
      })),
    };

    await onSubmit(requestData);
  };

  if (loadingTopics) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Question Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Content *
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => handleInputChange('content', e.target.value)}
          rows={4}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.content ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter the question text..."
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content}</p>
        )}
      </div>

      {/* Question Type and Difficulty */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Type *
          </label>
          <select
            value={formData.question_type}
            onChange={(e) => handleInputChange('question_type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="multiple_choice_single">Multiple Choice (Single Answer)</option>
            <option value="multiple_choice_multi">Multiple Choice (Multiple Answers)</option>
            <option value="true_false">True/False</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty *
          </label>
          <select
            value={formData.difficulty}
            onChange={(e) => handleInputChange('difficulty', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Topic and SubTopic */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Topic *
          </label>
          <select
            value={formData.topic_id}
            onChange={(e) => handleInputChange('topic_id', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.topic_id ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select a topic</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
          {errors.topic_id && (
            <p className="mt-1 text-sm text-red-600">{errors.topic_id}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SubTopic (Optional)
          </label>
          <select
            value={formData.sub_topic_id}
            onChange={(e) => handleInputChange('sub_topic_id', e.target.value)}
            disabled={!formData.topic_id || subTopics.length === 0}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          >
            <option value="">Select a subtopic (optional)</option>
            {subTopics.map((subtopic) => (
              <option key={subtopic.id} value={subtopic.id}>
                {subtopic.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Province */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Province (Optional)
        </label>
        <input
          type="text"
          value={formData.province}
          onChange={(e) => handleInputChange('province', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., NL, ON, BC"
        />
      </div>

      {/* Answer Options */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Answer Options *
          </label>
          {formData.question_type !== 'true_false' && (
            <button
              type="button"
              onClick={addOption}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              + Add Option
            </button>
          )}
        </div>
        
        {errors.options && (
          <p className="mb-2 text-sm text-red-600">{errors.options}</p>
        )}

        <div className="space-y-3">
          {options.map((option, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex items-center pt-2">
                {formData.question_type === 'multiple_choice_single' ? (
                  <input
                    type="radio"
                    checked={option.is_correct}
                    onChange={() => handleCorrectChange(index)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                ) : (
                  <input
                    type="checkbox"
                    checked={option.is_correct}
                    onChange={() => handleCorrectChange(index)}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                )}
              </div>
              
              <div className="flex-1">
                <textarea
                  value={option.option_text}
                  onChange={(e) => handleOptionChange(index, 'option_text', e.target.value)}
                  rows={2}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors[`option_${index}`] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={`Option ${index + 1}`}
                />
                {errors[`option_${index}`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`option_${index}`]}</p>
                )}
              </div>

              {options.length > 2 && formData.question_type !== 'true_false' && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="text-red-600 hover:text-red-700 pt-2"
                >
                  <i className="ri-delete-bin-line text-xl"></i>
                </button>
              )}
            </div>
          ))}
        </div>
        
        <p className="mt-2 text-sm text-gray-500">
          {formData.question_type === 'multiple_choice_single' 
            ? 'Select one correct answer'
            : 'Select one or more correct answers'}
        </p>
      </div>

      {/* Explanation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Explanation (Optional)
        </label>
        <textarea
          value={formData.explanation}
          onChange={(e) => handleInputChange('explanation', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Provide an explanation for the correct answer..."
        />
      </div>

      {/* Reference Source */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reference Source (Optional)
        </label>
        <input
          type="text"
          value={formData.reference_source}
          onChange={(e) => handleInputChange('reference_source', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., APEG-NL Handbook 2024, Chapter 3"
        />
      </div>

      {/* Is Active */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => handleInputChange('is_active', e.target.checked)}
          className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
        />
        <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
          Active (visible to users)
        </label>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}
          {question ? 'Update Question' : 'Create Question'}
        </button>
      </div>
    </form>
  );
}