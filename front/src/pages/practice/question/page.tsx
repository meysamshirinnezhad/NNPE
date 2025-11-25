
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../../components/feature/Header';
import Button from '../../../components/base/Button';
import Card from '../../../components/base/Card';
import LoadingSpinner from '../../../components/effects/LoadingSpinner';
import { updateSEO } from '../../../utils/seo';
import { questionService } from '../../../api';
import type { Question } from '../../../api/types';

export default function QuestionReview() {
  const { questionId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [answerResult, setAnswerResult] = useState<any>(null);

  useEffect(() => {
    updateSEO({
      title: 'Question Review - NPPE Pro',
      description: 'Review NPPE exam question',
      keywords: 'question, review, NPPE',
      canonical: '/practice/question'
    });
  }, []);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const qId = questionId || searchParams.get('id');
        if (!qId) {
          setError('No question ID provided');
          setLoading(false);
          return;
        }
        
        const data = await questionService.getQuestion(qId);
        setQuestion(data);
        // Bookmark status would need to come from a separate endpoint or be added to Question type
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load question');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [questionId, searchParams]);

  const handleAnswerSelect = (optionId: string) => {
    if (!showExplanation) {
      setSelectedAnswer(optionId);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAnswer || !question) return;
    
    try {
      const result = await questionService.submitAnswer(question.id, {
        selected_option_id: selectedAnswer,
        time_spent_seconds: 60 // Could track actual time
      });
      setAnswerResult(result);
      setShowExplanation(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
    }
  };

  const handleBookmark = async () => {
    if (!question) return;
    
    try {
      if (isBookmarked) {
        await questionService.removeBookmark(question.id);
        setIsBookmarked(false);
      } else {
        await questionService.bookmarkQuestion(question.id);
        setIsBookmarked(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle bookmark');
    }
  };

  const handleNext = () => {
    navigate('/practice');
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8 pt-24">
          <Card className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <Button onClick={() => navigate('/practice')}>
              Back to Practice
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8 pt-24">
          <Card className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Question Not Found</h2>
            <p className="text-gray-600 mb-6">The question you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/practice')}>
              Back to Practice
            </Button>
          </Card>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8 pt-24">
        {/* Question Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="secondary"
              onClick={() => navigate('/practice')}
              className="flex items-center space-x-2"
            >
              <i className="ri-arrow-left-line"></i>
              <span>Back to Practice</span>
            </Button>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {question.topic?.name || 'Unknown Topic'}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
              </span>
            </div>
          </div>
          
          <Button
            variant="secondary"
            onClick={handleBookmark}
            className={`flex items-center space-x-2 ${isBookmarked ? 'text-blue-600 border-blue-600' : ''}`}
          >
            <i className={`${isBookmarked ? 'ri-bookmark-fill' : 'ri-bookmark-line'}`}></i>
            <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
          </Button>
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <div className="p-6">
            <h1 className="text-xl font-semibold text-gray-900 mb-6">
              Question {question.id.slice(0, 8)}
            </h1>
            
            <div className="mb-8">
              <p className="text-lg text-gray-800 leading-relaxed">
                {question.content}
              </p>
            </div>

            {/* Answer Options */}
            <div className="space-y-3 mb-6">
              {question.options.map((option) => {
                const isSelected = selectedAnswer === option.id;
                const isCorrect = option.is_correct;
                
                return (
                  <div
                    key={option.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? showExplanation
                          ? isCorrect
                            ? 'border-green-500 bg-green-50'
                            : 'border-red-500 bg-red-50'
                          : 'border-blue-500 bg-blue-50'
                        : showExplanation && isCorrect
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleAnswerSelect(option.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? showExplanation
                            ? isCorrect
                              ? 'border-green-500 bg-green-500'
                              : 'border-red-500 bg-red-500'
                            : 'border-blue-500 bg-blue-500'
                          : showExplanation && isCorrect
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-300'
                      }`}>
                        {(isSelected || (showExplanation && isCorrect)) && (
                          <i className={`text-white text-sm ${
                            showExplanation && isSelected && !isCorrect
                              ? 'ri-close-line'
                              : 'ri-check-line'
                          }`}></i>
                        )}
                      </div>
                      <span className="text-gray-800 font-medium">
                        {String.fromCharCode(65 + option.position)}. {option.option_text}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            {!showExplanation ? (
              <div className="flex justify-center">
                <Button
                  onClick={handleSubmit}
                  disabled={selectedAnswer === null}
                  className="px-8"
                >
                  Submit Answer
                </Button>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center space-x-2 ${
                    answerResult?.is_correct ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <i className={`${
                      answerResult?.is_correct ? 'ri-check-circle-fill' : 'ri-close-circle-fill'
                    } text-xl`}></i>
                    <span className="font-medium">
                      {answerResult?.is_correct ? 'Correct!' : 'Incorrect'}
                    </span>
                  </div>
                </div>
                <Button onClick={handleNext}>
                  Next Question
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Explanation */}
        {showExplanation && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <i className="ri-lightbulb-line text-yellow-500"></i>
                <span>Explanation</span>
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                {answerResult?.explanation || question.explanation}
              </p>
              <div className="flex items-center text-sm text-gray-600">
                <i className="ri-book-open-line mr-2"></i>
                <span className="font-medium">Reference: {question.reference_source}</span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
