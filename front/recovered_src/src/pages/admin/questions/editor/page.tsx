import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Header from '../../../../components/feature/Header';
import LoadingSpinner from '../../../../components/effects/LoadingSpinner';
import QuestionForm from '../../../../components/admin/questions/QuestionForm';
import adminQuestionsService from '../../../../api/services/admin.questions.service';
import type { Question, CreateQuestionRequest, UpdateQuestionRequest } from '../../../../api/types';

export default function AdminQuestionEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const duplicateId = searchParams.get('duplicate');
  
  const [question, setQuestion] = useState<Question | undefined>(undefined);
  const [loading, setLoading] = useState(!!id || !!duplicateId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEditMode = !!id;
  const isDuplicateMode = !!duplicateId;

  useEffect(() => {
    if (id) {
      loadQuestion(id);
    } else if (duplicateId) {
      loadQuestionForDuplicate(duplicateId);
    } else {
      setLoading(false);
    }
  }, [id, duplicateId]);

  const loadQuestion = async (questionId: string) => {
    try {
      const data = await adminQuestionsService.getQuestion(questionId);
      setQuestion(data);
      setError('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load question';
      setError(`${errorMessage}. This question may have invalid data format. Try creating a new question instead.`);
      console.error('Error loading question:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestionForDuplicate = async (questionId: string) => {
    try {
      const data = await adminQuestionsService.getQuestion(questionId);
      // Clear ID fields for duplication
      const duplicatedQuestion: Question = {
        ...data,
        id: '', // Clear ID so it's treated as new
        content: `${data.content} (Copy)`,
        created_at: '',
        updated_at: '',
        options: data.options.map(opt => ({
          ...opt,
          id: '', // Clear option IDs
        })),
      };
      setQuestion(duplicatedQuestion);
      setError('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load question for duplication';
      setError(`${errorMessage}. This question may have invalid data. Try creating a new question instead.`);
      console.error('Error loading question for duplication:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: CreateQuestionRequest | UpdateQuestionRequest) => {
    setSaving(true);
    setError('');
    
    try {
      if (isEditMode && id) {
        // Update existing question
        await adminQuestionsService.updateQuestion(id, data as UpdateQuestionRequest);
      } else {
        // Create new question (including duplicates)
        await adminQuestionsService.createQuestion(data as CreateQuestionRequest);
      }
      
      // Navigate back to questions list
      navigate('/admin/questions', { 
        state: { 
          message: isEditMode ? 'Question updated successfully' : 'Question created successfully' 
        } 
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save question');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/questions');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-96">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  const getPageTitle = () => {
    if (isDuplicateMode) return 'Duplicate Question';
    if (isEditMode) return 'Edit Question';
    return 'Create New Question';
  };

  const getPageDescription = () => {
    if (isDuplicateMode) return 'Create a new question based on an existing one';
    if (isEditMode) return 'Update question details and answer options';
    return 'Add a new question to the question bank';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={handleCancel}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <i className="ri-arrow-left-line text-2xl"></i>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{getPageTitle()}</h1>
              <p className="text-gray-600 mt-1">{getPageDescription()}</p>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <button
              onClick={() => navigate('/admin')}
              className="hover:text-blue-600 transition-colors"
            >
              Admin
            </button>
            <i className="ri-arrow-right-s-line"></i>
            <button
              onClick={() => navigate('/admin/questions')}
              className="hover:text-blue-600 transition-colors"
            >
              Questions
            </button>
            <i className="ri-arrow-right-s-line"></i>
            <span className="text-gray-900">{isEditMode ? 'Edit' : 'New'}</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <i className="ri-error-warning-line text-red-600 text-xl mr-3"></i>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Question Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <QuestionForm
            question={isDuplicateMode ? question : isEditMode ? question : undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={saving}
          />
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <i className="ri-information-line text-blue-600 text-xl mt-0.5"></i>
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Tips for Creating Questions</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Write clear, unambiguous questions that test specific knowledge</li>
                <li>• Ensure all answer options are plausible to avoid easy elimination</li>
                <li>• Provide detailed explanations to help users learn from mistakes</li>
                <li>• Include reference sources for users who want to study further</li>
                <li>• Mark questions as inactive to hide them from users temporarily</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
