import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Question, QuestionFilters, Topic } from '../../../api/types';

// Helper functions
function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'easy': return 'bg-green-100 text-green-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'hard': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getTypeLabel(type: string): string {
  switch (type) {
    case 'multiple_choice_single': return 'Single Choice';
    case 'multiple_choice_multi': return 'Multi Choice';
    case 'true_false': return 'True/False';
    default: return type;
  }
}

interface QuestionsTableProps {
  questions: Question[];
  total: number;
  page: number;
  pageSize: number;
  filters: QuestionFilters;
  topics: Topic[];
  onFilterChange: (filters: QuestionFilters) => void;
  onPageChange: (page: number) => void;
  onToggleActive: (id: string, isActive: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onBulkOperation: (operation: 'activate' | 'deactivate' | 'delete', ids: string[]) => Promise<void>;
  isLoading?: boolean;
}

export default function QuestionsTable({
  questions,
  total,
  page,
  pageSize,
  filters,
  topics,
  onFilterChange,
  onPageChange,
  onToggleActive,
  onDelete,
  onBulkOperation,
  isLoading = false,
}: QuestionsTableProps) {
  const navigate = useNavigate();
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState<'activate' | 'deactivate' | 'delete' | null>(null);

  const totalPages = Math.ceil(total / pageSize);

  const handleSelectQuestion = (id: string) => {
    setSelectedQuestions(prev =>
      prev.includes(id) ? prev.filter(qid => qid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedQuestions.length === questions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(questions.map(q => q.id));
    }
  };

  const handleFilterChange = (field: keyof QuestionFilters, value: any) => {
    onFilterChange({ ...filters, [field]: value, page: 1 });
  };

  const clearFilters = () => {
    onFilterChange({
      q: '',
      topic_id: undefined,
      sub_topic_id: undefined,
      province: undefined,
      question_type: undefined,
      difficulty: undefined,
      is_active: undefined,
      page: 1,
      page_size: pageSize,
    });
  };

  const handleDelete = async (id: string) => {
    await onDelete(id);
    setShowDeleteConfirm(null);
  };

  const handleBulkOperation = async () => {
    if (!showBulkConfirm) return;
    await onBulkOperation(showBulkConfirm, selectedQuestions);
    setSelectedQuestions([]);
    setShowBulkConfirm(null);
  };


  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                value={filters.q || ''}
                onChange={(e) => handleFilterChange('q', e.target.value)}
                placeholder="Search questions..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Topic Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
            <select
              value={filters.topic_id || ''}
              onChange={(e) => handleFilterChange('topic_id', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Topics</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>

          {/* Question Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filters.question_type || ''}
              onChange={(e) => handleFilterChange('question_type', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="multiple_choice_single">Single Choice</option>
              <option value="multiple_choice_multi">Multi Choice</option>
              <option value="true_false">True/False</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
            <select
              value={filters.difficulty || ''}
              onChange={(e) => handleFilterChange('difficulty', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Second row of filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.is_active === undefined ? '' : filters.is_active ? 'active' : 'inactive'}
              onChange={(e) => 
                handleFilterChange('is_active', e.target.value === '' ? undefined : e.target.value === 'active')
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Province Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
            <input
              type="text"
              value={filters.province || ''}
              onChange={(e) => handleFilterChange('province', e.target.value || undefined)}
              placeholder="e.g., NL, ON"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedQuestions.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm text-blue-800">
            {selectedQuestions.length} question(s) selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setShowBulkConfirm('activate')}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
            >
              Activate
            </button>
            <button
              onClick={() => setShowBulkConfirm('deactivate')}
              className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors"
            >
              Deactivate
            </button>
            <button
              onClick={() => setShowBulkConfirm('delete')}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left w-12">
                      <input
                        type="checkbox"
                        checked={selectedQuestions.length === questions.length && questions.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Question
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Topic
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Difficulty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Active
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {questions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <i className="ri-question-line text-4xl text-gray-400 mb-2"></i>
                        <p className="text-gray-600">No questions found</p>
                        <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or create a new question</p>
                      </td>
                    </tr>
                  ) : (
                    questions.map((question) => (
                      <tr key={question.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedQuestions.includes(question.id)}
                            onChange={() => handleSelectQuestion(question.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-md">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {question.content.substring(0, 100)}
                              {question.content.length > 100 ? '...' : ''}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {question.options.length} options • Updated {new Date(question.updated_at).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{question.topic_name || question.topic?.name || 'N/A'}</div>
                          {question.sub_topic_name && (
                            <div className="text-xs text-gray-500">{question.sub_topic_name}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">
                            {getTypeLabel(question.question_type)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(question.difficulty)}`}>
                            {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => onToggleActive(question.id, !question.is_active)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              question.is_active ? 'bg-green-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                question.is_active ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => navigate(`/admin/questions/edit/${question.id}`)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              title="Edit"
                            >
                              <i className="ri-edit-line text-lg"></i>
                            </button>
                            <button
                              onClick={() => navigate(`/admin/questions/new?duplicate=${question.id}`)}
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                              title="Duplicate"
                            >
                              <i className="ri-file-copy-line text-lg"></i>
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(question.id)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                              title="Delete"
                            >
                              <i className="ri-delete-bin-line text-lg"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t">
                <div className="text-sm text-gray-700">
                  Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        className={`px-3 py-1 border rounded text-sm ${
                          page === pageNum
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this question? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Operation Confirmation Modal */}
      {showBulkConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Bulk Operation</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to {showBulkConfirm} {selectedQuestions.length} question(s)?
              {showBulkConfirm === 'delete' && ' This action cannot be undone.'}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowBulkConfirm(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkOperation}
                className={`px-4 py-2 rounded-lg text-white ${
                  showBulkConfirm === 'delete' 
                    ? 'bg-red-600 hover:bg-red-700'
                    : showBulkConfirm === 'activate'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}