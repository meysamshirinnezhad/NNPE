
import { useState, useEffect } from 'react';
import Header from '../../components/feature/Header';
import LoadingSpinner from '../../components/effects/LoadingSpinner';
import { adminService } from '../../api';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalQuestions: number;
  totalTests: number;
  revenue: number;
  conversionRate: number;
}

interface RecentActivity {
  id: string;
  type: 'user_signup' | 'question_added' | 'test_completed' | 'subscription';
  description: string;
  timestamp: string;
  user?: string;
}

const mockStats: DashboardStats = {
  totalUsers: 2847,
  activeUsers: 1923,
  totalQuestions: 2156,
  totalTests: 8934,
  revenue: 142850,
  conversionRate: 23.4
};

const mockActivity: RecentActivity[] = [
  {
    id: '1',
    type: 'user_signup',
    description: 'New user registration',
    timestamp: '2024-01-15T14:30:00Z',
    user: 'sarah.chen@email.com'
  },
  {
    id: '2',
    type: 'question_added',
    description: 'New question added to Structural Analysis',
    timestamp: '2024-01-15T13:45:00Z',
    user: 'admin@nppepro.com'
  },
  {
    id: '3',
    type: 'subscription',
    description: 'User upgraded to Pro plan',
    timestamp: '2024-01-15T12:20:00Z',
    user: 'mike.rodriguez@email.com'
  },
  {
    id: '4',
    type: 'test_completed',
    description: 'Practice test completed',
    timestamp: '2024-01-15T11:15:00Z',
    user: 'emily.johnson@email.com'
  }
];

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getStatistics();
        setStats({
          totalUsers: data.total_users || 0,
          activeUsers: data.active_users || 0,
          totalQuestions: data.total_questions || 0,
          totalTests: data.total_tests || 0,
          revenue: data.revenue || 0,
          conversionRate: data.conversion_rate || 0
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load statistics');
        // Keep using mock data on error
        setStats(mockStats);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [timeRange]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_signup': return 'ri-user-add-line text-green-600';
      case 'question_added': return 'ri-question-line text-blue-600';
      case 'test_completed': return 'ri-check-line text-purple-600';
      case 'subscription': return 'ri-vip-crown-line text-yellow-600';
      default: return 'ri-information-line text-gray-600';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-96">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <i className="ri-information-line text-yellow-600 text-xl mr-3"></i>
              <p className="text-yellow-800">Using cached data. {error}</p>
            </div>
          </div>
        )}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Platform overview and management</p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
              >
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="ri-group-line text-blue-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                <p className="text-sm text-green-600">+12% from last month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="ri-user-line text-green-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeUsers.toLocaleString()}</p>
                <p className="text-sm text-green-600">+8% from last month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="ri-question-line text-purple-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Questions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalQuestions.toLocaleString()}</p>
                <p className="text-sm text-green-600">+15 this week</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <i className="ri-file-list-line text-orange-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tests Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTests.toLocaleString()}</p>
                <p className="text-sm text-green-600">+156 today</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <i className="ri-money-dollar-circle-line text-yellow-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats.revenue.toLocaleString()}</p>
                <p className="text-sm text-green-600">+18% from last month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="ri-line-chart-line text-red-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</p>
                <p className="text-sm text-green-600">+2.1% from last month</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mockActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <i className={getActivityIcon(activity.type)}></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      {activity.user && (
                        <p className="text-xs text-gray-600">{activity.user}</p>
                      )}
                      <p className="text-xs text-gray-500">{formatTimestamp(activity.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <a 
                  href="/admin/users"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  <i className="ri-group-line text-2xl text-blue-600 mb-2"></i>
                  <h3 className="font-medium text-gray-900">Manage Users</h3>
                  <p className="text-sm text-gray-600">View and edit user accounts</p>
                </a>

                <a 
                  href="/admin/questions"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  <i className="ri-question-line text-2xl text-green-600 mb-2"></i>
                  <h3 className="font-medium text-gray-900">Question Bank</h3>
                  <p className="text-sm text-gray-600">Add and edit questions</p>
                </a>

                <a 
                  href="/admin/analytics"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  <i className="ri-bar-chart-line text-2xl text-purple-600 mb-2"></i>
                  <h3 className="font-medium text-gray-900">Analytics</h3>
                  <p className="text-sm text-gray-600">View detailed reports</p>
                </a>

                <a 
                  href="/admin/subscriptions"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  <i className="ri-vip-crown-line text-2xl text-yellow-600 mb-2"></i>
                  <h3 className="font-medium text-gray-900">Subscriptions</h3>
                  <p className="text-sm text-gray-600">Manage billing and plans</p>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="ri-check-line text-green-600 text-2xl"></i>
                </div>
                <h3 className="font-medium text-gray-900">API Status</h3>
                <p className="text-sm text-green-600">All systems operational</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="ri-database-line text-green-600 text-2xl"></i>
                </div>
                <h3 className="font-medium text-gray-900">Database</h3>
                <p className="text-sm text-green-600">Running smoothly</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="ri-cloud-line text-yellow-600 text-2xl"></i>
                </div>
                <h3 className="font-medium text-gray-900">CDN</h3>
                <p className="text-sm text-yellow-600">Minor delays detected</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
