import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/feature/Header';
import MobileNavigation from '../../components/feature/MobileNavigation';
import VerificationBanner from '../../components/feature/VerificationBanner';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import ProgressBar from '../../components/base/ProgressBar';
import CircularProgress from '../../components/base/CircularProgress';
import CountUpNumber from '../../components/base/CountUpNumber';
import ParticleBackground from '../../components/effects/ParticleBackground';
import BlueprintReveal from '../../components/effects/BlueprintReveal';
import ExamAttemptsCounter from '../../components/feature/ExamAttemptsCounter';
import CouponRedemptionModal from '../../components/feature/CouponRedemptionModal';
import { updateSEO, seoData } from '../../utils/seo';
import { useDashboard } from '../../hooks/useDashboard';
import { useCoach } from '../../hooks/useCoach';

export default function Dashboard() {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [showBlueprint, setShowBlueprint] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const navigate = useNavigate();
  const { data: dashboard, loading, error } = useDashboard();
  const { data: coach, loading: coachLoading, error: coachError, refresh: refreshCoach } = useCoach();
  console.log("AI Coach:", { coach, coachLoading, coachError });

  useEffect(() => {
    updateSEO(seoData.dashboard);
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="ri-error-warning-line text-6xl text-red-500 mb-4"></i>
          <p className="text-lg text-gray-600">Failed to load dashboard</p>
          <p className="text-sm text-gray-500 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  const d = dashboard; // Use the real API data

  const handleBlueprintComplete = () => {
    setShowBlueprint(false);
    setContentVisible(true);
  };

  const handleSkipBlueprint = () => {
    setShowBlueprint(false);
    setContentVisible(true);
  };

  const handleStartNewTest = () => {
    navigate('/practice-test/new');
  };

  const handleRecommendedTestClick = async (_test: any) => {
    // All test creation must go through the coupon gate
    // Note: The /practice-test/new page will validate coupon access
    navigate('/practice-test/new');
  };

  const handleFullPracticeExam = async () => {
    // All test creation must go through the coupon gate
    // Note: The /practice-test/new page will validate coupon access
    navigate('/practice-test/new');
  };

  // Helper functions for dynamic messaging
  const getPassReadyMessage = (passReady: number) => {
    if (passReady < 30) return "Early in your journey – keep practicing and building a solid foundation.";
    if (passReady < 60) return "You're making progress – focus on your weak areas to build momentum.";
    if (passReady < 80) return "You're getting close – now is the time for full exams and timing practice.";
    return "You're in excellent shape – keep your skills fresh with regular practice exams.";
  };

  const getProgressTitle = (passReady: number) => {
    if (passReady < 30) return "Let's Build Your Foundation 💪";
    if (passReady < 60) return "You're On Your Way 🚀";
    return "You're Almost There! 🚀";
  };

  // Remove problematic useEffect - let CSS handle animations

  return (
    <div className="min-h-screen relative overflow-hidden">
      {showBlueprint && (
        <div onClick={handleSkipBlueprint} className="cursor-pointer">
          <BlueprintReveal onComplete={handleBlueprintComplete} />
        </div>
      )}

      <div className="fixed inset-0 animated-gradient opacity-25"></div>
      <div className="fixed inset-0 mesh-gradient"></div>
      
      <ParticleBackground />
      
      <div className="geometric-shape shape-1"></div>
      <div className="geometric-shape shape-2"></div>
      <div className="geometric-shape shape-3"></div>
      <div className="geometric-shape shape-4"></div>

      <Header />
      <VerificationBanner />
      
      <main 
        ref={dashboardRef} 
        className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8 pt-24 transition-opacity duration-1000 ${
          contentVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Welcome Section with CTA */}
        <div className="mb-8 animate-fade-in-up stagger-1">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-h1 text-gray-900 mb-2 animate-text-reveal">
                Ready for Your Next Test, {d.user_name}? 🎯
              </h1>
              <p className="text-body text-neutral animate-text-reveal stagger-2">
                You're on track! Your last score was {d.last_score.toFixed(1)}% - keep the momentum going.
              </p>
            </div>
            <Button
              className="btn-premium whitespace-nowrap"
              size="lg"
              magnetic={true}
              glow={true}
              onClick={handleStartNewTest}
            >
              <i className="ri-play-circle-line mr-2"></i>
              Start New Mock Test
            </Button>
          </div>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {/* Tests Completed */}
          <Card 
            className="text-center" 
            delay={300} 
            glassmorphism={true} 
            interactive3d={true}
            glow={true}
          >
            <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 rounded-full">
              <i className="ri-file-list-3-line text-2xl text-primary"></i>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1 animate-number-count">
              <CountUpNumber end={d.tests_taken.total} duration={1200} delay={400} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Tests Taken</h3>
            <p className="text-small text-success font-medium">+{d.tests_taken.this_month} this month</p>
          </Card>

          {/* Average Score */}
          <Card 
            className="text-center" 
            delay={400} 
            glassmorphism={true} 
            interactive3d={true}
            glow={true}
          >
            <div className="mb-4 flex justify-center">
              <CircularProgress
                value={d.average_score.current}
                size={90}
                strokeWidth={10}
                animate={contentVisible}
                delay={500}
                gradient={true}
                glow={true}
              />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Average Score</h3>
            <p className="text-small text-success font-medium">+{d.average_score.improvement.toFixed(1)}% improvement</p>
          </Card>

          {/* Study Streak */}
          <Card 
            className="text-center" 
            delay={500} 
            glassmorphism={true} 
            interactive3d={true}
            glow={true}
          >
            <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <i className="ri-fire-line text-3xl text-orange-600 animate-pulse-gentle"></i>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1 animate-number-count">
              <CountUpNumber end={d.study_streak.current} duration={1200} delay={600} />
              <span className="text-xl"> Days</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Active Streak</h3>
            <p className="text-small text-neutral">Best: {d.study_streak.longest} days</p>
          </Card>

          {/* Pass Readiness */}
          <Card 
            className="text-center" 
            delay={600} 
            glassmorphism={true} 
            interactive3d={true}
            glow={true}
          >
            <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200 rounded-full">
              <i className="ri-shield-check-line text-2xl text-success"></i>
            </div>
            <div className="text-3xl font-bold text-success mb-1 animate-number-count">
              <CountUpNumber end={d.pass_ready_percentage} duration={1500} delay={700} suffix="%" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Pass Ready</h3>
            <p className="text-small text-success">Excellent progress!</p>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Test History - Takes 2 columns */}
          <div className="lg:col-span-2">
            <Card delay={700} glassmorphism={true} glow={true} className="scroll-reveal">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-h2 text-gray-900 animate-text-reveal">Recent Mock Tests</h2>
                <Button variant="secondary" size="sm" className="text-xs">
                  View All History
                </Button>
              </div>
              
              <div className="space-y-3">
                {d.recent_tests.map((test, index) => (
                  <div
                    key={test.id}
                    className="p-4 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-lg border border-gray-200/50 hover:border-primary/30 transition-all duration-300 card-hover-3d animate-slide-in-left cursor-pointer"
                    style={{ animationDelay: `${800 + index * 100}ms` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{test.name}</h3>
                        <div className="flex items-center gap-3 text-xs text-neutral">
                          <span className="flex items-center">
                            <i className="ri-calendar-line mr-1"></i>
                            {test.date}
                          </span>
                          <span className="flex items-center">
                            <i className="ri-time-line mr-1"></i>
                            {test.duration}
                          </span>
                          <span className="flex items-center">
                            <i className="ri-question-line mr-1"></i>
                            {test.questions} questions
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${test.score >= 75 ? 'text-success' : test.score >= 65 ? 'text-warning' : 'text-error'}`}>
                          {test.score.toFixed(1)}%
                        </div>
                        <div className={`text-xs font-medium ${test.delta >= 0 ? 'text-success' : 'text-error'}`}>
                          {test.delta >= 0 ? '+' : ''}{test.delta.toFixed(1)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <ProgressBar
                          value={test.score}
                          animate={contentVisible}
                          delay={1000 + index * 100}
                          color={test.score >= 75 ? 'success' : test.score >= 65 ? 'warning' : 'error'}
                          size="sm"
                          gradient={true}
                        />
                      </div>
                      <Button size="sm" variant="secondary" className="text-xs px-3 py-1">
                        <i className="ri-eye-line mr-1"></i>
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Performance Trend Chart */}
              <div className="mt-6 pt-6 border-t border-gray-200/50">
                <h3 className="font-semibold text-gray-900 mb-4">Score Progression</h3>
                <div className="flex items-end justify-between h-32 gap-2">
                  {d.score_progression.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-t-lg relative overflow-hidden" style={{ height: `${item.score}%` }}>
                        <div
                          className={`absolute inset-0 bg-gradient-to-t ${
                            item.score >= 75 ? 'from-green-400 to-green-500' :
                            item.score >= 65 ? 'from-yellow-400 to-yellow-500' :
                            'from-red-400 to-red-500'
                          } animate-slide-up`}
                          style={{ animationDelay: `${1500 + index * 150}ms` }}
                        ></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-white">{item.score.toFixed(1)}%</span>
                        </div>
                      </div>
                      <span className="text-xs text-neutral font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Exam Attempts Counter */}
            <ExamAttemptsCounter
              onRedeemClick={() => setShowCouponModal(true)}
            />

            {/* Achievements */}
            <Card delay={800} glassmorphism={true} glow={true} className="scroll-reveal">
              <h2 className="text-h2 text-gray-900 mb-4 animate-text-reveal">Recent Achievements</h2>
              <div className="space-y-3">
                {d.recent_achievements.length > 0 ? d.recent_achievements.map((achievement, index) => (
                  <div
                    key={achievement.earned_at}
                    className="p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg animate-scale-in"
                    style={{ animationDelay: `${1200 + index * 150}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 text-yellow-600">
                        <i className={`ri-trophy-line text-xl`}></i>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm">{achievement.title}</h3>
                        <p className="text-xs text-neutral">{achievement.description}</p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-neutral">No achievements yet. Keep practicing to unlock them!</p>
                )}
              </div>
            </Card>

            {/* Exam Countdown */}
            <Card delay={900} glassmorphism={true} glow={true} className="scroll-reveal">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-red-100 to-red-200 rounded-full">
                  <i className="ri-calendar-check-line text-3xl text-red-600"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Exam Countdown</h3>
                <div className="text-4xl font-bold text-red-600 mb-1 animate-number-count">
                  <CountUpNumber end={d.exam_countdown.days_left} duration={1200} delay={1000} />
                  <span className="text-2xl"> Days</span>
                </div>
                <p className="text-small text-neutral mb-4">
                  {d.exam_countdown.days_left === 0
                    ? "Until your scheduled NPPE exam"
                    : "Until your scheduled NPPE exam"
                  }
                </p>
                {d.exam_countdown.days_left === 0 ? (
                  <p className="text-xs text-neutral">
                    No exam date set yet – add your exam date in your profile to get a proper countdown.
                  </p>
                ) : (
                  <>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full animate-progress-fill" style={{ width: `${d.exam_countdown.prep_time_used}%`, animationDelay: '1200ms' }}></div>
                    </div>
                    <p className="text-xs text-neutral mt-2">
                      {d.exam_countdown.prep_time_used.toFixed(1)}% of your prep window has passed. Stay consistent!
                    </p>
                  </>
                )}
              </div>
            </Card>

            {/* AI Coach */}
            <Card delay={950} glassmorphism={true} glow={true} className="scroll-reveal">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <i className="ri-robot-line text-2xl text-primary"></i>
                  <h2 className="text-h3 text-gray-900 animate-text-reveal">NPPE AI Coach 🧠</h2>
                </div>
                {coach && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={refreshCoach}
                    className="text-xs"
                    disabled={coachLoading}
                  >
                    <i className="ri-refresh-line mr-1"></i>
                    {coachLoading ? 'Refreshing...' : 'Refresh'}
                  </Button>
                )}
              </div>

              <div className="text-xs text-gray-500 mb-4 italic">
                Powered by AI – personalized plan created from your real test data
              </div>

              {coachLoading && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Generating your personalized study plan…</p>
                </div>
              )}

              {coachError && (
                <div className="text-center py-4">
                  <i className="ri-error-warning-line text-2xl text-red-500 mb-2"></i>
                  <p className="text-sm text-red-500">Couldn't load AI coach right now.</p>
                  <p className="text-xs text-gray-500 mt-1">Please try again later.</p>
                </div>
              )}

              {coach && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-700">{coach.summary}</p>

                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <h3 className="font-medium text-sm mb-2 text-green-700">Strengths</h3>
                      <ul className="space-y-1">
                        {coach.strengths.map((strength, i) => (
                          <li key={i} className="text-xs text-gray-600 flex items-start">
                            <i className="ri-check-line text-green-600 mr-1 mt-0.5 flex-shrink-0"></i>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-medium text-sm mb-2 text-red-700">Areas to Focus</h3>
                      <ul className="space-y-1">
                        {coach.weaknesses.map((weakness, i) => (
                          <li key={i} className="text-xs text-gray-600 flex items-start">
                            <i className="ri-arrow-right-line text-red-600 mr-1 mt-0.5 flex-shrink-0"></i>
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200/50">
                    <h3 className="font-medium text-sm mb-2">Recommended Tests</h3>
                    <div className="space-y-2">
                      {coach.recommended_tests.map((test, i) => (
                        <div key={i} className="text-xs bg-blue-50 text-blue-700 px-3 py-2 rounded">
                          {test}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-200/50">
                    <p className="text-xs text-gray-600 italic">
                      {coach.motivational_message}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Recommended Tests Section */}
        <Card delay={1000} glassmorphism={true} glow={true} className="scroll-reveal">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-h2 text-gray-900 animate-text-reveal">Recommended Next Tests</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {d.recommended_tests.map((test, index) => (
              <div
                key={index}
                className={`p-5 rounded-lg border-2 transition-all duration-300 card-hover-3d animate-slide-in-up cursor-pointer ${
                  test.recommended
                    ? 'bg-gradient-to-br from-blue-50/90 to-blue-100/90 border-primary/30 hover:border-primary'
                    : 'bg-gradient-to-br from-white/80 to-white/60 border-gray-200/50 hover:border-gray-300'
                }`}
                style={{ animationDelay: `${1400 + index * 150}ms` }}
              >
                {test.recommended && (
                  <div className="inline-flex items-center px-2 py-1 bg-primary text-white text-xs font-semibold rounded-full mb-3">
                    <i className="ri-star-line mr-1"></i>
                    Recommended
                  </div>
                )}
                <h3 className="font-bold text-gray-900 mb-3">{test.title}</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-neutral">
                    <i className="ri-question-line mr-2 text-primary"></i>
                    {test.questions} questions
                  </div>
                  <div className="flex items-center text-sm text-neutral">
                    <i className="ri-time-line mr-2 text-primary"></i>
                    {test.duration}
                  </div>
                  <div className="flex items-center text-sm text-neutral">
                    <i className="ri-bar-chart-line mr-2 text-primary"></i>
                    {test.difficulty}
                  </div>
                  <div className="flex items-center text-sm text-neutral">
                    <i className="ri-focus-3-line mr-2 text-primary"></i>
                    {test.focus}
                  </div>
                </div>
                <Button
                  className={`w-full justify-center ${test.recommended ? 'btn-premium' : ''}`}
                  variant={test.recommended ? 'primary' : 'secondary'}
                  magnetic={test.recommended}
                  glow={test.recommended}
                  onClick={() => handleRecommendedTestClick(test)}
                >
                  <i className="ri-play-circle-line mr-2"></i>
                  Start Test
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Motivational Banner */}
        <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '1800ms' }}>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-blue-600 to-blue-700 p-8 text-white">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{getProgressTitle(d.pass_ready_percentage)}</h2>
                <p className="text-blue-100 mb-4">
                  {getPassReadyMessage(d.pass_ready_percentage)}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center">
                    <i className="ri-checkbox-circle-line mr-2"></i>
                    <span>{d.almost_there_summary.tests_completed} tests completed</span>
                  </div>
                  <div className="flex items-center">
                    <i className="ri-arrow-up-line mr-2"></i>
                    <span>+{d.almost_there_summary.improvement_percent.toFixed(1)}% improvement</span>
                  </div>
                  <div className="flex items-center">
                    <i className="ri-trophy-line mr-2"></i>
                    <span>{d.almost_there_summary.achievements_count} achievements unlocked</span>
                  </div>
                </div>
              </div>
              <Button
                variant="secondary"
                className="text-gray-900 hover:bg-gray-100 whitespace-nowrap font-bold px-8"
                size="lg"
                magnetic={true}
                onClick={handleFullPracticeExam}
              >
                <i className="ri-rocket-line mr-2"></i>
                Take Full Practice Exam
              </Button>
            </div>
          </div>
        </div>
      </main>

      <MobileNavigation />

      {/* Coupon Redemption Modal */}
      <CouponRedemptionModal
        isOpen={showCouponModal}
        onClose={() => setShowCouponModal(false)}
        onSuccess={() => setShowCouponModal(false)}
      />
    </div>
  );
}
