
import { useState } from 'react';
import Header from '../../../components/feature/Header';

interface Subscription {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  plan: 'basic' | 'pro' | 'premium';
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  startDate: string;
  endDate: string;
  amount: number;
  paymentMethod: string;
  lastPayment: string;
  nextBilling: string;
}

const mockSubscriptions: Subscription[] = [
  {
    id: 'SUB-001',
    userId: 'USR-001',
    userName: 'Sarah Chen',
    userEmail: 'sarah.chen@email.com',
    plan: 'pro',
    status: 'active',
    startDate: '2024-01-10',
    endDate: '2024-02-10',
    amount: 49,
    paymentMethod: 'Visa ****4242',
    lastPayment: '2024-01-10',
    nextBilling: '2024-02-10'
  },
  {
    id: 'SUB-002',
    userId: 'USR-002',
    userName: 'Mike Rodriguez',
    userEmail: 'mike.rodriguez@email.com',
    plan: 'premium',
    status: 'active',
    startDate: '2024-01-08',
    endDate: '2024-02-08',
    amount: 79,
    paymentMethod: 'Mastercard ****8765',
    lastPayment: '2024-01-08',
    nextBilling: '2024-02-08'
  },
  {
    id: 'SUB-003',
    userId: 'USR-003',
    userName: 'Emily Johnson',
    userEmail: 'emily.johnson@email.com',
    plan: 'basic',
    status: 'cancelled',
    startDate: '2023-12-15',
    endDate: '2024-01-15',
    amount: 29,
    paymentMethod: 'Visa ****1234',
    lastPayment: '2023-12-15',
    nextBilling: '-'
  },
  {
    id: 'SUB-004',
    userId: 'USR-004',
    userName: 'David Kim',
    userEmail: 'david.kim@email.com',
    plan: 'pro',
    status: 'trial',
    startDate: '2024-01-12',
    endDate: '2024-01-19',
    amount: 0,
    paymentMethod: '-',
    lastPayment: '-',
    nextBilling: '2024-01-19'
  }
];

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState(mockSubscriptions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<string[]>([]);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  const plans = ['all', 'basic', 'pro', 'premium'];
  const statuses = ['all', 'active', 'cancelled', 'expired', 'trial'];

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === 'all' || sub.plan === filterPlan;
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const handleSelectSubscription = (subId: string) => {
    setSelectedSubscriptions(prev => 
      prev.includes(subId) 
        ? prev.filter(id => id !== subId)
        : [...prev, subId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSubscriptions.length === filteredSubscriptions.length) {
      setSelectedSubscriptions([]);
    } else {
      setSelectedSubscriptions(filteredSubscriptions.map(sub => sub.id));
    }
  };

  const handleStatusChange = (subId: string, newStatus: string) => {
    setSubscriptions(prev => prev.map(sub => 
      sub.id === subId 
        ? { ...sub, status: newStatus as Subscription['status'] }
        : sub
    ));
  };

  const handleRefund = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setShowRefundModal(true);
  };

  const processRefund = () => {
    if (selectedSubscription) {
      console.log('Processing refund for:', selectedSubscription.id);
      setShowRefundModal(false);
      setSelectedSubscription(null);
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'pro': return 'bg-purple-100 text-purple-800';
      case 'premium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'trial': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalRevenue = subscriptions
    .filter(sub => sub.status === 'active')
    .reduce((sum, sub) => sum + sub.amount, 0);

  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active').length;
  const trialUsers = subscriptions.filter(sub => sub.status === 'trial').length;
  const churnRate = (subscriptions.filter(sub => sub.status === 'cancelled').length / subscriptions.length * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Management</h1>
          <p className="text-gray-600">Manage user subscriptions and billing</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="ri-money-dollar-circle-line text-green-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="ri-user-line text-blue-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                <p className="text-2xl font-bold text-gray-900">{activeSubscriptions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="ri-time-line text-purple-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Trial Users</p>
                <p className="text-2xl font-bold text-gray-900">{trialUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="ri-arrow-down-line text-red-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Churn Rate</p>
                <p className="text-2xl font-bold text-gray-900">{churnRate}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Subscriptions ({filteredSubscriptions.length})</h2>
              <div className="flex space-x-3">
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
                  Export CSV
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
                  Send Notifications
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search subscriptions..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plan</label>
                <select
                  value={filterPlan}
                  onChange={(e) => setFilterPlan(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                >
                  {plans.map((plan) => (
                    <option key={plan} value={plan}>
                      {plan === 'all' ? 'All Plans' : plan.charAt(0).toUpperCase() + plan.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
                  Clear Filters
                </button>
              </div>
            </div>

            {selectedSubscriptions.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                <span className="text-sm text-blue-800">
                  {selectedSubscriptions.length} subscription(s) selected
                </span>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors whitespace-nowrap">
                    Bulk Action
                  </button>
                  <button className="px-3 py-1 border border-blue-300 text-blue-700 rounded text-sm hover:bg-blue-100 transition-colors whitespace-nowrap">
                    Send Email
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedSubscriptions.length === filteredSubscriptions.length && filteredSubscriptions.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Next Billing
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubscriptions.map((subscription) => (
                    <tr key={subscription.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedSubscriptions.includes(subscription.id)}
                          onChange={() => handleSelectSubscription(subscription.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{subscription.userName}</div>
                          <div className="text-sm text-gray-600">{subscription.userEmail}</div>
                          <div className="text-xs text-gray-500">{subscription.id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPlanColor(subscription.plan)}`}>
                          {subscription.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={subscription.status}
                          onChange={(e) => handleStatusChange(subscription.id, e.target.value)}
                          className={`px-2 py-1 text-xs font-medium rounded-full border-0 ${getStatusColor(subscription.status)} pr-8`}
                        >
                          <option value="active">Active</option>
                          <option value="trial">Trial</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="expired">Expired</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {subscription.amount > 0 ? `$${subscription.amount}/mo` : 'Free'}
                        </div>
                        <div className="text-xs text-gray-500">{subscription.paymentMethod}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {subscription.nextBilling !== '-' 
                          ? new Date(subscription.nextBilling).toLocaleDateString()
                          : '-'
                        }
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800 text-sm">
                            View
                          </button>
                          <button className="text-green-600 hover:text-green-800 text-sm">
                            Extend
                          </button>
                          <button 
                            onClick={() => handleRefund(subscription)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Refund
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredSubscriptions.length === 0 && (
              <div className="text-center py-8">
                <i className="ri-bill-line text-4xl text-gray-400 mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions found</h3>
                <p className="text-gray-600">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </div>

        {/* Refund Modal */}
        {showRefundModal && selectedSubscription && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Process Refund</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">User: {selectedSubscription.userName}</p>
                  <p className="text-sm text-gray-600">Plan: {selectedSubscription.plan}</p>
                  <p className="text-sm text-gray-600">Amount: ${selectedSubscription.amount}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Refund Reason</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8">
                    <option value="">Select reason</option>
                    <option value="customer-request">Customer Request</option>
                    <option value="billing-error">Billing Error</option>
                    <option value="service-issue">Service Issue</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Additional notes..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  onClick={() => setShowRefundModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  Cancel
                </button>
                <button 
                  onClick={processRefund}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                >
                  Process Refund
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
