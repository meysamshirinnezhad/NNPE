import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../../components/feature/Header';
import Button from '../../../components/base/Button';
import Card from '../../../components/base/Card';
import LoadingSpinner from '../../../components/effects/LoadingSpinner';
import { testService } from '../../../api';
import type { PracticeTest, Question } from '../../../api/types';

export default function PracticeTestTake() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  
  const [test, setTest] = useState<PracticeTest | null>(null);
  const [currentPosition, setCurrentPosition] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [position: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answerSubmitting, setAnswerSubmitting] = useState<{ [position: number]: boolean }>({});
  const [pendingSync, setPendingSync] = useState<{ [position: number]: string }>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [error, setError] = useState('');

  // Load test metadata and restore state
  useEffect(() => {
    const loadTest = async () => {
      if (!testId) return;
      
      try {
        setLoading(true);
        const testData = await testService.getTest(testId);
        setTest(testData);
        
        // Timer source of truth: Calculate from server timestamps
        const startTime = new Date(testData.started_at).getTime();
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        const totalSeconds = testData.time_limit_minutes * 60;
        const remaining = Math.max(0, totalSeconds - elapsedSeconds);
        setTimeRemaining(remaining);
        
        // Load answers from server truth (survives page refresh)
        if (testData.questions) {
          const answersMap: { [position: number]: string } = {};
          testData.questions.forEach(tq => {
            if (tq.answer_id) {
              answersMap[tq.position] = tq.answer_id;
            }
          });
          setAnswers(answersMap);
        }
        
        // Restore position from sessionStorage if available
        const savedPosition = sessionStorage.getItem(`test_${testId}_position`);
        if (savedPosition) {
          const pos = parseInt(savedPosition, 10);
          if (pos >= 1 && pos <= testData.total_questions) {
            setCurrentPosition(pos);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load test');
      } finally {
        setLoading(false);
      }
    };

    loadTest();
  }, [testId]);
  
  // Persist current position to sessionStorage
  useEffect(() => {
    if (testId && currentPosition > 0) {
      sessionStorage.setItem(`test_${testId}_position`, currentPosition.toString());
    }
  }, [testId, currentPosition]);
  
  // Cleanup sessionStorage on unmount (test completion)
  useEffect(() => {
    return () => {
      if (testId && test?.status === 'completed') {
        sessionStorage.removeItem(`test_${testId}_position`);
      }
    };
  }, [testId, test?.status]);

  // Load current question
  useEffect(() => {
    const loadQuestion = async () => {
      if (!test?.questions) return;
      
      const questionData = test.questions.find(q => q.position === currentPosition);
      if (questionData?.question) {
        setCurrentQuestion(questionData.question);
        setSelectedAnswer(answers[currentPosition] || null);
      }
    };

    loadQuestion();
  }, [currentPosition, test, answers]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && test) {
      handleSubmitTest();
    }
  }, [timeRemaining, test]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = async (optionId: string) => {
    if (!testId || !currentQuestion || submitting || answerSubmitting[currentPosition]) return;
    
    // Double-click protection: set submitting flag for this position
    setAnswerSubmitting(prev => ({ ...prev, [currentPosition]: true }));
    setSelectedAnswer(optionId);
    setAnswers(prev => ({ ...prev, [currentPosition]: optionId }));
    
    // Submit answer to backend with retry logic
    try {
      await testService.submitTestAnswer(testId, currentPosition, {
        selected_option_id: optionId,
        time_spent_seconds: 30
      });
      
      // Remove from pending sync on success
      setPendingSync(prev => {
        const updated = { ...prev };
        delete updated[currentPosition];
        return updated;
      });
    } catch (err) {
      console.error('Failed to submit answer:', err);
      // Mark as pending sync for retry
      setPendingSync(prev => ({ ...prev, [currentPosition]: optionId }));
    } finally {
      setAnswerSubmitting(prev => ({ ...prev, [currentPosition]: false }));
    }
  };
  
  // Retry pending submissions before completing test
  const retryPendingSubmissions = async (): Promise<boolean> => {
    if (!testId || Object.keys(pendingSync).length === 0) return true;
    
    const retries: Promise<void>[] = [];
    for (const [position, optionId] of Object.entries(pendingSync)) {
      retries.push(
        testService.submitTestAnswer(testId, parseInt(position), {
          selected_option_id: optionId,
          time_spent_seconds: 30
        }).then(() => {
          setPendingSync(prev => {
            const updated = { ...prev };
            delete updated[parseInt(position)];
            return updated;
          });
        }).catch(err => {
          console.error(`Failed to sync position ${position}:`, err);
          throw err;
        })
      );
    }
    
    try {
      await Promise.all(retries);
      return true;
    } catch {
      return false;
    }
  };

  const handleNextQuestion = () => {
    if (!test) return;
    if (currentPosition < test.total_questions) {
      setCurrentPosition(currentPosition + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentPosition > 1) {
      setCurrentPosition(currentPosition - 1);
    }
  };

  const handleQuestionNavigation = (position: number) => {
    setCurrentPosition(position);
  };

  const handleSubmitTest = async () => {
    if (!testId || submitting) return;
    
    setSubmitting(true);
    setShowSubmitModal(false);
    
    try {
      // Retry any pending syncs first
      const syncSuccess = await retryPendingSubmissions();
      if (!syncSuccess) {
        throw new Error('Some answers failed to sync. Please check your connection and try again.');
      }
      
      await testService.completeTest(testId);
      
      // Clear sessionStorage on successful completion
      sessionStorage.removeItem(`test_${testId}_position`);
      
      // Navigate to results page (not review)
      navigate(`/test/${testId}/results`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit test');
      setSubmitting(false);
      setShowSubmitModal(true); // Reopen modal to retry
    }
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error || !test || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8 pt-24">
          <Card className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Test Not Found'}
            </h2>
            <p className="text-gray-600 mb-6">
              {error ? 'Please try again later.' : "The test you're looking for doesn't exist."}
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Test Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {test.test_type === 'full_exam' ? 'Full Mock Exam' :
                 test.test_type === 'topic_specific' ? 'Topic Practice' : 'Practice Test'}
              </h1>
              <span className="text-gray-500">
                Question {currentPosition} of {test.total_questions}
              </span>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <i className="ri-check-line text-green-600"></i>
                <span className="text-sm text-gray-600">
                  {getAnsweredCount()}/{test.total_questions} answered
                </span>
                {Object.keys(pendingSync).length > 0 && (
                  <span className="text-xs text-orange-600 ml-2">
                    ({Object.keys(pendingSync).length} pending sync)
                  </span>
                )}
              </div>
              
              <div className={`flex items-center space-x-2 ${
                timeRemaining < 600 ? 'text-red-600' : 'text-gray-600'
              }`}>
                <i className="ri-time-line"></i>
                <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
              </div>
              
              <Button
                variant="secondary"
                onClick={() => setShowSubmitModal(true)}
                disabled={submitting}
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                Submit Test
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-32">
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Question Navigator</h3>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: test.total_questions }, (_, i) => i + 1).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => handleQuestionNavigation(pos)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        pos === currentPosition
                          ? 'bg-blue-600 text-white'
                          : answers[pos]
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
                
                <div className="mt-6 space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-600 rounded"></div>
                    <span className="text-gray-600">Current</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                    <span className="text-gray-600">Answered</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-100 rounded"></div>
                    <span className="text-gray-600">Not answered</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Question Content */}
          <div className="lg:col-span-3">
            <Card>
              <div className="p-8">
                {/* Question Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    {currentQuestion.topic && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {currentQuestion.topic.name}
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentQuestion.difficulty)}`}>
                      {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
                    </span>
                  </div>
                  
                  <span className="text-gray-500 font-medium">
                    Question {currentPosition}
                  </span>
                </div>

                {/* Question Text */}
                <div className="mb-8">
                  <p className="text-lg text-gray-800 leading-relaxed">
                    {currentQuestion.content}
                  </p>
                </div>

                {/* Answer Options */}
                <div className="space-y-4 mb-8">
                  {currentQuestion.options.map((option) => (
                    <div
                      key={option.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedAnswer === option.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => handleAnswerSelect(option.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedAnswer === option.id
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedAnswer === option.id && (
                            <i className="ri-check-line text-white text-sm"></i>
                          )}
                        </div>
                        <span className="text-gray-800 font-medium">
                          {String.fromCharCode(64 + option.position)}. {option.option_text}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                  <Button
                    variant="secondary"
                    onClick={handlePreviousQuestion}
                    disabled={currentPosition === 1}
                    className="flex items-center space-x-2"
                  >
                    <i className="ri-arrow-left-line"></i>
                    <span>Previous</span>
                  </Button>
                  
                  {currentPosition === test.total_questions ? (
                    <Button
                      onClick={() => setShowSubmitModal(true)}
                      disabled={submitting}
                      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                    >
                      <span>Submit Test</span>
                      <i className="ri-check-line"></i>
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNextQuestion}
                      className="flex items-center space-x-2"
                    >
                      <span>Next</span>
                      <i className="ri-arrow-right-line"></i>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Test?</h3>
              <p className="text-gray-600 mb-4">
                You have answered {getAnsweredCount()} out of {test.total_questions} questions.
              </p>
              {Object.keys(pendingSync).length > 0 && (
                <p className="text-orange-600 text-sm mb-4">
                  Warning: {Object.keys(pendingSync).length} answer(s) are pending sync.
                  We'll retry before submitting.
                </p>
              )}
              <p className="text-gray-600 mb-6">
                Are you sure you want to submit your test?
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowSubmitModal(false)}
                  disabled={submitting}
                  className="flex-1"
                >
                  Continue Test
                </Button>
                <Button
                  onClick={handleSubmitTest}
                  disabled={submitting}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {submitting ? 'Submitting...' : 'Submit Test'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
