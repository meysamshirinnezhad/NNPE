
import { useState } from 'react';
import Header from '../../components/feature/Header';

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  members: number;
  maxMembers: number;
  examDate: string;
  topics: string[];
  meetingSchedule: string;
  isPrivate: boolean;
  creator: string;
  createdAt: string;
  lastActivity: string;
  avatar: string;
}

const mockStudyGroups: StudyGroup[] = [
  {
    id: '1',
    name: 'NPPE April 2024 Study Group',
    description: 'Focused study group for engineers taking the NPPE in April 2024. We meet twice weekly for practice sessions and discussion.',
    members: 12,
    maxMembers: 15,
    examDate: '2024-04-15',
    topics: ['Structural Analysis', 'Concrete Design', 'Steel Design'],
    meetingSchedule: 'Tuesdays & Thursdays, 7:00 PM EST',
    isPrivate: false,
    creator: 'Sarah Chen',
    createdAt: '2024-01-10',
    lastActivity: '2024-01-15T14:30:00Z',
    avatar: 'https://readdy.ai/api/search-image?query=engineering%20study%20group%20meeting%20with%20blueprints%20and%20calculators%20on%20table%2C%20professional%20collaborative%20environment&width=300&height=200&seq=group1&orientation=landscape'
  },
  {
    id: '2',
    name: 'Geotechnical Masters',
    description: 'Deep dive into geotechnical engineering concepts. Perfect for those struggling with soil mechanics and foundation design.',
    members: 8,
    maxMembers: 12,
    examDate: '2024-04-15',
    topics: ['Geotechnical Engineering', 'Foundation Design'],
    meetingSchedule: 'Saturdays, 10:00 AM EST',
    isPrivate: false,
    creator: 'Mike Rodriguez',
    createdAt: '2024-01-08',
    lastActivity: '2024-01-15T10:15:00Z',
    avatar: 'https://readdy.ai/api/search-image?query=geotechnical%20engineering%20study%20session%20with%20soil%20samples%20and%20foundation%20models%2C%20educational%20setting&width=300&height=200&seq=group2&orientation=landscape'
  },
  {
    id: '3',
    name: 'Structural Analysis Intensive',
    description: 'Intensive practice sessions focusing on structural analysis methods. We work through complex problems together.',
    members: 15,
    maxMembers: 15,
    examDate: '2024-04-15',
    topics: ['Structural Analysis', 'Moment Distribution', 'Matrix Methods'],
    meetingSchedule: 'Sundays, 2:00 PM EST',
    isPrivate: true,
    creator: 'Dr. Jennifer Liu',
    createdAt: '2024-01-05',
    lastActivity: '2024-01-15T16:45:00Z',
    avatar: 'https://readdy.ai/api/search-image?query=structural%20engineering%20study%20group%20with%20beam%20diagrams%20and%20structural%20models%2C%20academic%20environment&width=300&height=200&seq=group3&orientation=landscape'
  },
  {
    id: '4',
    name: 'Transportation & Traffic',
    description: 'Study group focused on transportation engineering and traffic analysis. Great for highway and traffic engineers.',
    members: 6,
    maxMembers: 10,
    examDate: '2024-04-15',
    topics: ['Transportation Engineering', 'Traffic Analysis', 'Pavement Design'],
    meetingSchedule: 'Wednesdays, 6:30 PM EST',
    isPrivate: false,
    creator: 'Alex Thompson',
    createdAt: '2024-01-12',
    lastActivity: '2024-01-15T18:20:00Z',
    avatar: 'https://readdy.ai/api/search-image?query=transportation%20engineering%20study%20group%20with%20traffic%20flow%20diagrams%20and%20road%20design%20plans%2C%20professional%20setting&width=300&height=200&seq=group4&orientation=landscape'
  }
];

export default function StudyGroups() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');

  const topics = ['All Topics', 'Structural Analysis', 'Concrete Design', 'Steel Design', 'Geotechnical Engineering', 'Transportation Engineering', 'Water Resources', 'Environmental Engineering'];

  const filteredGroups = mockStudyGroups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic = !selectedTopic || selectedTopic === 'All Topics' || 
                        group.topics.some(topic => topic.includes(selectedTopic));
    return matchesSearch && matchesTopic;
  });

  const handleJoinGroup = (groupId: string) => {
    console.log('Joining group:', groupId);
    // Handle join group logic
  };

  const handleCreateGroup = () => {
    if (newGroupName.trim() && newGroupDescription.trim()) {
      console.log('Creating group:', { name: newGroupName, description: newGroupDescription });
      setNewGroupName('');
      setNewGroupDescription('');
      setShowCreateForm(false);
    }
  };

  const formatLastActivity = (timestamp: string) => {
    const now = new Date();
    const activity = new Date(timestamp);
    const diffHours = Math.floor((now.getTime() - activity.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Active now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Groups</h1>
              <p className="text-gray-600">Join or create study groups to collaborate with fellow engineers</p>
            </div>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              Create Group
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Groups</label>
              <div className="relative">
                <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or description..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Topic</label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
              >
                {topics.map((topic) => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Create Group Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Study Group</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Enter group name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    placeholder="Describe your study group..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateGroup}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  Create Group
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Study Groups Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredGroups.map((group) => (
            <div key={group.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <img 
                src={group.avatar} 
                alt={group.name}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{group.name}</h3>
                    <p className="text-sm text-gray-600">Created by {group.creator}</p>
                  </div>
                  {group.isPrivate && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      Private
                    </span>
                  )}
                </div>

                <p className="text-gray-700 text-sm mb-4 line-clamp-3">{group.description}</p>

                {/* Topics */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {group.topics.slice(0, 3).map((topic) => (
                    <span key={topic} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {topic}
                    </span>
                  ))}
                  {group.topics.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{group.topics.length - 3} more
                    </span>
                  )}
                </div>

                {/* Group Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <i className="ri-group-line mr-2"></i>
                    <span>{group.members}/{group.maxMembers} members</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <i className="ri-calendar-line mr-2"></i>
                    <span>{group.meetingSchedule}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <i className="ri-time-line mr-2"></i>
                    <span>Last active: {formatLastActivity(group.lastActivity)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Exam: {new Date(group.examDate).toLocaleDateString()}
                  </div>
                  <button 
                    onClick={() => handleJoinGroup(group.id)}
                    disabled={group.members >= group.maxMembers}
                    className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                      group.members >= group.maxMembers
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {group.members >= group.maxMembers ? 'Full' : 'Join Group'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredGroups.length === 0 && (
          <div className="text-center py-12">
            <i className="ri-group-line text-4xl text-gray-400 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No study groups found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or create a new group</p>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              Create Your First Group
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
