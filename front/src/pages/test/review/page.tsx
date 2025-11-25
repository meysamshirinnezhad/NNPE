
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../../components/feature/Header';
import Button from '../../../components/base/Button';
import Card from '../../../components/base/Card';
import LoadingSpinner from '../../../components/effects/LoadingSpinner';
import { testService } from '../../../api';
import type { PracticeTest } from '../../../api/types';

interface ReviewQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  userAnswer?: number;
  explanation: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  isCorrect: boolean;
}

interface TestReview {
  id: string;
  title: string;
  questions: ReviewQuestion[];
  score: number;
  completedAt: Date;
}

export default function TestReview() {
  const { testId } = useParams();
  const [searchParams] = useSearchParams();
  const actualTestId = testId || searchParams.get('id') || '';
  const navigate = useNavigate();
  const [review, setReview] = useState<TestReview | null>(null);
  const [, setApiTest] = useState<PracticeTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<'all' | 'correct' | 'incorrect'>('all');
  const [error, setError] = useState('');

  // Redirect to canonical URL if using query param
  useEffect(() => {
    if (!testId && searchParams.get('id')) {
      const qId = searchParams.get('id');
      navigate(`/test/${qId}/review`, { replace: true });
    }
  }, [testId, searchParams, navigate]);

  useEffect(() => {
    const fetchReview = async () => {
      if (!actualTestId) {
        setError('No test ID provided');
        setLoading(false);
        return;
      }

      try {
        const data = await testService.reviewTest(actualTestId);
        setApiTest(data);
        
        const mappedReview: TestReview = {
          id: data.id,
          title: `Practice Test - ${data.test_type}`,
          score: data.score,
          completedAt: new Date(data.completed_at || data.started_at),
          questions: (data.questions || []).map(q => {
            const difficulty = q.question?.difficulty || 'medium';
            return {
              id: q.id,
              question: q.question?.content || '',
              options: q.question?.options.map(opt => opt.option_text) || [],
              correctAnswer: q.question?.options.findIndex(opt => opt.is_correct) || 0,
              userAnswer: q.answer_id ? q.question?.options.findIndex(opt => opt.id === q.answer_id) : undefined,
              explanation: q.question?.explanation || '',
              topic: q.question?.topic?.name || 'Unknown',
              difficulty: (difficulty.charAt(0).toUpperCase() + difficulty.slice(1)) as 'Easy' | 'Medium' | 'Hard',
              isCorrect: q.is_correct || false
            };
          })
        };
        setReview(mappedReview);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load review');
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [actualTestId]);

  const toggleQuestionExpansion = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  const expandAll = () => {
    if (!review) return;
    setExpandedQuestions(new Set(review.questions.map(q => q.id)));
  };

  const collapseAll = () => {
    setExpandedQuestions(new Set());
  };

  const getFilteredQuestions = () => {
    if (!review) return [];
    switch (filterType) {
      case 'correct':
        return review.questions.filter(q => q.isCorrect);
      case 'incorrect':
        return review.questions.filter(q => !q.isCorrect);
      default:
        return review.questions;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" variant="engineering" />
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Review Not Found</h2>
            <p className="text-gray-600 mb-6">The test review you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/practice-tests')}>
              Back to Practice Tests
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const filteredQuestions = getFilteredQuestions();
  const correctCount = review.questions.filter(q => q.isCorrect).length;
  const incorrectCount = review.questions.length - correctCount;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <i className="ri-error-warning-line text-red-600 text-xl mr-3"></i>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Review</h1>
              <p className="text-gray-600">{review.title}</p>
              <p className="text-sm text-gray-500">
                Score: {review.score}% • Completed on {review.completedAt.toLocaleDateString()}
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => navigate(`/test/results?id=${review.id}`)}
              className="flex items-center space-x-2"
            >
              <i className="ri-arrow-left-line"></i>
              <span>Back to Results</span>
            </Button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="text-center">
              <div className="p-4">
                <div className="text-2xl font-bold text-gray-900">{review.questions.length}</div>
                <div className="text-sm text-gray-600">Total Questions</div>
              </div>
            </Card>
            <Card className="text-center">
              <div className="p-4">
                <div className="text-2xl font-bold text-green-600">{correctCount}</div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
            </Card>
            <Card className="text-center">
              <div className="p-4">
                <div className="text-2xl font-bold text-red-600">{incorrectCount}</div>
                <div className="text-sm text-gray-600">Incorrect</div>
              </div>
            </Card>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterType === 'all' ? 'primary' : 'secondary'}
                onClick={() => setFilterType('all')}
                size="sm"
              >
                All ({review.questions.length})
              </Button>
              <Button
                variant={filterType === 'correct' ? 'primary' : 'secondary'}
                onClick={() => setFilterType('correct')}
                size="sm"
                className={filterType === 'correct' ? '' : 'text-green-600'}
              >
                Correct ({correctCount})
              </Button>
              <Button
                variant={filterType === 'incorrect' ? 'primary' : 'secondary'}
                onClick={() => setFilterType('incorrect')}
                size="sm"
                className={filterType === 'incorrect' ? '' : 'text-red-600'}
              >
                Incorrect ({incorrectCount})
              </Button>
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" onClick={expandAll} size="sm">
                Expand All
              </Button>
              <Button variant="secondary" onClick={collapseAll} size="sm">
                Collapse All
              </Button>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {filteredQuestions.map((question, index) => (
            <Card key={question.id}>
              <div className="p-6">
                {/* Question Header */}
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleQuestionExpansion(question.id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      question.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      <i className={`${question.isCorrect ? 'ri-check-line' : 'ri-close-line'} text-sm`}></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Question {index + 1}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {question.topic}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                          question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {question.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <i className={`ri-arrow-${expandedQuestions.has(question.id) ? 'up' : 'down'}-s-line text-gray-400`}></i>
                </div>

                {/* Question Content */}
                {expandedQuestions.has(question.id) && (
                  <div className="mt-6 space-y-6">
                    {/* Question Text */}
                    <div>
                      <p className="text-lg text-gray-800 leading-relaxed">
                        {question.question}
                      </p>
                    </div>

                    {/* Answer Options */}
                    <div className="space-y-3">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`p-3 border-2 rounded-lg ${
                            optionIndex === question.correctAnswer
                              ? 'border-green-500 bg-green-50'
                              : question.userAnswer === optionIndex && optionIndex !== question.correctAnswer
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              optionIndex === question.correctAnswer
                                ? 'border-green-500 bg-green-500'
                                : question.userAnswer === optionIndex && optionIndex !== question.correctAnswer
                                  ? 'border-red-500 bg-red-500'
                                  : 'border-gray-300'
                            }`}>
                              {optionIndex === question.correctAnswer && (
                                <i className="ri-check-line text-white text-sm"></i>
                              )}
                              {question.userAnswer === optionIndex && optionIndex !== question.correctAnswer && (
                                <i className="ri-close-line text-white text-sm"></i>
                              )}
                            </div>
                            <span className="text-gray-800">
                              {String.fromCharCode(65 + optionIndex)}. {option}
                            </span>
                            {optionIndex === question.correctAnswer && (
                              <span className="text-green-600 text-sm font-medium">Correct Answer</span>
                            )}
                            {question.userAnswer === optionIndex && optionIndex !== question.correctAnswer && (
                              <span className="text-red-600 text-sm font-medium">Your Answer</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Explanation */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2 flex items-center space-x-2">
                        <i className="ri-lightbulb-line"></i>
                        <span>Explanation</span>
                      </h4>
                      <p className="text-blue-800 leading-relaxed">
                        {question.explanation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button
            onClick={() => navigate('/practice-test/new')}
            className="flex items-center space-x-2"
          >
            <i className="ri-refresh-line"></i>
            <span>Take Another Test</span>
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => navigate('/practice')}
            className="flex items-center space-x-2"
          >
            <i className="ri-book-open-line"></i>
            <span>Practice Questions</span>
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2"
          >
            <i className="ri-dashboard-line"></i>
            <span>Back to Dashboard</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
