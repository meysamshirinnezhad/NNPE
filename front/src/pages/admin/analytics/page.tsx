
import { useState } from 'react';
import Header from '../../../components/feature/Header';

interface AnalyticsData {
  userGrowth: { month: string; users: number; }[];
  questionPerformance: { topic: string; accuracy: number; attempts: number; }[];
  subscriptionMetrics: { plan: string; count: number; revenue: number; }[];
  engagementMetrics: { metric: string; value: number; change: number; }[];
}

const mockAnalytics: AnalyticsData = {
  userGrowth: [
    { month: 'Jan', users: 1200 },
    { month: 'Feb', users: 1450 },
    { month: 'Mar', users: 1680 },
    { month: 'Apr', users: 1920 },
    { month: 'May', users: 2150 },
    { month: 'Jun', users: 2380 }
  ],
  questionPerformance: [
    { topic: 'Structural Analysis', accuracy: 68, attempts: 15420 },
    { topic: 'Concrete Design', accuracy: 72, attempts: 12890 },
    { topic: 'Steel Design', accuracy: 75, attempts: 11230 },
    { topic: 'Geotechnical Engineering', accuracy: 62, attempts: 9870 },
    { topic: 'Transportation Engineering', accuracy: 78, attempts: 8450 },
    { topic: 'Water Resources', accuracy: 71, attempts: 7230 },
    { topic: 'Environmental Engineering', accuracy: 74, attempts: 6890 },
    { topic: 'Construction Management', accuracy: 81, attempts: 5670 }
  ],
  subscriptionMetrics: [
    { plan: 'Free', count: 1247, revenue: 0 },
    { plan: 'Basic', count: 892, revenue: 25876 },
    { plan: 'Pro', count: 567, revenue: 27783 },
    { plan: 'Premium', count: 141, revenue: 11139 }
  ],
  engagementMetrics: [
    { metric: 'Daily Active Users', value: 1923, change: 8.2 },
    { metric: 'Avg Session Duration', value: 24, change: 12.5 },
    { metric: 'Questions per Session', value: 15, change: -2.1 },
    { metric: 'Completion Rate', value: 87, change: 5.3 }
  ]
};

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState('30d');
  // const [selectedMetric, setSelectedMetric] = useState('users');

  const totalRevenue = mockAnalytics.subscriptionMetrics.reduce((sum, plan) => sum + plan.revenue, 0);
  const totalUsers = mockAnalytics.subscriptionMetrics.reduce((sum, plan) => sum + plan.count, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
              <p className="text-gray-600">Detailed insights and performance metrics</p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {mockAnalytics.engagementMetrics.map((metric) => (
            <div key={metric.metric} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.metric}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metric.metric.includes('Duration') ? `${metric.value}m` : 
                     metric.metric.includes('Rate') ? `${metric.value}%` : 
                     metric.value.toLocaleString()}
                  </p>
                  <p className={`text-sm ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.change >= 0 ? '+' : ''}{metric.change}% from last period
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="ri-line-chart-line text-blue-600 text-xl"></i>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Growth Chart */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">User Growth</h2>
            </div>
            <div className="p-6">
              <div className="h-64 flex items-end justify-between space-x-2">
                {mockAnalytics.userGrowth.map((data) => (
                  <div key={data.month} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-blue-600 rounded-t"
                      style={{ 
                        height: `${(data.users / Math.max(...mockAnalytics.userGrowth.map(d => d.users))) * 200}px`,
                        minHeight: '20px'
                      }}
                    ></div>
                    <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                    <span className="text-xs text-gray-900 font-medium">{data.users}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Subscription Distribution */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Subscription Distribution</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mockAnalytics.subscriptionMetrics.map((plan) => {
                  const percentage = (plan.count / totalUsers) * 100;
                  return (
                    <div key={plan.plan}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{plan.plan}</span>
                        <span className="text-sm text-gray-600">{plan.count} users ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            plan.plan === 'Free' ? 'bg-gray-400' :
                            plan.plan === 'Basic' ? 'bg-blue-400' :
                            plan.plan === 'Pro' ? 'bg-purple-400' : 'bg-yellow-400'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Revenue: ${plan.revenue.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Total Revenue</span>
                  <span className="text-lg font-bold text-green-600">${totalRevenue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Question Performance Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Question Performance by Topic</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Topic
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Attempts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Average Accuracy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockAnalytics.questionPerformance.map((topic) => (
                  <tr key={topic.topic}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{topic.topic}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {topic.attempts.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {topic.accuracy}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${
                              topic.accuracy >= 75 ? 'bg-green-500' :
                              topic.accuracy >= 65 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${topic.accuracy}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{topic.accuracy}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        topic.accuracy >= 75 ? 'bg-green-100 text-green-800' :
                        topic.accuracy >= 65 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {topic.accuracy >= 75 ? 'Good' : topic.accuracy >= 65 ? 'Average' : 'Needs Review'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export Options */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <i className="ri-file-excel-line text-2xl text-green-600 mb-2"></i>
              <h4 className="font-medium text-gray-900">Excel Report</h4>
              <p className="text-sm text-gray-600">Detailed analytics in spreadsheet format</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <i className="ri-file-pdf-line text-2xl text-red-600 mb-2"></i>
              <h4 className="font-medium text-gray-900">PDF Summary</h4>
              <p className="text-sm text-gray-600">Executive summary with key insights</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <i className="ri-database-line text-2xl text-blue-600 mb-2"></i>
              <h4 className="font-medium text-gray-900">Raw Data</h4>
              <p className="text-sm text-gray-600">CSV export of all analytics data</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
