import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/feature/Header';
import QuestionsTable from '../../../components/admin/questions/QuestionsTable';
import adminQuestionsService from '../../../api/services/admin.questions.service';
import type { Question, QuestionFilters, Topic } from '../../../api/types';

export default function AdminQuestions() {
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [filters, setFilters] = useState<QuestionFilters>({
    q: '',
    topic_id: undefined,
    sub_topic_id: undefined,
    province: undefined,
    question_type: undefined,
    difficulty: undefined,
    is_active: undefined,
    page: 1,
    page_size: 20,
  });

  useEffect(() => {
    loadTopics();
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [filters]);

  const loadTopics = async () => {
    try {
      const data = await adminQuestionsService.getTopics();
      setTopics(data);
    } catch (err) {
      console.error('Failed to load topics:', err);
    }
  };

  const loadQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminQuestionsService.listQuestions(filters);
      setQuestions(response.items);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: QuestionFilters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await adminQuestionsService.updateQuestion(id, { is_active: isActive });
      setSuccessMessage(`Question ${isActive ? 'activated' : 'deactivated'} successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Update local state
      setQuestions(prev =>
        prev.map(q => (q.id === id ? { ...q, is_active: isActive } : q))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update question');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminQuestionsService.deleteQuestion(id);
      setSuccessMessage('Question deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Reload questions
      loadQuestions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete question');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleBulkOperation = async (
    operation: 'activate' | 'deactivate' | 'delete',
    ids: string[]
  ) => {
    try {
      await adminQuestionsService.bulkOperation({ ids, op: operation });
      
      let message = '';
      switch (operation) {
        case 'activate':
          message = `${ids.length} question(s) activated successfully`;
          break;
        case 'deactivate':
          message = `${ids.length} question(s) deactivated successfully`;
          break;
        case 'delete':
          message = `${ids.length} question(s) deleted successfully`;
          break;
      }
      
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Reload questions
      loadQuestions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform bulk operation');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleExportCSV = () => {
    // Generate CSV from current questions
    const csvContent = [
      ['ID', 'Content', 'Type', 'Difficulty', 'Topic', 'SubTopic', 'Province', 'Active', 'Options Count'].join(','),
      ...questions.map(q => [
        q.id,
        `"${q.content.replace(/"/g, '""')}"`,
        q.question_type,
        q.difficulty,
        `"${q.topic_name || ''}"`,
        `"${q.sub_topic_name || ''}"`,
        q.province || '',
        q.is_active,
        q.options.length,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `questions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <i className="ri-checkbox-circle-line text-green-600 text-xl mr-3"></i>
              <p className="text-green-800">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <i className="ri-error-warning-line text-red-600 text-xl mr-3"></i>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Question Management</h1>
              <p className="text-gray-600">
                Manage the question bank and content ({total} total questions)
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleExportCSV}
                disabled={questions.length === 0}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <i className="ri-download-line"></i>
                Export CSV
              </button>
              <button
                onClick={() => navigate('/admin/questions/new')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <i className="ri-add-line"></i>
                Add Question
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Questions</p>
                <p className="text-2xl font-bold text-gray-900">{total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="ri-question-line text-blue-600 text-2xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {questions.filter(q => q.is_active).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="ri-checkbox-circle-line text-green-600 text-2xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-gray-600">
                  {questions.filter(q => !q.is_active).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <i className="ri-close-circle-line text-gray-600 text-2xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Topics</p>
                <p className="text-2xl font-bold text-purple-600">{topics.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="ri-book-line text-purple-600 text-2xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Questions Table */}
        <QuestionsTable
          questions={questions}
          total={total}
          page={filters.page || 1}
          pageSize={filters.page_size || 20}
          filters={filters}
          topics={topics}
          onFilterChange={handleFilterChange}
          onPageChange={handlePageChange}
          onToggleActive={handleToggleActive}
          onDelete={handleDelete}
          onBulkOperation={handleBulkOperation}
          isLoading={loading}
        />
      </div>
    </div>
  );
}
