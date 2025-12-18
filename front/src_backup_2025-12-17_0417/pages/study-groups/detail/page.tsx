
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../../components/feature/Header';

interface Member {
  id: string;
  name: string;
  avatar: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: string;
  lastActive: string;
  studyStreak: number;
}

interface Message {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  avatar: string;
  type: 'message' | 'announcement' | 'resource';
}

interface StudySession {
  id: string;
  title: string;
  date: string;
  duration: string;
  topic: string;
  attendees: number;
  status: 'upcoming' | 'completed' | 'cancelled';
}

const mockMembers: Member[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20female%20engineer%20avatar%20portrait%20with%20engineering%20background%2C%20clean%20simple%20style&width=40&height=40&seq=member1&orientation=squarish',
    role: 'admin',
    joinedAt: '2024-01-10',
    lastActive: '2024-01-15T14:30:00Z',
    studyStreak: 12
  },
  {
    id: '2',
    name: 'Mike Rodriguez',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20male%20engineer%20avatar%20portrait%20with%20construction%20background%2C%20clean%20simple%20style&width=40&height=40&seq=member2&orientation=squarish',
    role: 'moderator',
    joinedAt: '2024-01-11',
    lastActive: '2024-01-15T13:15:00Z',
    studyStreak: 8
  },
  {
    id: '3',
    name: 'Emily Johnson',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20female%20engineer%20avatar%20portrait%20with%20structural%20engineering%20background%2C%20clean%20simple%20style&width=40&height=40&seq=member3&orientation=squarish',
    role: 'member',
    joinedAt: '2024-01-12',
    lastActive: '2024-01-15T12:45:00Z',
    studyStreak: 5
  }
];

const mockMessages: Message[] = [
  {
    id: '1',
    author: 'Sarah Chen',
    content: 'Welcome everyone to our NPPE study group! Let\'s start by sharing what topics you\'re most concerned about.',
    timestamp: '2024-01-15T10:00:00Z',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20female%20engineer%20avatar%20portrait%20with%20engineering%20background%2C%20clean%20simple%20style&width=40&height=40&seq=member1&orientation=squarish',
    type: 'announcement'
  },
  {
    id: '2',
    author: 'Mike Rodriguez',
    content: 'I\'ve uploaded some great resources for structural analysis. Check out the files section!',
    timestamp: '2024-01-15T11:30:00Z',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20male%20engineer%20avatar%20portrait%20with%20construction%20background%2C%20clean%20simple%20style&width=40&height=40&seq=member2&orientation=squarish',
    type: 'resource'
  },
  {
    id: '3',
    author: 'Emily Johnson',
    content: 'Thanks Mike! I\'m really struggling with moment distribution. Looking forward to our session tomorrow.',
    timestamp: '2024-01-15T12:15:00Z',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20female%20engineer%20avatar%20portrait%20with%20structural%20engineering%20background%2C%20clean%20simple%20style&width=40&height=40&seq=member3&orientation=squarish',
    type: 'message'
  }
];

const mockSessions: StudySession[] = [
  {
    id: '1',
    title: 'Structural Analysis Deep Dive',
    date: '2024-01-16T19:00:00Z',
    duration: '2 hours',
    topic: 'Moment Distribution Method',
    attendees: 8,
    status: 'upcoming'
  },
  {
    id: '2',
    title: 'Practice Problem Session',
    date: '2024-01-18T19:00:00Z',
    duration: '1.5 hours',
    topic: 'Mixed Topics Review',
    attendees: 0,
    status: 'upcoming'
  },
  {
    id: '3',
    title: 'Concrete Design Fundamentals',
    date: '2024-01-14T19:00:00Z',
    duration: '2 hours',
    topic: 'Reinforcement Design',
    attendees: 10,
    status: 'completed'
  }
];

export default function StudyGroupDetail() {
  const { } = useParams();
  const [activeTab, setActiveTab] = useState('chat');
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Handle sending message
      console.log('Sending message:', newMessage);
      setNewMessage('');
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

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement': return 'ri-megaphone-line text-blue-600';
      case 'resource': return 'ri-file-line text-green-600';
      default: return 'ri-chat-3-line text-gray-600';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'moderator': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Group Header */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">NPPE April 2024 Study Group</h1>
                <p className="text-gray-600 mb-4">
                  Focused study group for engineers taking the NPPE in April 2024. We meet twice weekly for practice sessions and discussion.
                </p>
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <i className="ri-group-line mr-1"></i>
                    <span>12 members</span>
                  </div>
                  <div className="flex items-center">
                    <i className="ri-calendar-line mr-1"></i>
                    <span>Tuesdays & Thursdays, 7:00 PM EST</span>
                  </div>
                  <div className="flex items-center">
                    <i className="ri-time-line mr-1"></i>
                    <span>Created Jan 10, 2024</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
                  Settings
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
                  Invite Members
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'chat', label: 'Chat', icon: 'ri-chat-3-line' },
                { id: 'sessions', label: 'Study Sessions', icon: 'ri-calendar-event-line' },
                { id: 'members', label: 'Members', icon: 'ri-group-line' },
                { id: 'resources', label: 'Resources', icon: 'ri-folder-line' }
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
            {/* Chat Tab */}
            {activeTab === 'chat' && (
              <div className="space-y-6">
                <div className="h-96 overflow-y-auto space-y-4 border border-gray-200 rounded-lg p-4">
                  {mockMessages.map((message) => (
                    <div key={message.id} className="flex items-start space-x-3">
                      <img 
                        src={message.avatar} 
                        alt={message.author}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">{message.author}</span>
                          <i className={getMessageTypeIcon(message.type)}></i>
                          <span className="text-xs text-gray-500">{formatTimestamp(message.timestamp)}</span>
                        </div>
                        <p className="text-gray-700 text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}

            {/* Sessions Tab */}
            {activeTab === 'sessions' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Study Sessions</h3>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
                    Schedule Session
                  </button>
                </div>
                
                {mockSessions.map((session) => (
                  <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{session.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{session.topic}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>{formatTimestamp(session.date)}</span>
                          <span>•</span>
                          <span>{session.duration}</span>
                          <span>•</span>
                          <span>{session.attendees} attending</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          session.status === 'upcoming' ? 'bg-green-100 text-green-800' :
                          session.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {session.status}
                        </span>
                        {session.status === 'upcoming' && (
                          <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors whitespace-nowrap">
                            Join
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Members Tab */}
            {activeTab === 'members' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Members ({mockMembers.length})</h3>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
                    Invite Members
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockMembers.map((member) => (
                    <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={member.avatar} 
                          alt={member.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">{member.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                              {member.role}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {member.studyStreak} day streak
                          </p>
                          <p className="text-xs text-gray-500">
                            Joined {new Date(member.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Shared Resources</h3>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
                    Upload File
                  </button>
                </div>
                
                <div className="text-center py-12">
                  <i className="ri-folder-open-line text-4xl text-gray-400 mb-4"></i>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No resources yet</h4>
                  <p className="text-gray-600 mb-4">Share study materials, practice problems, and helpful resources with your group</p>
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
                    Upload First Resource
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
