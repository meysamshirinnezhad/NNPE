
import { useEffect, useState } from 'react';
import Header from '../../components/feature/Header';
import MobileNavigation from '../../components/feature/MobileNavigation';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import LoadingSpinner from '../../components/effects/LoadingSpinner';
import { updateSEO } from '../../utils/seo';
import { questionService } from '../../api';
import type { Question, Topic } from '../../api/types';

export default function Practice() {
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard' | 'all'>('all');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answerResult, setAnswerResult] = useState<any>(null);

  useEffect(() => {
    updateSEO({
      title: 'Practice Questions - NPPE Pro',
      description: 'Practice NPPE exam questions',
      keywords: 'practice, questions, NPPE',
      canonical: '/practice'
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [questionsData, topicsData] = await Promise.all([
          questionService.getQuestions({
            limit: 10,
            topic_id: selectedTopic !== 'all' ? selectedTopic : undefined,
            difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
            random: true
          }),
          questionService.getTopics()
        ]);
        setQuestions(questionsData.questions);
        setTopics(topicsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load questions');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedTopic, selectedDifficulty]);

  const currentQuestionData = questions[currentQuestion];

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswer(answerId);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !currentQuestionData) return;
    
    try {
      const result = await questionService.submitAnswer(currentQuestionData.id, {
        selected_option_id: selectedAnswer,
        time_spent_seconds: 30 // You could track actual time
      });
      setAnswerResult(result);
      setShowExplanation(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
    }
  };

  const handleNextQuestion = () => {
    setCurrentQuestion((prev) => (prev + 1) % questions.length);
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  const handlePreviousQuestion = () => {
    setCurrentQuestion((prev) => (prev - 1 + questions.length) % questions.length);
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  const toggleBookmark = async (questionId: string) => {
    try {
      if (bookmarkedQuestions.includes(questionId)) {
        await questionService.removeBookmark(questionId);
        setBookmarkedQuestions(prev => prev.filter(id => id !== questionId));
      } else {
        await questionService.bookmarkQuestion(questionId);
        setBookmarkedQuestions(prev => [...prev, questionId]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle bookmark');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="flex items-center justify-center h-96">
            <LoadingSpinner size="lg" />
          </div>
        </main>
        <MobileNavigation />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </main>
        <MobileNavigation />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <Card className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Questions Found</h2>
            <p className="text-gray-600 mb-6">Try adjusting your filters.</p>
          </Card>
        </main>
        <MobileNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Topic Filter */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Topics</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedTopic('all')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                    selectedTopic === 'all'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-sm font-medium">All Topics</span>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                    {questions.length}
                  </span>
                </button>
                {topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                      selectedTopic === topic.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-sm font-medium">{topic.name}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Difficulty Filter */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Difficulty</h3>
              <div className="space-y-2">
                {[
                  { id: 'all' as const, name: 'All Levels' },
                  { id: 'easy' as const, name: 'Easy' },
                  { id: 'medium' as const, name: 'Medium' },
                  { id: 'hard' as const, name: 'Hard' }
                ].map((difficulty) => (
                  <button
                    key={difficulty.id}
                    onClick={() => setSelectedDifficulty(difficulty.id)}
                    className={`w-full px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                      selectedDifficulty === difficulty.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-sm font-medium">{difficulty.name}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Progress Stats */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Questions Completed</span>
                    <span>234/500</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '47%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Accuracy Rate</span>
                    <span>78%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              {/* Question Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    Question {currentQuestion + 1} of {questions.length}
                  </span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getDifficultyColor(currentQuestionData.difficulty)}`}>
                    {currentQuestionData.difficulty.charAt(0).toUpperCase() + currentQuestionData.difficulty.slice(1)}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {currentQuestionData.topic?.name || 'Unknown'}
                  </span>
                </div>
                <button
                  onClick={() => toggleBookmark(currentQuestionData.id)}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    bookmarkedQuestions.includes(currentQuestionData.id)
                      ? 'text-yellow-600 bg-yellow-100'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <i className={`${bookmarkedQuestions.includes(currentQuestionData.id) ? 'ri-bookmark-fill' : 'ri-bookmark-line'} text-lg`}></i>
                </button>
              </div>

              {/* Question */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 leading-relaxed">
                  {currentQuestionData.content}
                </h2>

                {/* Answer Options */}
                <div className="space-y-3">
                  {currentQuestionData.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleAnswerSelect(option.id)}
                      disabled={showExplanation}
                      className={`w-full p-4 text-left border rounded-lg transition-all cursor-pointer ${
                        showExplanation
                          ? option.is_correct
                            ? 'border-green-500 bg-green-50 text-green-800'
                            : selectedAnswer === option.id && !option.is_correct
                            ? 'border-red-500 bg-red-50 text-red-800'
                            : 'border-gray-300 bg-gray-50 text-gray-600'
                          : selectedAnswer === option.id
                          ? 'border-blue-500 bg-blue-50 text-blue-800'
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center mr-3 text-sm font-medium">
                          {String.fromCharCode(65 + option.position)}
                        </span>
                        <span>{option.option_text}</span>
                        {showExplanation && option.is_correct && (
                          <i className="ri-check-circle-fill text-green-600 ml-auto text-xl"></i>
                        )}
                        {showExplanation && selectedAnswer === option.id && !option.is_correct && (
                          <i className="ri-close-circle-fill text-red-600 ml-auto text-xl"></i>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Explanation */}
              {showExplanation && (
                <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                    <i className="ri-lightbulb-line mr-2"></i>
                    Explanation
                  </h3>
                  <p className="text-blue-800 mb-4 leading-relaxed">
                    {answerResult?.explanation || currentQuestionData.explanation}
                  </p>
                  <div className="flex items-center text-sm text-blue-700">
                    <i className="ri-book-open-line mr-2"></i>
                    <span className="font-medium">Reference: {currentQuestionData.reference_source}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <Button
                  variant="secondary"
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestion === 0}
                >
                  <i className="ri-arrow-left-line mr-2"></i>
                  Previous
                </Button>

                <div className="flex space-x-3">
                  {!showExplanation ? (
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={!selectedAnswer}
                    >
                      Submit Answer
                    </Button>
                  ) : (
                    <Button onClick={handleNextQuestion}>
                      Next Question
                      <i className="ri-arrow-right-line ml-2"></i>
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <div className="mt-6 grid md:grid-cols-3 gap-4">
              <Card className="text-center">
                <i className="ri-file-text-line text-2xl text-blue-600 mb-2 block"></i>
                <h3 className="font-semibold text-gray-900 mb-1">Practice Test</h3>
                <p className="text-sm text-gray-600 mb-3">Take a full-length exam simulation</p>
                <Button variant="secondary" size="sm" className="w-full">
                  Start Test
                </Button>
              </Card>

              <Card className="text-center">
                <i className="ri-bookmark-line text-2xl text-blue-600 mb-2 block"></i>
                <h3 className="font-semibold text-gray-900 mb-1">Bookmarks</h3>
                <p className="text-sm text-gray-600 mb-3">Review your saved questions</p>
                <Button variant="secondary" size="sm" className="w-full">
                  View Bookmarks
                </Button>
              </Card>

              <Card className="text-center">
                <i className="ri-bar-chart-line text-2xl text-blue-600 mb-2 block"></i>
                <h3 className="font-semibold text-gray-900 mb-1">Analytics</h3>
                <p className="text-sm text-gray-600 mb-3">Track your progress and performance</p>
                <Button variant="secondary" size="sm" className="w-full">
                  View Stats
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <MobileNavigation />
    </div>
  );
}
