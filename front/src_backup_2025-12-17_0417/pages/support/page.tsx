
import { useState } from 'react';
import Header from '../../components/feature/Header';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface Ticket {
  id: string;
  subject: string;
  status: 'open' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  lastUpdate: string;
}

const mockFAQs: FAQ[] = [
  {
    id: '1',
    question: 'How do I reset my password?',
    answer: 'You can reset your password by clicking the "Forgot Password" link on the login page. Enter your email address and we\'ll send you a reset link.',
    category: 'Account'
  },
  {
    id: '2',
    question: 'What topics are covered in the NPPE exam?',
    answer: 'The NPPE covers 8 main areas: Structural Analysis, Concrete Design, Steel Design, Geotechnical Engineering, Transportation Engineering, Water Resources, Environmental Engineering, and Construction Management.',
    category: 'Exam'
  },
  {
    id: '3',
    question: 'How many practice questions are available?',
    answer: 'We have over 2,000 practice questions covering all NPPE topics. Pro and Premium subscribers get unlimited access to all questions.',
    category: 'Practice'
  },
  {
    id: '4',
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes, you can cancel your subscription at any time from your account settings. You\'ll continue to have access until the end of your current billing period.',
    category: 'Billing'
  }
];

const mockTickets: Ticket[] = [
  {
    id: 'TKT-001',
    subject: 'Unable to access practice tests',
    status: 'in-progress',
    priority: 'medium',
    createdAt: '2024-01-14',
    lastUpdate: '2024-01-15T10:30:00Z'
  },
  {
    id: 'TKT-002',
    subject: 'Question about billing cycle',
    status: 'resolved',
    priority: 'low',
    createdAt: '2024-01-10',
    lastUpdate: '2024-01-12T14:20:00Z'
  }
];

export default function Support() {
  const [activeTab, setActiveTab] = useState('faq');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: '',
    priority: 'medium',
    description: ''
  });

  const categories = ['All', 'Account', 'Exam', 'Practice', 'Billing', 'Technical'];

  const filteredFAQs = mockFAQs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmitTicket = () => {
    if (ticketForm.subject && ticketForm.description) {
      console.log('Submitting ticket:', ticketForm);
      setTicketForm({ subject: '', category: '', priority: 'medium', description: '' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Support Center</h1>
          <p className="text-gray-600">Get help with your NPPE Pro account and exam preparation</p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'faq', label: 'FAQ', icon: 'ri-question-line' },
                { id: 'tickets', label: 'My Tickets', icon: 'ri-ticket-line' },
                { id: 'contact', label: 'Contact Us', icon: 'ri-mail-line' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <i className={tab.icon}></i>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'faq' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search FAQs</label>
                    <div className="relative">
                      <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search for answers..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredFAQs.map((faq) => (
                    <div key={faq.id} className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                        className="w-full px-4 py-4 text-left flex items-center justify-between hover:bg-gray-50"
                      >
                        <span className="font-medium text-gray-900">{faq.question}</span>
                        <i className={`ri-arrow-${expandedFAQ === faq.id ? 'up' : 'down'}-s-line text-gray-400`}></i>
                      </button>
                      {expandedFAQ === faq.id && (
                        <div className="px-4 pb-4 border-t border-gray-200">
                          <p className="text-gray-700 mt-3">{faq.answer}</p>
                          <div className="mt-3">
                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {faq.category}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {filteredFAQs.length === 0 && (
                  <div className="text-center py-8">
                    <i className="ri-search-line text-4xl text-gray-400 mb-4"></i>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs found</h3>
                    <p className="text-gray-600">Try adjusting your search terms or browse all categories</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tickets' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Support Tickets</h3>
                  <button 
                    onClick={() => setActiveTab('contact')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    New Ticket
                  </button>
                </div>

                {mockTickets.length > 0 ? (
                  <div className="space-y-4">
                    {mockTickets.map((ticket) => (
                      <div key={ticket.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{ticket.subject}</h4>
                          <div className="flex space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                              {ticket.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Ticket #{ticket.id}</span>
                          <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                          <span>Updated: {new Date(ticket.lastUpdate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="ri-ticket-line text-4xl text-gray-400 mb-4"></i>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No support tickets</h3>
                    <p className="text-gray-600 mb-4">You haven't submitted any support tickets yet</p>
                    <button 
                      onClick={() => setActiveTab('contact')}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                      Submit Your First Ticket
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit a Support Ticket</h3>
                  <p className="text-gray-600 mb-6">Can't find what you're looking for? Send us a message and we'll get back to you within 24 hours.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                    <input
                      type="text"
                      value={ticketForm.subject}
                      onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                      placeholder="Brief description of your issue"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={ticketForm.category}
                      onChange={(e) => setTicketForm({...ticketForm, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                    >
                      <option value="">Select a category</option>
                      <option value="account">Account Issues</option>
                      <option value="billing">Billing & Subscription</option>
                      <option value="technical">Technical Problems</option>
                      <option value="content">Content & Questions</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <div className="flex space-x-4">
                    {['low', 'medium', 'high'].map((priority) => (
                      <label key={priority} className="flex items-center">
                        <input
                          type="radio"
                          name="priority"
                          value={priority}
                          checked={ticketForm.priority === priority}
                          onChange={(e) => setTicketForm({...ticketForm, priority: e.target.value})}
                          className="mr-2"
                        />
                        <span className="capitalize">{priority}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})}
                    placeholder="Please provide detailed information about your issue..."
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button 
                    onClick={handleSubmitTicket}
                    disabled={!ticketForm.subject || !ticketForm.description}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                  >
                    Submit Ticket
                  </button>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Other Ways to Reach Us</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border border-gray-200 rounded-lg">
                      <i className="ri-mail-line text-2xl text-blue-600 mb-2"></i>
                      <h5 className="font-medium text-gray-900">Email</h5>
                      <p className="text-sm text-gray-600">support@nppepro.com</p>
                    </div>
                    <div className="text-center p-4 border border-gray-200 rounded-lg">
                      <i className="ri-chat-3-line text-2xl text-blue-600 mb-2"></i>
                      <h5 className="font-medium text-gray-900">Live Chat</h5>
                      <p className="text-sm text-gray-600">Available 9 AM - 6 PM EST</p>
                    </div>
                    <div className="text-center p-4 border border-gray-200 rounded-lg">
                      <i className="ri-phone-line text-2xl text-blue-600 mb-2"></i>
                      <h5 className="font-medium text-gray-900">Phone</h5>
                      <p className="text-sm text-gray-600">1-800-NPPE-PRO</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
