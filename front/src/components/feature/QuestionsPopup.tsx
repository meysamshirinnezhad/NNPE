import { useState } from 'react';
import Button from '../base/Button';
import Card from '../base/Card';

interface QuestionsPopupProps {
  isOpen: boolean;
  onSkip: () => void;
  onComplete: () => void;
}

interface Question {
  id: string;
  question: string;
  type: 'text' | 'radio' | 'select' | 'multiple';
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

const questions: Question[] = [
  {
    id: 'studyExperience',
    question: 'What is your current experience level with the NPPE exam?',
    type: 'radio',
    options: [
      'First-time test taker',
      'Previously attempted (failed)',
      'Returning to refresh knowledge',
      'Helping someone else prepare'
    ],
    required: true
  },
  {
    id: 'primaryChallenge',
    question: 'What do you find most challenging about NPPE preparation?',
    type: 'multiple',
    options: [
      'Time management during exam',
      'Complex calculations',
      'Engineering ethics questions',
      'Professional practice standards',
      'Staying motivated',
      'Finding quality study materials'
    ]
  },
  {
    id: 'studyMethod',
    question: 'What study method works best for you?',
    type: 'radio',
    options: [
      'Self-paced online learning',
      'Structured classroom setting',
      'Group study sessions',
      'One-on-one tutoring',
      'Reading and practice tests'
    ],
    required: true
  },
  {
    id: 'preferredTopics',
    question: 'Which engineering topics would you like to focus on more?',
    type: 'text',
    placeholder: 'e.g., Structural analysis, Electrical systems, Thermodynamics...'
  },
  {
    id: 'timeFrame',
    question: 'How long do you plan to study before taking the exam?',
    type: 'select',
    options: [
      '1-2 months',
      '3-4 months',
      '5-6 months',
      '7-12 months',
      'More than a year',
      'Unsure yet'
    ],
    required: true
  }
];

export default function QuestionsPopup({ isOpen, onSkip, onComplete }: QuestionsPopupProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  if (!isOpen) return null;

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleComplete = () => {
    // Store answers in localStorage for later processing
    localStorage.setItem('nppe_user_questions', JSON.stringify(answers));
    onComplete();
  };

  const handleSkip = () => {
    onSkip();
  };

  const isCurrentQuestionAnswered = () => {
    const currentQ = questions[currentQuestion];
    const answer = answers[currentQ.id];
    
    if (currentQ.type === 'multiple') {
      return answer && Array.isArray(answer) && answer.length > 0;
    }
    return answer && answer.toString().trim() !== '';
  };

  const renderQuestion = () => {
    const question = questions[currentQuestion];
    const answer = answers[question.id];

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-questionnaire-line text-blue-600 text-xl"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Quick Questions
          </h3>
          <p className="text-sm text-gray-600">
            Help us personalize your experience (you can skip this)
          </p>
        </div>

        <div>
          <div className="mb-4">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            {question.question}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </h4>

          {question.type === 'text' && (
            <textarea
              value={answer || ''}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              placeholder={question.placeholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
            />
          )}

          {question.type === 'radio' && (
            <div className="space-y-3">
              {question.options?.map((option) => (
                <label key={option} className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    checked={answer === option}
                    onChange={(e) => handleAnswer(question.id, e.target.value)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                    answer === option ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                  }`}>
                    {answer === option && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          )}

          {question.type === 'select' && (
            <select
              value={answer || ''}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select an option</option>
              {question.options?.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          )}

          {question.type === 'multiple' && (
            <div className="space-y-3">
              {question.options?.map((option) => (
                <label key={option} className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={Array.isArray(answer) && answer.includes(option)}
                    onChange={(e) => {
                      const currentAnswers = Array.isArray(answer) ? answer : [];
                      if (e.target.checked) {
                        handleAnswer(question.id, [...currentAnswers, option]);
                      } else {
                        handleAnswer(question.id, currentAnswers.filter((item: string) => item !== option));
                      }
                    }}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                    Array.isArray(answer) && answer.includes(option) 
                      ? 'border-blue-600 bg-blue-600' 
                      : 'border-gray-300'
                  }`}>
                    {Array.isArray(answer) && answer.includes(option) && (
                      <i className="ri-check-line text-white text-sm"></i>
                    )}
                  </div>
                  <span className="text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSummary = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-check-line text-green-600 text-xl"></i>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Thank You!
        </h3>
        <p className="text-sm text-gray-600">
          Your responses will help us provide a better experience
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
        <h4 className="font-medium text-gray-900 mb-3">Your responses:</h4>
        <div className="space-y-3 text-sm">
          {questions.map((question) => {
            const answer = answers[question.id];
            let displayAnswer = '';
            
            if (Array.isArray(answer)) {
              displayAnswer = answer.join(', ');
            } else if (answer) {
              displayAnswer = answer;
            } else {
              displayAnswer = 'Not answered';
            }

            return (
              <div key={question.id} className="border-b border-gray-200 pb-2">
                <div className="font-medium text-gray-700 mb-1">{question.question}</div>
                <div className="text-gray-600">{displayAnswer}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {!showSummary && renderQuestion()}
          {showSummary && renderSummary()}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <div className="flex space-x-3">
              {!showSummary && currentQuestion > 0 && (
                <Button variant="secondary" onClick={handlePrevious}>
                  <i className="ri-arrow-left-line mr-2"></i>
                  Previous
                </Button>
              )}
              {!showSummary && (
                <button
                  onClick={handleSkip}
                  className="text-gray-600 hover:text-gray-700 font-medium cursor-pointer"
                >
                  Skip for now
                </button>
              )}
            </div>

            <div className="flex space-x-3">
              {!showSummary ? (
                <Button 
                  onClick={handleNext}
                  disabled={questions[currentQuestion].required && !isCurrentQuestionAnswered()}
                >
                  {currentQuestion === questions.length - 1 ? 'Review' : 'Next'}
                  <i className="ri-arrow-right-line ml-2"></i>
                </Button>
              ) : (
                <>
                  <Button variant="secondary" onClick={() => setShowSummary(false)}>
                    <i className="ri-arrow-left-line mr-2"></i>
                    Back
                  </Button>
                  <Button onClick={handleComplete}>
                    Complete & Continue
                    <i className="ri-check-line ml-2"></i>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
