import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../../components/feature/Header';
import Button from '../../../components/base/Button';
import Card from '../../../components/base/Card';
import LoadingSpinner from '../../../components/effects/LoadingSpinner';
import CircularProgress from '../../../components/base/CircularProgress';
import CountUpNumber from '../../../components/base/CountUpNumber';
import { testService } from '../../../api';
import type {
  TestResultsResponse,
  TopicPerformanceDetail,
  Achievement,
  Recommendation
} from '../../../api/types';

export default function TestResults() {
  const { testId } = useParams();
  const [searchParams] = useSearchParams();
  const actualTestId = testId || searchParams.get('id') || '';
  const navigate = useNavigate();
  const [result, setResult] = useState<TestResultsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [animateCards, setAnimateCards] = useState(false);

  // Redirect to canonical URL if using query param
  useEffect(() => {
    if (!testId && searchParams.get('id')) {
      const qId = searchParams.get('id');
      navigate(`/test/${qId}/results`, { replace: true });
    }
  }, [testId, searchParams, navigate]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!actualTestId) {
        setError('No test ID provided');
        setLoading(false);
        return;
      }

      try {
        // Fetch comprehensive test results from new endpoint
        const resultsData = await testService.getTestResults(actualTestId);
        setResult(resultsData);
        setShowConfetti(true);
        setTimeout(() => setAnimateCards(true), 500);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [actualTestId]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" variant="engineering" />
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Results Not Found</h2>
            <p className="text-gray-600 mb-6">The test results you're looking for don't exist.</p>
            <Button onClick={() => navigate('/practice-tests')}>
              Back to Practice Tests
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      <Header />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Geometric Shapes */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-green-200 rotate-45 opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-purple-200 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '2s', animationDuration: '4s' }}></div>
        <div className="absolute bottom-20 right-40 w-24 h-24 bg-yellow-200 rotate-12 opacity-20 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        
        {/* Success Particles */}
        {showConfetti && (
          <>
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 bg-gradient-to-r ${i % 4 === 0 ? 'from-yellow-400 to-orange-500' : i % 4 === 1 ? 'from-green-400 to-emerald-500' : i % 4 === 2 ? 'from-blue-400 to-indigo-500' : 'from-purple-400 to-pink-500'} rounded-full animate-ping`}
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              ></div>
            ))}
          </>
        )}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 pt-24">
        {/* Celebration Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full mb-6 animate-pulse">
            <i className="ri-trophy-fill text-4xl text-white"></i>
          </div>
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 animate-fade-in">
            Congratulations! 🎉
          </h1>
          
          <p className="text-xl text-gray-600 mb-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {result.title}
          </p>
          
          <p className="text-sm text-gray-500 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            Completed on {new Date(result.completed_at).toLocaleDateString()} at {new Date(result.completed_at).toLocaleTimeString()}
          </p>
        </div>

        {/* Main Score Display */}
        <div className={`text-center mb-12 transform transition-all duration-1000 ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <Card className="max-w-md mx-auto bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 shadow-2xl">
            <div className="p-8">
              <div className="relative mb-6">
                <div className="flex justify-center">
                  <div className="relative">
                    <CircularProgress
                      value={result.score}
                      size={120}
                      strokeWidth={12}
                      color="success"
                      showLabel={false}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">
                          <CountUpNumber end={result.score} duration={2000} />%
                        </div>
                        <div className="text-sm text-gray-600">Score</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Animated Success Ring */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 border-4 border-green-300 rounded-full animate-ping opacity-20"></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  <CountUpNumber end={result.correct_answers} duration={1500} />/{result.total_questions}
                </div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatTime(Math.round(result.time_spent_seconds / 60))}
                </div>
                <div className="text-sm text-gray-600">Time</div>
              </div>
            </div>
            </div>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 transform transition-all duration-1000 ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '0.2s' }}>
          <Card className="text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-check-double-line text-2xl text-white"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Accuracy</h3>
              <p className="text-2xl font-bold text-green-600">
                <CountUpNumber end={Math.round((result.correct_answers / result.total_questions) * 100)} duration={1800} />%
              </p>
            </div>
          </Card>

          <Card className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-speed-line text-2xl text-white"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Avg. Time</h3>
              <p className="text-2xl font-bold text-blue-600">
                <CountUpNumber end={result.average_time_per_question / 60} duration={1600} decimals={1} />m
              </p>
            </div>
          </Card>

          <Card className="text-center bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-star-line text-2xl text-white"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Rank</h3>
              <p className="text-2xl font-bold text-purple-600">
                {result.score >= 90 ? 'Excellent' : result.score >= 80 ? 'Very Good' : result.score >= 70 ? 'Good' : 'Fair'}
              </p>
            </div>
          </Card>

          <Card className="text-center bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-medal-line text-2xl text-white"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Achievements</h3>
              <p className="text-2xl font-bold text-orange-600">
                <CountUpNumber end={result.achievements_unlocked.length} duration={1400} />
              </p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Topic Breakdown */}
          <Card className={`bg-white shadow-xl transform transition-all duration-1000 ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} delay={400}>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                <i className="ri-bar-chart-box-line text-blue-600"></i>
                <span>Topic Performance</span>
              </h3>
              
              <div className="space-y-6">
                {result.topic_breakdown.map((topic: TopicPerformanceDetail, index: number) => (
                  <div key={index} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">{topic.topic_name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {topic.correct_answers}/{topic.total_questions}
                        </span>
                        <span className={`text-sm font-bold ${
                          topic.percentage >= 90 ? 'text-green-600' :
                          topic.percentage >= 80 ? 'text-blue-600' :
                          topic.percentage >= 70 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {Math.round(topic.percentage)}%
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-1000 ${
                            topic.percentage >= 90 ? 'bg-gradient-to-r from-green-400 to-emerald-600' :
                            topic.percentage >= 80 ? 'bg-gradient-to-r from-blue-400 to-indigo-600' :
                            topic.percentage >= 70 ? 'bg-gradient-to-r from-yellow-400 to-orange-600' :
                            'bg-gradient-to-r from-red-400 to-pink-600'
                          }`}
                          style={{
                            width: animateCards ? `${topic.percentage}%` : '0%',
                            transitionDelay: `${0.6 + index * 0.1}s`
                          }}
                        ></div>
                      </div>
                      {topic.percentage === 100 && (
                        <div className="absolute -top-1 -right-1">
                          <i className="ri-star-fill text-yellow-500 animate-pulse"></i>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Achievements & Recommendations */}
          <div className="space-y-6">
            {/* Achievements */}
            <Card className={`bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-xl transform transition-all duration-1000 ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} delay={600}>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                  <i className="ri-trophy-line text-yellow-600"></i>
                  <span>Achievements Unlocked</span>
                </h3>
                
                <div className="space-y-3">
                  {result.achievements_unlocked.length > 0 ? (
                    result.achievements_unlocked.map((achievement: Achievement, index: number) => (
                      <div
                        key={achievement.id}
                        className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 animate-slide-in"
                        style={{ animationDelay: `${0.8 + index * 0.1}s` }}
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <i className={`ri-${achievement.icon}-fill text-white text-sm`}></i>
                        </div>
                        <div className="flex-1">
                          <span className="text-gray-800 font-medium block">{achievement.name}</span>
                          <span className="text-xs text-gray-500">{achievement.description}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 text-center py-4">Complete more tests to unlock achievements!</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Next Steps */}
            <Card className={`bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-xl transform transition-all duration-1000 ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} delay={800}>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                  <i className="ri-lightbulb-line text-blue-600"></i>
                  <span>Next Steps</span>
                </h3>
                
                <div className="space-y-3">
                  {result.study_recommendations.map((recommendation: Recommendation, index: number) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 animate-slide-in cursor-pointer"
                      style={{ animationDelay: `${1.0 + index * 0.1}s` }}
                      onClick={() => recommendation.action_url && navigate(recommendation.action_url)}
                    >
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i className={`ri-${recommendation.icon || 'arrow-right'}-line text-white text-xs`}></i>
                      </div>
                      <div className="flex-1">
                        <span className="text-gray-800 font-medium block">{recommendation.title}</span>
                        <span className="text-sm text-gray-600">{recommendation.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`flex flex-col sm:flex-row gap-4 justify-center transform transition-all duration-1000 ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '1.2s' }}>
          <Button
            onClick={() => navigate(`/test/${result.id}/review`)}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg whitespace-nowrap"
          >
            <i className="ri-eye-line"></i>
            <span>Review Answers</span>
          </Button>
          
          <Button
            onClick={() => navigate('/practice-test/new')}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-300 shadow-lg whitespace-nowrap"
          >
            <i className="ri-refresh-line"></i>
            <span>Take Another Test</span>
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => navigate('/practice')}
            className="flex items-center space-x-2 border-2 border-purple-300 text-purple-600 hover:bg-purple-50 transform hover:scale-105 transition-all duration-300 whitespace-nowrap"
          >
            <i className="ri-book-open-line"></i>
            <span>Practice More</span>
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 border-2 border-gray-300 text-gray-600 hover:bg-gray-50 transform hover:scale-105 transition-all duration-300 whitespace-nowrap"
          >
            <i className="ri-dashboard-line"></i>
            <span>Dashboard</span>
          </Button>
        </div>

        {/* Share Results */}
        <div className={`text-center mt-8 transform transition-all duration-1000 ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '1.4s' }}>
          <p className="text-gray-600 mb-4">Share your success!</p>
          <div className="flex justify-center space-x-4">
            <button className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transform hover:scale-110 transition-all duration-300">
              <i className="ri-facebook-fill"></i>
            </button>
            <button className="w-12 h-12 bg-blue-400 text-white rounded-full flex items-center justify-center hover:bg-blue-500 transform hover:scale-110 transition-all duration-300">
              <i className="ri-twitter-fill"></i>
            </button>
            <button className="w-12 h-12 bg-blue-700 text-white rounded-full flex items-center justify-center hover:bg-blue-800 transform hover:scale-110 transition-all duration-300">
              <i className="ri-linkedin-fill"></i>
            </button>
            <button className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 transform hover:scale-110 transition-all duration-300">
              <i className="ri-whatsapp-fill"></i>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out both;
        }
        
        .animate-slide-in {
          animation: slide-in 0.6s ease-out both;
        }
      `}</style>
    </div>
  );
}
