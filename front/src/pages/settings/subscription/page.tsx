
import { useState, useEffect } from 'react';
import Header from '../../../components/feature/Header';
import LoadingSpinner from '../../../components/effects/LoadingSpinner';
import { userService } from '../../../api';

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
}

interface BillingHistory {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  invoice: string;
}

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 29,
    interval: 'month',
    features: [
      '500 practice questions',
      'Basic analytics',
      'Email support',
      'Mobile app access'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49,
    interval: 'month',
    features: [
      'Unlimited practice questions',
      'Advanced analytics',
      'Priority support',
      'Study groups',
      'Practice tests',
      'Weakness analysis'
    ],
    popular: true
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 79,
    interval: 'month',
    features: [
      'Everything in Pro',
      '1-on-1 tutoring sessions',
      'Custom study plans',
      'Exam guarantee',
      'Premium support'
    ]
  }
];

const mockBillingHistory: BillingHistory[] = [
  {
    id: '1',
    date: '2024-01-15',
    amount: 49,
    status: 'paid',
    invoice: 'INV-2024-001'
  },
  {
    id: '2',
    date: '2023-12-15',
    amount: 49,
    status: 'paid',
    invoice: 'INV-2023-012'
  },
  {
    id: '3',
    date: '2023-11-15',
    amount: 49,
    status: 'paid',
    invoice: 'INV-2023-011'
  }
];

export default function Subscription() {
  const [, setSubscription] = useState<any>(null);
  const [currentPlan, setCurrentPlan] = useState('pro');
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const data = await userService.getSubscription();
        setSubscription(data);
        setCurrentPlan(data.plan || 'pro');
        // Map API interval to local state
        setBillingInterval((data as any).interval === 'annual' ? 'year' : 'month');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load subscription');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const getCurrentPlan = () => plans.find(plan => plan.id === currentPlan);
  const currentPlanData = getCurrentPlan();

  const handlePlanChange = async (planId: string) => {
    setError('');
    setSuccessMessage('');
    try {
      // In a real app, you would collect payment method first
      await userService.createSubscription({
        plan: billingInterval === 'year' ? 'annual' : 'monthly',
        payment_method_id: 'pm_placeholder' // This would come from Stripe in production
      });
      setCurrentPlan(planId);
      setSuccessMessage('Subscription updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change plan');
    }
  };

  const handleCancelSubscription = async () => {
    setError('');
    try {
      await userService.cancelSubscription();
      setSuccessMessage('Subscription cancelled successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowCancelModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <i className="ri-error-warning-line text-red-600 text-xl mr-3"></i>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}
        
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <i className="ri-check-line text-green-600 text-xl mr-3"></i>
              <p className="text-green-800">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription & Billing</h1>
          <p className="text-gray-600">Manage your subscription and billing information</p>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <a href="/settings/account" className="text-gray-500 hover:text-gray-700 pb-2">
              Account
            </a>
            <a href="/settings/subscription" className="border-b-2 border-blue-500 text-blue-600 pb-2 font-medium">
              Subscription
            </a>
            <a href="/settings/notifications" className="text-gray-500 hover:text-gray-700 pb-2">
              Notifications
            </a>
          </nav>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
        {/* Current Subscription */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Current Subscription</h2>
          </div>
          <div className="p-6">
            {currentPlanData && (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{currentPlanData.name} Plan</h3>
                  <p className="text-gray-600 mt-1">
                    ${currentPlanData.price}/{currentPlanData.interval}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Next billing date: February 15, 2024
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
                    Update Payment Method
                  </button>
                  <button 
                    onClick={() => setShowCancelModal(true)}
                    className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors whitespace-nowrap"
                  >
                    Cancel Subscription
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Plan Options */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Change Plan</h2>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">Monthly</span>
                <button
                  onClick={() => setBillingInterval(billingInterval === 'month' ? 'year' : 'month')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    billingInterval === 'year' ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      billingInterval === 'year' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-600">Yearly (Save 20%)</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const yearlyPrice = Math.round(plan.price * 12 * 0.8);
                const displayPrice = billingInterval === 'year' ? yearlyPrice : plan.price;
                const isCurrentPlan = plan.id === currentPlan;
                
                return (
                  <div 
                    key={plan.id} 
                    className={`border rounded-lg p-6 relative ${
                      plan.popular ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                    } ${isCurrentPlan ? 'bg-blue-50' : 'bg-white'}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                      <div className="mt-2">
                        <span className="text-3xl font-bold text-gray-900">${displayPrice}</span>
                        <span className="text-gray-600">/{billingInterval}</span>
                      </div>
                      {billingInterval === 'year' && (
                        <p className="text-sm text-green-600 mt-1">Save 20%</p>
                      )}
                    </div>
                    
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <i className="ri-check-line text-green-600 mr-2"></i>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <button
                      onClick={() => handlePlanChange(plan.id)}
                      disabled={isCurrentPlan}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors whitespace-nowrap ${
                        isCurrentPlan
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : plan.popular
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {isCurrentPlan ? 'Current Plan' : 'Upgrade'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Payment Method</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <i className="ri-bank-card-line text-white"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
                  <p className="text-sm text-gray-600">Expires 12/25</p>
                </div>
              </div>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
                Update
              </button>
            </div>
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Billing History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockBillingHistory.map((bill) => (
                  <tr key={bill.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(bill.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${bill.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(bill.status)}`}>
                        {bill.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-800">
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </>
        )}

        {/* Cancel Subscription Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Subscription</h3>
              <p className="text-gray-700 mb-6">
                Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your current billing period.
              </p>
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  Keep Subscription
                </button>
                <button 
                  onClick={handleCancelSubscription}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                >
                  Cancel Subscription
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
