import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/feature/Header';
import MobileNavigation from '../../components/feature/MobileNavigation';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import ProgressBar from '../../components/base/ProgressBar';
import CircularProgress from '../../components/base/CircularProgress';
import CountUpNumber from '../../components/base/CountUpNumber';
import ParticleBackground from '../../components/effects/ParticleBackground';
import BlueprintReveal from '../../components/effects/BlueprintReveal';
import { updateSEO, seoData } from '../../utils/seo';
import { useDashboard } from '../../hooks/useDashboard';
import { useAuthContext } from '../../contexts/AuthContext';
import { testService } from '../../api';

export default function Dashboard() {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [showBlueprint, setShowBlueprint] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [inProgressTest, setInProgressTest] = useState<any>(null);
  const navigate = useNavigate();
  
  // Fetch real data from backend
  const { data: dashboardData, loading, error } = useDashboard();
  const { user } = useAuthContext();

  useEffect(() => {
    updateSEO(seoData.dashboard);
  }, []);
  
  // Check for in-progress tests
  useEffect(() => {
    const checkInProgressTests = async () => {
      try {
        const response = await testService.getTestHistory();
        // Handle if response is array directly or wrapped in object
        const tests = Array.isArray(response) ? response : (response as any)?.tests || [];
        const inProgress = tests.find((t: any) => t.status === 'in_progress');
        setInProgressTest(inProgress || null);
      } catch (err) {
        console.error('Failed to check in-progress tests:', err);
      }
    };
    
    if (!loading && dashboardData) {
      checkInProgressTests();
    }
  }, [loading, dashboardData]);

  // Blueprint reveal completion handler
  const handleBlueprintComplete = () => {
    setShowBlueprint(false);
    setContentVisible(true);
  };

  // Skip blueprint animation on click
  const handleSkipBlueprint = () => {
    setShowBlueprint(false);
    setContentVisible(true);
  };

  // Scroll-triggered animations
  useEffect(() => {
    if (!contentVisible) return;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, observerOptions);

    const scrollElements = document.querySelectorAll('.scroll-reveal');
    scrollElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [contentVisible]);

  // Transform topic mastery data for display
  const topicPerformance = dashboardData?.topic_mastery?.map(topic => ({
    topic: topic.topic?.name || 'Unknown Topic',
    score: Math.round(topic.mastery_percentage),
    color: topic.mastery_percentage >= 80 ? 'success' : 
           topic.mastery_percentage >= 60 ? 'warning' : 'error'
  })) || [];

  // Get weak topics (score < 60%)
  const weakTopics = dashboardData?.weak_topics?.slice(0, 3) || [];

  // Format recent activities
  const recentActivities = dashboardData?.recent_activity?.map(activity => ({
    icon: activity.type === 'practice_test' ? 'ri-file-text-line' :
          activity.type === 'question' ? 'ri-play-circle-line' :
          activity.type === 'achievement' ? 'ri-award-line' : 'ri-book-open-line',
    text: activity.description,
    time: formatRelativeTime(activity.timestamp),
    color: activity.type === 'achievement' ? 'text-secondary' : 'text-primary'
  })) || [];

  // Calculate questions progress percentage
  const questionsProgress = dashboardData ?
    Math.round((dashboardData.questions_completed / 500) * 100) : 0;

  // Handler for Practice Weakest Topic button
  const handlePracticeWeakestTopic = async () => {
    if (creating || !weakTopics.length) return;
    
    setCreating(true);
    try {
      // Get the weakest topic (first one in the list)
      const weakestTopic = dashboardData?.weak_topics?.[0];
      if (!weakestTopic) return;

      // Find the topic ID from topic_mastery
      const topicMastery = dashboardData?.topic_mastery?.find(
        (tm) => tm.topic?.name === weakestTopic.name
      );
      
      const topicId = topicMastery?.topic_id;
      if (!topicId) {
        throw new Error('Could not find topic ID');
      }

      // Start a topic-specific test
      const response = await testService.startTest({
        test_type: 'topic_specific',
        topic_ids: [topicId],
        question_count: 20,
        time_limit_minutes: 30
      });

      // Extract test_id from response (check multiple possible locations)
      const testId = response?.test_id || (response as any)?.id || (response as any)?.data?.test_id;
      if (!testId) {
        console.error('API Response:', response);
        throw new Error('No test ID returned from server');
      }
      navigate(`/practice-test/take/${testId}`);
    } catch (err) {
      console.error('Failed to start practice test:', err);
      alert('Failed to start practice test. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  // Handler for Start Full Mock button
  const handleStartFullMock = async () => {
    if (creating) return;
    
    setCreating(true);
    try {
      // Let the server decide question_count/time_limit if it has defaults
      const response = await testService.startTest({
        test_type: 'full_exam',
      });

      // Extract test_id from response (check multiple possible locations)
      const testId = response?.test_id || (response as any)?.id || (response as any)?.data?.test_id;
      if (!testId) {
        console.error('API Response:', response);
        throw new Error('No test ID returned from server');
      }
      navigate(`/practice-test/take/${testId}`);
    } catch (err: any) {
      console.error('Failed to start full mock:', err);
      
      // Fallback: try a smaller custom test if the server complains about size
      if (err?.response?.status === 400) {
        try {
          const retry = await testService.startTest({
            test_type: 'custom',
            question_count: 10,
            time_limit_minutes: 15,
          });
          const testId = retry?.test_id || (retry as any)?.id || (retry as any)?.data?.test_id;
          if (!testId) {
            throw new Error('No test ID returned from server');
          }
          navigate(`/practice-test/take/${testId}`);
          return;
        } catch (retryErr) {
          console.error('Fallback test creation also failed:', retryErr);
        }
      }
      
      alert('Failed to start full mock exam. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  // Handler for Continue Studying button
  const handleContinueStudying = async () => {
    if (creating) return;
    
    setCreating(true);
    try {
      // Start a small mixed test that works with limited question bank
      const response = await testService.startTest({
        test_type: 'custom',
        question_count: 10,
        time_limit_minutes: 15,
      });

      // Extract test_id from response (check multiple possible locations)
      const testId = response?.test_id || (response as any)?.id || (response as any)?.data?.test_id;
      if (!testId) {
        console.error('API Response:', response);
        throw new Error('No test ID returned from server');
      }
      navigate(`/practice-test/take/${testId}`);
    } catch (err) {
      console.error('Failed to start practice session:', err);
      alert('Failed to start practice session. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="ri-error-warning-line text-red-600 text-5xl mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to load dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Blueprint Reveal Animation */}
      {showBlueprint && (
        <div onClick={handleSkipBlueprint} className="cursor-pointer">
          <BlueprintReveal onComplete={handleBlueprintComplete} />
        </div>
      )}

      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 animated-gradient opacity-25"></div>
      <div className="fixed inset-0 mesh-gradient"></div>
      
      {/* Particle Background */}
      <ParticleBackground />
      
      {/* Enhanced Geometric Shapes */}
      <div className="geometric-shape shape-1"></div>
      <div className="geometric-shape shape-2"></div>
      <div className="geometric-shape shape-3"></div>
      <div className="geometric-shape shape-4"></div>

      <Header />
      
      <main 
        ref={dashboardRef} 
        className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8 pt-24 transition-opacity duration-1000 ${
          contentVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in-up stagger-1">
          <h1 className="text-h1 text-gray-900 mb-2 animate-text-reveal">
            Welcome back, {user?.first_name || 'Student'}! 👋
          </h1>
          <p className="text-body text-neutral animate-text-reveal stagger-2">
            You're making great progress. Keep up the momentum!
          </p>
        </div>

        {/* Hero Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {/* Overall Progress */}
          <Card 
            className="text-center" 
            delay={300} 
            glassmorphism={true} 
            interactive3d={true}
            glow={true}
          >
            <div className="mb-4 flex justify-center">
              <CircularProgress 
                value={dashboardData?.overall_progress || 0} 
                size={90} 
                strokeWidth={10}
                animate={contentVisible}
                delay={500}
                gradient={true}
                glow={true}
              />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 animate-text-reveal stagger-3">Overall Progress</h3>
            <p className="text-small text-success font-medium animate-text-reveal stagger-4">Keep going!</p>
          </Card>

          {/* Study Streak */}
          <Card 
            className="text-center" 
            delay={400} 
            glassmorphism={true} 
            interactive3d={true}
            glow={true}
          >
            <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <i className="ri-fire-line text-3xl text-secondary animate-pulse-gentle"></i>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1 animate-number-count stagger-5">
              <CountUpNumber end={dashboardData?.study_streak || 0} duration={1200} delay={600} />
              <span> Days</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 animate-text-reveal stagger-6">Study Streak</h3>
            <p className="text-small text-neutral animate-text-reveal stagger-7">
              Your longest: {dashboardData?.longest_streak || 0} days
            </p>
          </Card>

          {/* Questions Completed */}
          <Card 
            className="text-center" 
            delay={500} 
            glassmorphism={true} 
            interactive3d={true}
            glow={true}
          >
            <div className="mb-4">
              <div className="text-2xl font-bold text-gray-900 mb-2 animate-number-count stagger-8">
                <CountUpNumber end={dashboardData?.questions_completed || 0} duration={1400} delay={700} />
                <span>/500</span>
              </div>
              <ProgressBar 
                value={questionsProgress} 
                animate={contentVisible} 
                delay={800}
                color="primary"
                glow={true}
                gradient={true}
              />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 animate-text-reveal stagger-9">Questions Done</h3>
            <p className="text-small text-neutral animate-text-reveal stagger-10">
              {dashboardData?.accuracy_rate ? `${dashboardData.accuracy_rate.toFixed(1)}% accuracy` : 'Start practicing'}
            </p>
          </Card>

          {/* Pass Probability */}
          <Card 
            className="text-center" 
            delay={600} 
            glassmorphism={true} 
            interactive3d={true}
            glow={true}
          >
            <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200 rounded-full">
              <i className="ri-arrow-up-line text-xl text-success animate-bounce-in"></i>
            </div>
            <div className="text-2xl font-bold text-success mb-1 animate-number-count">
              <CountUpNumber end={dashboardData?.pass_probability || 0} duration={1500} delay={900} suffix="%" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 animate-text-reveal">Pass Ready</h3>
            <p className="text-small text-success animate-text-reveal">
              {dashboardData && dashboardData.pass_probability >= 70 ? 'Trending up' : 'Keep studying'}
            </p>
          </Card>
        </div>

        {/* Middle Section */}
        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          {/* Exam Activity */}
          <div>
            <Card delay={700} glassmorphism={true} glow={true} className="scroll-reveal">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200 rounded-full">
                  <i className="ri-file-text-line text-2xl text-purple-600 animate-bounce-in"></i>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2 animate-number-count">
                  <CountUpNumber end={dashboardData?.practice_tests_taken || 0} duration={1200} delay={800} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 animate-text-reveal">Mock Exams</h3>
                <p className="text-small text-neutral animate-text-reveal mb-4">Completed</p>

                {/* Progress towards target (assuming 10 exams as target) */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Progress to Target</span>
                    <span>{Math.min(dashboardData?.practice_tests_taken || 0, 10)}/10</span>
                  </div>
                  <ProgressBar
                    value={Math.min(((dashboardData?.practice_tests_taken || 0) / 10) * 100, 100)}
                    animate={contentVisible}
                    delay={1000}
                    color="primary"
                    glow={true}
                    gradient={true}
                    size="sm"
                  />
                  <p className="text-xs text-gray-500">
                    {(dashboardData?.practice_tests_taken || 0) >= 10 ? 'Target achieved!' : `${10 - (dashboardData?.practice_tests_taken || 0)} more to go`}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Performance by Topic Chart */}
          <div className="lg:col-span-2">
            <Card delay={700} glassmorphism={true} glow={true} className="scroll-reveal">
              <h2 className="text-h2 text-gray-900 mb-6 animate-text-reveal">Performance by Topic</h2>
              {topicPerformance.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {topicPerformance.map((topic, index) => (
                      <div key={index} className="flex items-center animate-slide-in-left interactive-hover" style={{ animationDelay: `${1000 + index * 150}ms` }}>
                        <div className="w-40 text-small text-gray-700 truncate font-medium">
                          {topic.topic}
                        </div>
                        <div className="flex-1 mx-4">
                          <ProgressBar 
                            value={topic.score} 
                            animate={contentVisible} 
                            delay={1200 + index * 150}
                            color={topic.color as 'success' | 'warning' | 'error'}
                            glow={true}
                            gradient={true}
                          />
                        </div>
                        <div className="w-12 text-small font-bold text-gray-900">
                          <CountUpNumber end={topic.score} duration={1000} delay={1400 + index * 150} suffix="%" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center space-x-6 text-small animate-fade-in-up" style={{ animationDelay: '2200ms' }}>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full mr-2"></div>
                      <span className="text-neutral">Mastered (80-100%)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mr-2"></div>
                      <span className="text-neutral">In Progress (60-79%)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full mr-2"></div>
                      <span className="text-neutral">Needs Focus (&lt;60%)</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <i className="ri-bar-chart-line text-4xl mb-2"></i>
                  <p>Start practicing to see your performance by topic</p>
                </div>
              )}
            </Card>
          </div>

          {/* Weakness Spotlight */}
          <div>
            <Card 
              className="border-2 border-red-200/50 scroll-reveal" 
              delay={800} 
              glassmorphism={true}
              glow={true}
            >
              <div className="flex items-center mb-4">
                <i className="ri-error-warning-line text-error text-xl mr-2 animate-bounce-in"></i>
                <h2 className="text-h2 text-gray-900 animate-text-reveal">Weakness Spotlight</h2>
              </div>
              <p className="text-small text-neutral mb-4 animate-text-reveal">
                Focus on these areas to improve your overall score
              </p>
              {weakTopics.length > 0 ? (
                <div className="space-y-3">
                  {weakTopics.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50/90 to-red-100/90 backdrop-blur-sm rounded-lg card-hover-3d animate-slide-in-right" style={{ animationDelay: `${1200 + index * 200}ms` }}>
                      <div>
                        <div className="font-medium text-gray-900 text-small">{topic.name}</div>
                        <div className="text-small text-error font-semibold">
                          <CountUpNumber end={Math.round(topic.score)} duration={800} delay={1400 + index * 200} suffix="% mastery" />
                        </div>
                      </div>
                      <Button size="sm" className="text-xs px-3 py-1 btn-premium" magnetic={true} glow={true}>
                        Focus Here
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <i className="ri-checkbox-circle-line text-3xl mb-2 text-green-600"></i>
                  <p className="text-sm">Great job! No weak areas detected yet.</p>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Activity Feed */}
          <div className="lg:col-span-2">
            <Card delay={900} glassmorphism={true} glow={true} className="scroll-reveal">
              <h2 className="text-h2 text-gray-900 mb-6 animate-text-reveal">Recent Activity</h2>
              {recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 animate-slide-in-left interactive-hover" style={{ animationDelay: `${1600 + index * 150}ms` }}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.color} bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm shadow-lg`}>
                        <i className={`${activity.icon} ${activity.color} text-lg`}></i>
                      </div>
                      <div className="flex-1">
                        <p className="text-small text-gray-900 font-medium">{activity.text}</p>
                        <p className="text-xs text-neutral mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <i className="ri-time-line text-4xl mb-2"></i>
                  <p>Your recent activities will appear here</p>
                </div>
              )}
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card delay={1000} glassmorphism={true} glow={true} className="scroll-reveal">
              <h2 className="text-h2 text-gray-900 mb-6 animate-text-reveal">Quick Actions</h2>
              <div className="space-y-3">
                {inProgressTest && (
                  <Button
                    className="w-full justify-center bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                    size="lg"
                    magnetic={true}
                    glow={true}
                    onClick={() => navigate(`/practice-test/take/${inProgressTest.id}`)}
                  >
                    <i className="ri-play-line mr-2"></i>
                    Resume Test in Progress
                  </Button>
                )}
                <Button
                  className="w-full justify-center btn-premium"
                  size="lg"
                  magnetic={true}
                  glow={true}
                  onClick={handlePracticeWeakestTopic}
                  disabled={creating || !weakTopics.length}
                >
                  {creating ? (
                    <>
                      <i className="ri-loader-4-line mr-2 animate-spin"></i>
                      Starting...
                    </>
                  ) : (
                    <>
                      <i className="ri-focus-line mr-2"></i>
                      Practice Weakest Topic
                    </>
                  )}
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-center"
                  magnetic={true}
                  glow={true}
                  onClick={handleStartFullMock}
                  disabled={creating}
                >
                  <i className="ri-file-text-line mr-2"></i>
                  Start Full Mock
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-center"
                  magnetic={true}
                  glow={true}
                  onClick={handleContinueStudying}
                  disabled={creating}
                >
                  <i className="ri-play-circle-line mr-2"></i>
                  Continue Studying
                </Button>
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-br from-blue-50/90 to-blue-100/90 backdrop-blur-sm rounded-lg animate-scale-in float-animation" style={{ animationDelay: '2000ms' }}>
                <h3 className="font-semibold text-gray-900 mb-2 animate-text-reveal">Exam Countdown</h3>
                <div className="text-3xl font-bold text-primary mb-1 animate-number-count">
                  <CountUpNumber end={dashboardData?.days_until_exam || 0} duration={1200} delay={2200} />
                  <span> Days</span>
                </div>
                <p className="text-small text-neutral animate-text-reveal">Until your scheduled exam date</p>
                {dashboardData?.days_until_exam && (
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full animate-progress-fill" 
                      style={{ 
                        width: `${Math.min(100, ((180 - dashboardData.days_until_exam) / 180) * 100)}%`, 
                        animationDelay: '2400ms' 
                      }}
                    ></div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>

      <MobileNavigation />
    </div>
  );
}

// Helper function to format relative time
function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}
