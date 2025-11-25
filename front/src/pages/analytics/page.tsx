
import { useEffect, useState } from 'react';
import Header from '../../components/feature/Header';
import MobileNavigation from '../../components/feature/MobileNavigation';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import LoadingSpinner from '../../components/effects/LoadingSpinner';
import { updateSEO } from '../../utils/seo';
import { dashboardService } from '../../api';
import type { AnalyticsData } from '../../api/types';

export default function Analytics() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [selectedMetric, setSelectedMetric] = useState('accuracy');
  const [, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    updateSEO({
      title: 'Analytics Dashboard - NPPE Pro',
      description: 'Track your progress and identify areas for improvement',
      keywords: 'analytics, progress tracking, NPPE',
      canonical: '/analytics'
    });
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await dashboardService.getAnalytics(selectedTimeRange);
        setAnalyticsData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedTimeRange]);

  const timeRanges: { id: '7d' | '30d' | '90d' | 'all', name: string }[] = [
    { id: '7d', name: 'Last 7 Days' },
    { id: '30d', name: 'Last 30 Days' },
    { id: '90d', name: 'Last 3 Months' },
    { id: 'all', name: 'All Time' }
  ];

  const overallStats = [
    {
      title: 'Questions Answered',
      value: '1,247',
      change: '+23%',
      changeType: 'positive',
      icon: 'ri-question-line',
      color: 'blue'
    },
    {
      title: 'Average Accuracy',
      value: '78%',
      change: '+5%',
      changeType: 'positive',
      icon: 'ri-target-line',
      color: 'green'
    },
    {
      title: 'Study Time',
      value: '42.5h',
      change: '+12%',
      changeType: 'positive',
      icon: 'ri-time-line',
      color: 'purple'
    },
    {
      title: 'Practice Tests',
      value: '18',
      change: '+3',
      changeType: 'positive',
      icon: 'ri-file-text-line',
      color: 'orange'
    }
  ];

  const topicPerformance = [
    { topic: 'Professional Practice', accuracy: 85, questions: 156, timeSpent: '8.2h', trend: 'up' },
    { topic: 'Ethics', accuracy: 82, questions: 142, timeSpent: '7.5h', trend: 'up' },
    { topic: 'Engineering Law', accuracy: 76, questions: 128, timeSpent: '6.8h', trend: 'stable' },
    { topic: 'Liability', accuracy: 74, questions: 118, timeSpent: '6.2h', trend: 'up' },
    { topic: 'Contracts', accuracy: 68, questions: 98, timeSpent: '5.1h', trend: 'down' },
    { topic: 'Sustainability', accuracy: 71, questions: 89, timeSpent: '4.8h', trend: 'up' },
    { topic: 'Project Management', accuracy: 65, questions: 76, timeSpent: '4.2h', trend: 'down' },
    { topic: 'Leadership', accuracy: 69, questions: 82, timeSpent: '3.9h', trend: 'stable' }
  ];

  const weeklyProgress = [
    { week: 'Week 1', questions: 45, accuracy: 72, timeSpent: 3.2 },
    { week: 'Week 2', questions: 62, accuracy: 75, timeSpent: 4.1 },
    { week: 'Week 3', questions: 58, accuracy: 78, timeSpent: 3.8 },
    { week: 'Week 4', questions: 71, accuracy: 80, timeSpent: 4.5 },
    { week: 'Week 5', questions: 69, accuracy: 82, timeSpent: 4.2 },
    { week: 'Week 6', questions: 74, accuracy: 79, timeSpent: 4.8 },
    { week: 'Week 7', questions: 68, accuracy: 81, timeSpent: 4.3 },
    { week: 'Week 8', questions: 76, accuracy: 83, timeSpent: 5.1 }
  ];

  const recentTests = [
    {
      id: 1,
      name: 'Full NPPE Simulation #5',
      date: '2024-01-15',
      score: 82,
      questions: 100,
      timeSpent: '2h 45m',
      status: 'completed'
    },
    {
      id: 2,
      name: 'Ethics Focus Test',
      date: '2024-01-12',
      score: 88,
      questions: 25,
      timeSpent: '42m',
      status: 'completed'
    },
    {
      id: 3,
      name: 'Professional Practice Quiz',
      date: '2024-01-10',
      score: 76,
      questions: 30,
      timeSpent: '38m',
      status: 'completed'
    },
    {
      id: 4,
      name: 'Mixed Topics Test',
      date: '2024-01-08',
      score: 79,
      questions: 50,
      timeSpent: '1h 15m',
      status: 'completed'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      purple: 'text-purple-600 bg-purple-100',
      orange: 'text-orange-600 bg-orange-100'
    };
    return colorMap[color] || 'text-gray-600 bg-gray-100';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return 'ri-arrow-up-line text-green-600';
      case 'down': return 'ri-arrow-down-line text-red-600';
      case 'stable': return 'ri-subtract-line text-gray-600';
      default: return 'ri-subtract-line text-gray-600';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <i className="ri-error-warning-line text-red-600 text-xl mr-3"></i>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600">
              Track your progress and identify areas for improvement.
            </p>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex items-center space-x-2">
            {timeRanges.map((range) => (
              <button
                key={range.id}
                onClick={() => setSelectedTimeRange(range.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  selectedTimeRange === range.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {range.name}
              </button>
            ))}
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {overallStats.map((stat, index) => (
            <Card key={index}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className={`flex items-center text-sm mt-1 ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <i className={`${stat.changeType === 'positive' ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} mr-1`}></i>
                    <span>{stat.change} from last period</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(stat.color)}`}>
                  <i className={`${stat.icon} text-xl`}></i>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Weekly Progress Chart */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Weekly Progress</h2>
                <div className="flex items-center space-x-2">
                  {['accuracy', 'questions', 'time'].map((metric) => (
                    <button
                      key={metric}
                      onClick={() => setSelectedMetric(metric)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                        selectedMetric === metric
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {metric.charAt(0).toUpperCase() + metric.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Simple Chart Representation */}
              <div className="space-y-4">
                {weeklyProgress.map((week, index) => {
                  const value = selectedMetric === 'accuracy' ? week.accuracy : 
                               selectedMetric === 'questions' ? week.questions : 
                               week.timeSpent;
                  const maxValue = selectedMetric === 'accuracy' ? 100 : 
                                  selectedMetric === 'questions' ? 80 : 6;
                  const percentage = (value / maxValue) * 100;
                  
                  return (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-16 text-sm text-gray-600">{week.week}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="w-12 text-sm font-medium text-gray-900">
                        {selectedMetric === 'accuracy' ? `${value}%` : 
                         selectedMetric === 'questions' ? value : 
                         `${value}h`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Recent Test Results */}
          <div>
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Tests</h2>
              <div className="space-y-4">
                {recentTests.map((test) => (
                  <div key={test.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900 text-sm">{test.name}</h3>
                      <span className={`text-lg font-bold ${getScoreColor(test.score)}`}>
                        {test.score}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span>{test.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Questions:</span>
                        <span>{test.questions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time:</span>
                        <span>{test.timeSpent}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="secondary" className="w-full mt-4">
                View All Tests
              </Button>
            </Card>
          </div>
        </div>

        {/* Topic Performance */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance by Topic</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Topic</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Accuracy</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Questions</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Time Spent</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Trend</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {topicPerformance.map((topic, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900">{topic.topic}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-semibold ${getScoreColor(topic.accuracy)}`}>
                        {topic.accuracy}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600">
                      {topic.questions}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600">
                      {topic.timeSpent}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <i className={getTrendIcon(topic.trend)}></i>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button variant="secondary" size="sm">
                        Practice
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Insights and Recommendations */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-blue-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            <i className="ri-lightbulb-line mr-2"></i>
            Insights & Recommendations
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Strengths</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <i className="ri-check-circle-line text-green-600 mr-2"></i>
                  Strong performance in Professional Practice (85% accuracy)
                </li>
                <li className="flex items-center">
                  <i className="ri-check-circle-line text-green-600 mr-2"></i>
                  Consistent improvement in Ethics over time
                </li>
                <li className="flex items-center">
                  <i className="ri-check-circle-line text-green-600 mr-2"></i>
                  Good study consistency with regular practice
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Areas for Improvement</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <i className="ri-alert-circle-line text-orange-600 mr-2"></i>
                  Focus more on Project Management (65% accuracy)
                </li>
                <li className="flex items-center">
                  <i className="ri-alert-circle-line text-orange-600 mr-2"></i>
                  Contracts topic needs additional practice
                </li>
                <li className="flex items-center">
                  <i className="ri-alert-circle-line text-orange-600 mr-2"></i>
                  Consider taking more full-length practice tests
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </main>

      <MobileNavigation />
    </div>
  );
}
