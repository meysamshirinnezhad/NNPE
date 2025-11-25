
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/feature/Header';
import MobileNavigation from '../../components/feature/MobileNavigation';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import CircularProgress from '../../components/base/CircularProgress';
import LoadingSpinner from '../../components/effects/LoadingSpinner';
import { updateSEO } from '../../utils/seo';
import { questionService } from '../../api';
import type { Topic } from '../../api/types';

export default function Topics() {
  const [selectedView, setSelectedView] = useState<'grid' | 'list'>('grid');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    updateSEO({
      title: 'Topics - NPPE Pro',
      description: 'Browse NPPE exam topics',
      keywords: 'topics, NPPE, exam topics',
      canonical: '/topics'
    });
  }, []);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await questionService.getTopics();
        setTopics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load topics');
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  const topicIcons: { [key: string]: string } = {
    'Professional Practice': 'ri-user-star-line',
    'Ethics': 'ri-scales-line',
    'Engineering Law': 'ri-scales-3-line',
    'Liability': 'ri-shield-line',
    'Contracts': 'ri-file-text-line',
    'Sustainability': 'ri-leaf-line',
    'Project Management': 'ri-briefcase-line',
    'Leadership': 'ri-team-line'
  };

  const topicColors = ['blue', 'green', 'purple', 'orange', 'red', 'emerald', 'indigo', 'pink'];



  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      purple: 'text-purple-600 bg-purple-100',
      orange: 'text-orange-600 bg-orange-100',
      red: 'text-red-600 bg-red-100',
      emerald: 'text-emerald-600 bg-emerald-100',
      indigo: 'text-indigo-600 bg-indigo-100',
      pink: 'text-pink-600 bg-pink-100'
    };
    return colorMap[color] || 'text-gray-600 bg-gray-100';
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            NPPE Topics Overview
          </h1>
          <p className="text-gray-600">
            Track your progress across all 8 core topics of the NPPE exam.
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ri-question-line text-blue-600 text-xl"></i>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {topics.length}
            </div>
            <div className="text-sm text-gray-600">Total Topics</div>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ri-trophy-line text-green-600 text-xl"></i>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {Math.round(topics.reduce((sum, t) => sum + (t.weight || 0), 0))}%
            </div>
            <div className="text-sm text-gray-600">Coverage</div>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ri-book-line text-purple-600 text-xl"></i>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              Study
            </div>
            <div className="text-sm text-gray-600">All Topics</div>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ri-target-line text-orange-600 text-xl"></i>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              100%
            </div>
            <div className="text-sm text-gray-600">Exam Coverage</div>
          </Card>
        </div>

        {/* View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">All Topics</h2>
            <span className="text-sm text-gray-500">{topics.length} topics</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedView('grid')}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                selectedView === 'grid' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <i className="ri-grid-line text-lg"></i>
            </button>
            <button
              onClick={() => setSelectedView('list')}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                selectedView === 'list' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <i className="ri-list-check text-lg"></i>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
        {/* Topics Grid/List */}
        {selectedView === 'grid' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {topics.map((topic, index) => (
              <div key={topic.id} onClick={() => navigate(`/topics/detail?id=${topic.id}`)}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-center mb-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${getColorClasses(topicColors[index % topicColors.length])}`}>
                    <i className={`${topicIcons[topic.name] || 'ri-book-line'} text-2xl`}></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {topic.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {topic.description}
                  </p>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-center mb-2">
                    <CircularProgress
                      value={topic.weight}
                      size={80}
                      strokeWidth={8}
                      animate={true}
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-blue-600">
                      {topic.weight}% Exam Weight
                    </div>
                    <div className="text-xs text-gray-500">
                      {topic.code}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/practice?topic=${topic.id}`);
                    }}
                  >
                    Study Topic
                  </Button>
                </div>
              </Card>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {topics.map((topic, index) => (
              <div key={topic.id} onClick={() => navigate(`/topics/detail?id=${topic.id}`)}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(topicColors[index % topicColors.length])}`}>
                      <i className={`${topicIcons[topic.name] || 'ri-book-line'} text-xl`}></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {topic.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {topic.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Code: {topic.code}</span>
                        <span>Weight: {topic.weight}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="flex flex-col space-y-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/topics/detail?id=${topic.id}`);
                        }}
                      >
                        Details
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/practice?topic=${topic.id}`);
                        }}
                      >
                        Practice
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
              </div>
            ))}
          </div>
        )}

        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-blue-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <i className="ri-lightbulb-line mr-2"></i>
            Study Recommendations
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Exam Topics</h4>
              <ul className="space-y-2">
                {topics.slice(0, 3).map((topic) => (
                  <li key={topic.id} className="flex items-center text-sm">
                    <i className={`${topicIcons[topic.name] || 'ri-book-line'} mr-2 text-blue-600`}></i>
                    <span className="text-gray-700">{topic.name} - {topic.weight}% weight</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Next Steps</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Complete practice questions in all topics</li>
                <li>• Focus on high-weight topics first</li>
                <li>• Take topic-specific practice tests</li>
                <li>• Review materials for challenging subjects</li>
              </ul>
            </div>
          </div>
        </Card>
        </>
        )}
      </main>

      <MobileNavigation />
    </div>
  );
}
