
import { useState, useEffect } from 'react';
import Header from '../../components/feature/Header';
import LoadingSpinner from '../../components/effects/LoadingSpinner';
import TestHistory from '../../components/test-history/TestHistory';
import { userService } from '../../api';

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  title: string;
  location: string;
  examDate: string;
  studyGoal: string;
  joinedDate: string;
  totalStudyHours: number;
  questionsAnswered: number;
  currentStreak: number;
  averageAccuracy: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedDate: string;
  category: string;
}

const mockProfile: UserProfile = {
  name: 'Sarah Chen',
  email: 'sarah.chen@email.com',
  avatar: 'https://readdy.ai/api/search-image?query=professional%20female%20engineer%20portrait%20with%20engineering%20background%2C%20confident%20and%20friendly%20expression&width=120&height=120&seq=profile1&orientation=squarish',
  title: 'Structural Engineer',
  location: 'Toronto, ON',
  examDate: '2024-04-15',
  studyGoal: 'Pass NPPE on first attempt',
  joinedDate: '2024-01-10',
  totalStudyHours: 156,
  questionsAnswered: 1247,
  currentStreak: 12,
  averageAccuracy: 78
};

const mockAchievements: Achievement[] = [
  {
    id: '1',
    title: 'First Steps',
    description: 'Completed your first practice question',
    icon: 'ri-footprint-line',
    earnedDate: '2024-01-10',
    category: 'Getting Started'
  },
  {
    id: '2',
    title: 'Study Streak',
    description: 'Maintained a 7-day study streak',
    icon: 'ri-fire-line',
    earnedDate: '2024-01-17',
    category: 'Consistency'
  },
  {
    id: '3',
    title: 'Question Master',
    description: 'Answered 1000 practice questions',
    icon: 'ri-question-answer-line',
    earnedDate: '2024-01-14',
    category: 'Practice'
  },
  {
    id: '4',
    title: 'Accuracy Expert',
    description: 'Achieved 80% accuracy in Structural Analysis',
    icon: 'ri-target-line',
    earnedDate: '2024-01-12',
    category: 'Mastery'
  }
];

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(mockProfile);
  const [editedProfile, setEditedProfile] = useState(mockProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userService.getProfile();
        // Map backend data to local profile format
        const mappedProfile: UserProfile = {
          name: `${data.first_name} ${data.last_name}`,
          email: data.email,
          avatar: data.avatar_url || mockProfile.avatar,
          title: data.province || mockProfile.title,
          location: data.province || mockProfile.location,
          examDate: data.exam_date || mockProfile.examDate,
          studyGoal: mockProfile.studyGoal,
          joinedDate: data.created_at || mockProfile.joinedDate,
          totalStudyHours: mockProfile.totalStudyHours,
          questionsAnswered: mockProfile.questionsAnswered,
          currentStreak: mockProfile.currentStreak,
          averageAccuracy: mockProfile.averageAccuracy
        };
        setProfile(mappedProfile);
        setEditedProfile(mappedProfile);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const [firstName, ...lastNameParts] = editedProfile.name.split(' ');
      await userService.updateProfile({
        first_name: firstName,
        last_name: lastNameParts.join(' '),
        province: editedProfile.location,
        exam_date: editedProfile.examDate
      });
      setProfile(editedProfile);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
    setError('');
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await userService.uploadAvatar(file);
      setProfile({ ...profile, avatar: result.avatar_url });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
    }
  };

  const daysUntilExam = Math.ceil((new Date(profile.examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <i className="ri-error-warning-line text-red-600 text-xl mr-3"></i>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <div className="flex items-start space-x-6">
              <div className="relative">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
                  <i className="ri-camera-line text-sm"></i>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </label>
              </div>
              
              <div className="flex-1">
                {!isEditing ? (
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">{profile.name}</h1>
                    <p className="text-gray-600 mb-2">{profile.title}</p>
                    <p className="text-gray-500 text-sm mb-4">
                      <i className="ri-map-pin-line mr-1"></i>
                      {profile.location}
                    </p>
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Exam Date:</span> {new Date(profile.examDate).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Goal:</span> {profile.studyGoal}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={editedProfile.name}
                        onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={editedProfile.title}
                        onChange={(e) => setEditedProfile({...editedProfile, title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={editedProfile.location}
                        onChange={(e) => setEditedProfile({...editedProfile, location: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Study Goal</label>
                      <input
                        type="text"
                        value={editedProfile.studyGoal}
                        onChange={(e) => setEditedProfile({...editedProfile, studyGoal: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3">
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="ri-calendar-line text-blue-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Days Until Exam</p>
                <p className="text-2xl font-bold text-gray-900">{daysUntilExam}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="ri-time-line text-green-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Study Hours</p>
                <p className="text-2xl font-bold text-gray-900">{profile.totalStudyHours}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="ri-question-line text-purple-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Questions Answered</p>
                <p className="text-2xl font-bold text-gray-900">{profile.questionsAnswered.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <i className="ri-fire-line text-orange-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold text-gray-900">{profile.currentStreak} days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Study Progress */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Study Progress</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Accuracy</span>
                  <span className="text-sm text-gray-600">{profile.averageAccuracy}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${profile.averageAccuracy}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Study Goal Progress</span>
                  <span className="text-sm text-gray-600">65%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Test Attempts */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Test Attempts</h2>
              <a href="/practice-tests/history" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All Tests
              </a>
            </div>
          </div>
          <div className="p-6">
            <TestHistory pageSize={3} />
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Achievements</h2>
              <a href="/achievements" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All
              </a>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockAchievements.slice(0, 4).map((achievement) => (
                <div key={achievement.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <i className={`${achievement.icon} text-yellow-600 text-xl`}></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{achievement.title}</h3>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Earned {new Date(achievement.earnedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <p className="text-gray-900">{profile.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                <p className="text-gray-900">{new Date(profile.joinedDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex space-x-3">
                <a 
                  href="/settings/account"
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  Account Settings
                </a>
                <a 
                  href="/settings/subscription"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  Manage Subscription
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
