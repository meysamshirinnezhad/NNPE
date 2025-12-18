
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/feature/Header';
import Button from '../../components/base/Button';
import Card from '../../components/base/Card';
import LoadingSpinner from '../../components/effects/LoadingSpinner';
import { testService } from '../../api';
import type { PracticeTest as ApiPracticeTest } from '../../api/types';

interface PracticeTest {
  id: string;
  title: string;
  score?: number;
  totalQuestions: number;
  timeSpent?: number;
  completedAt?: Date;
  status: 'completed' | 'in-progress' | 'not-started';
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Mixed';
  topics: string[];
}

export default function PracticeTests() {
  const navigate = useNavigate();
  const [tests, setTests] = useState<PracticeTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'in-progress'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'title'>('date');

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const data = await testService.getTestHistory();
        const mappedTests: PracticeTest[] = data.map((test: ApiPracticeTest) => ({
          id: test.id,
          title: `Practice Test - ${test.test_type}`,
          score: test.score,
          totalQuestions: test.total_questions,
          timeSpent: Math.round(test.time_spent_seconds / 60),
          completedAt: test.completed_at ? new Date(test.completed_at) : undefined,
          status: test.status === 'in_progress' ? 'in-progress' : test.status === 'completed' ? 'completed' : 'not-started',
          difficulty: 'Mixed' as const,
          topics: ['All Topics']
        }));
        setTests(mappedTests);
      } catch (err) {
        console.error('Failed to load tests:', err);
        // Keep mock data if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  const getFilteredAndSortedTests = () => {
    let filtered = tests;
    
    if (filterStatus !== 'all') {
      filtered = tests.filter(test => test.status === filterStatus);
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return (b.score || 0) - (a.score || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'date':
        default:
          if (!a.completedAt && !b.completedAt) return 0;
          if (!a.completedAt) return 1;
          if (!b.completedAt) return -1;
          return b.completedAt.getTime() - a.completedAt.getTime();
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const handleTestAction = (test: PracticeTest) => {
    switch (test.status) {
      case 'completed':
        navigate(`/test/${test.id}/results`);
        break;
      case 'in-progress':
        navigate(`/practice-test/take/${test.id}`);
        break;
      default:
        navigate(`/practice-test/take/${test.id}`);
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

  const filteredTests = getFilteredAndSortedTests();
  const completedCount = tests.filter(t => t.status === 'completed').length;
  const inProgressCount = tests.filter(t => t.status === 'in-progress').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Practice Tests</h1>
            <p className="text-gray-600">Track your progress and review past performance</p>
          </div>
          
          <div className="mt-4 lg:mt-0">
            <Button
              onClick={() => navigate('/practice-test/new')}
              className="flex items-center space-x-2"
            >
              <i className="ri-add-line"></i>
              <span>New Practice Test</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <div className="p-6">
              <div className="text-3xl font-bold text-gray-900 mb-2">{tests.length}</div>
              <div className="text-gray-600">Total Tests</div>
            </div>
          </Card>
          <Card className="text-center">
            <div className="p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">{completedCount}</div>
              <div className="text-gray-600">Completed</div>
            </div>
          </Card>
          <Card className="text-center">
            <div className="p-6">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{inProgressCount}</div>
              <div className="text-gray-600">In Progress</div>
            </div>
          </Card>
        </div>

        {/* Filters and Sort */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 mr-2">Filter:</span>
                <Button
                  variant={filterStatus === 'all' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                >
                  All ({tests.length})
                </Button>
                <Button
                  variant={filterStatus === 'completed' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setFilterStatus('completed')}
                >
                  Completed ({completedCount})
                </Button>
                <Button
                  variant={filterStatus === 'in-progress' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setFilterStatus('in-progress')}
                >
                  In Progress ({inProgressCount})
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                >
                  <option value="date">Date</option>
                  <option value="score">Score</option>
                  <option value="title">Title</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Tests List */}
        <div className="space-y-4">
          {filteredTests.map((test) => (
            <Card key={test.id} className="hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{test.title}</h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(test.status)}`}>
                            {test.status.charAt(0).toUpperCase() + test.status.slice(1).replace('-', ' ')}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(test.difficulty)}`}>
                            {test.difficulty}
                          </span>
                          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                            {test.totalQuestions} questions
                          </span>
                        </div>
                      </div>
                      
                      {test.score !== undefined && (
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${
                            test.score >= 80 ? 'text-green-600' :
                            test.score >= 70 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {test.score}%
                          </div>
                          <div className="text-sm text-gray-500">Score</div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-1">
                        <i className="ri-bookmark-line"></i>
                        <span>Topics: {test.topics.join(', ')}</span>
                      </div>
                      {test.timeSpent && (
                        <div className="flex items-center space-x-1">
                          <i className="ri-time-line"></i>
                          <span>Time: {formatTime(test.timeSpent)}</span>
                        </div>
                      )}
                      {test.completedAt && (
                        <div className="flex items-center space-x-1">
                          <i className="ri-calendar-line"></i>
                          <span>Completed: {test.completedAt.toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 lg:mt-0 lg:ml-6">
                    {test.status === 'completed' && (
                      <>
                        <Button
                          variant="secondary"
                          onClick={() => navigate(`/test/${test.id}/review`)}
                          className="flex items-center space-x-2"
                        >
                          <i className="ri-eye-line"></i>
                          <span>Review</span>
                        </Button>
                        <Button
                          onClick={() => handleTestAction(test)}
                          className="flex items-center space-x-2"
                        >
                          <i className="ri-bar-chart-line"></i>
                          <span>Results</span>
                        </Button>
                      </>
                    )}
                    
                    {test.status === 'in-progress' && (
                      <Button
                        onClick={() => handleTestAction(test)}
                        className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700"
                      >
                        <i className="ri-play-line"></i>
                        <span>Continue</span>
                      </Button>
                    )}
                    
                    {test.status === 'not-started' && (
                      <Button
                        onClick={() => handleTestAction(test)}
                        className="flex items-center space-x-2"
                      >
                        <i className="ri-play-line"></i>
                        <span>Start Test</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredTests.length === 0 && (
          <Card className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <i className="ri-file-list-line text-6xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tests found</h3>
            <p className="text-gray-600 mb-6">
              {filterStatus === 'all' 
                ? "You haven't taken any practice tests yet."
                : `No ${filterStatus.replace('-', ' ')} tests found.`
              }
            </p>
            <Button
              onClick={() => navigate('/practice-test/new')}
              className="flex items-center space-x-2"
            >
              <i className="ri-add-line"></i>
              <span>Create Your First Test</span>
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
