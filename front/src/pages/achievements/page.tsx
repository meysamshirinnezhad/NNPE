
import { useEffect, useState } from 'react';
import Header from '../../components/feature/Header';
import MobileNavigation from '../../components/feature/MobileNavigation';
import Card from '../../components/base/Card';
import { updateSEO, seoData } from '../../utils/seo';

export default function Achievements() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    updateSEO(seoData.achievements);
  }, []);

  const categories = [
    { id: 'all', name: 'All Achievements', count: 24 },
    { id: 'study', name: 'Study Milestones', count: 8 },
    { id: 'practice', name: 'Practice Tests', count: 6 },
    { id: 'community', name: 'Community', count: 4 },
    { id: 'special', name: 'Special Events', count: 6 }
  ];

  const achievements = [
    {
      id: 1,
      title: 'First Steps',
      description: 'Complete your first practice question',
      category: 'study',
      icon: 'ri-footprint-line',
      rarity: 'common',
      points: 10,
      unlocked: true,
      unlockedDate: '2024-01-10',
      progress: 100,
      requirement: 'Answer 1 practice question'
    },
    {
      id: 2,
      title: 'Question Master',
      description: 'Answer 100 practice questions correctly',
      category: 'study',
      icon: 'ri-question-mark',
      rarity: 'uncommon',
      points: 50,
      unlocked: true,
      unlockedDate: '2024-01-14',
      progress: 100,
      requirement: 'Answer 100 questions correctly'
    },
    {
      id: 3,
      title: 'Study Streak',
      description: 'Study for 7 consecutive days',
      category: 'study',
      icon: 'ri-fire-line',
      rarity: 'uncommon',
      points: 75,
      unlocked: true,
      unlockedDate: '2024-01-12',
      progress: 100,
      requirement: 'Study 7 days in a row'
    },
    {
      id: 4,
      title: 'Perfect Score',
      description: 'Score 100% on a practice test',
      category: 'practice',
      icon: 'ri-trophy-line',
      rarity: 'rare',
      points: 100,
      unlocked: true,
      unlockedDate: '2024-01-15',
      progress: 100,
      requirement: 'Score 100% on any practice test'
    },
    {
      id: 5,
      title: 'Speed Demon',
      description: 'Complete a practice test in under 2 hours',
      category: 'practice',
      icon: 'ri-speed-line',
      rarity: 'uncommon',
      points: 60,
      unlocked: true,
      unlockedDate: '2024-01-13',
      progress: 100,
      requirement: 'Complete practice test in under 2 hours'
    },
    {
      id: 6,
      title: 'Community Helper',
      description: 'Help 10 fellow engineers in the forum',
      category: 'community',
      icon: 'ri-hand-heart-line',
      rarity: 'rare',
      points: 120,
      unlocked: true,
      unlockedDate: '2024-01-11',
      progress: 100,
      requirement: 'Receive 10 helpful votes in forum'
    },
    {
      id: 7,
      title: 'Knowledge Seeker',
      description: 'Complete all study path modules',
      category: 'study',
      icon: 'ri-book-open-line',
      rarity: 'epic',
      points: 200,
      unlocked: false,
      unlockedDate: null,
      progress: 75,
      requirement: 'Complete all 32 study modules'
    },
    {
      id: 8,
      title: 'Test Champion',
      description: 'Pass 10 practice tests with 80%+ score',
      category: 'practice',
      icon: 'ri-medal-line',
      rarity: 'rare',
      points: 150,
      unlocked: false,
      unlockedDate: null,
      progress: 60,
      requirement: 'Pass 10 tests with 80%+ score'
    },
    {
      id: 9,
      title: 'Ethics Expert',
      description: 'Master the Ethics topic with 90%+ accuracy',
      category: 'study',
      icon: 'ri-scales-line',
      rarity: 'rare',
      points: 100,
      unlocked: false,
      unlockedDate: null,
      progress: 85,
      requirement: 'Achieve 90%+ accuracy in Ethics'
    },
    {
      id: 10,
      title: 'Forum Veteran',
      description: 'Be an active forum member for 30 days',
      category: 'community',
      icon: 'ri-user-star-line',
      rarity: 'uncommon',
      points: 80,
      unlocked: false,
      unlockedDate: null,
      progress: 40,
      requirement: 'Active forum participation for 30 days'
    },
    {
      id: 11,
      title: 'Early Bird',
      description: 'Study before 7 AM for 5 consecutive days',
      category: 'special',
      icon: 'ri-sun-line',
      rarity: 'uncommon',
      points: 70,
      unlocked: false,
      unlockedDate: null,
      progress: 20,
      requirement: 'Study before 7 AM for 5 days'
    },
    {
      id: 12,
      title: 'NPPE Legend',
      description: 'Complete the ultimate NPPE preparation challenge',
      category: 'special',
      icon: 'ri-crown-line',
      rarity: 'legendary',
      points: 500,
      unlocked: false,
      unlockedDate: null,
      progress: 45,
      requirement: 'Complete all requirements for NPPE mastery'
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100 border-gray-300';
      case 'uncommon': return 'text-green-600 bg-green-100 border-green-300';
      case 'rare': return 'text-blue-600 bg-blue-100 border-blue-300';
      case 'epic': return 'text-purple-600 bg-purple-100 border-purple-300';
      case 'legendary': return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      default: return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'rare': return 'shadow-blue-200';
      case 'epic': return 'shadow-purple-200';
      case 'legendary': return 'shadow-yellow-200';
      default: return '';
    }
  };

  const filteredAchievements = achievements.filter(achievement => 
    selectedCategory === 'all' || achievement.category === selectedCategory
  );

  const unlockedAchievements = filteredAchievements.filter(a => a.unlocked);
  const lockedAchievements = filteredAchievements.filter(a => !a.unlocked);

  const totalPoints = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0);
  const totalUnlocked = achievements.filter(a => a.unlocked).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Achievements
          </h1>
          <p className="text-gray-600">
            Track your progress and unlock rewards as you advance in your NPPE preparation journey.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ri-trophy-line text-yellow-600 text-xl"></i>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{totalUnlocked}</div>
            <div className="text-sm text-gray-600">Achievements Unlocked</div>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ri-star-line text-blue-600 text-xl"></i>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{totalPoints}</div>
            <div className="text-sm text-gray-600">Total Points</div>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ri-percent-line text-green-600 text-xl"></i>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {Math.round((totalUnlocked / achievements.length) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ri-medal-line text-purple-600 text-xl"></i>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {achievements.filter(a => a.unlocked && a.rarity === 'rare').length}
            </div>
            <div className="text-sm text-gray-600">Rare Achievements</div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-sm font-medium">{category.name}</span>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Progress to Next Level */}
            <Card className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress to Next Level</h3>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-blue-600 mb-1">Level 8</div>
                <div className="text-sm text-gray-600">Achievement Hunter</div>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>750/1000 XP</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div className="text-xs text-gray-600">
                250 XP needed to reach Level 9
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Unlocked Achievements */}
            {unlockedAchievements.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <i className="ri-check-circle-line text-green-600 mr-2"></i>
                  Unlocked Achievements ({unlockedAchievements.length})
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {unlockedAchievements.map((achievement) => (
                    <Card 
                      key={achievement.id} 
                      className={`relative overflow-hidden border-2 ${getRarityColor(achievement.rarity)} ${getRarityGlow(achievement.rarity)}`}
                    >
                      {/* Rarity Indicator */}
                      <div className={`absolute top-0 right-0 px-2 py-1 text-xs font-medium rounded-bl-lg ${getRarityColor(achievement.rarity)}`}>
                        {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
                      </div>

                      <div className="text-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${getRarityColor(achievement.rarity)}`}>
                          <i className={`${achievement.icon} text-2xl`}></i>
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {achievement.title}
                        </h3>
                        
                        <p className="text-sm text-gray-600 mb-4">
                          {achievement.description}
                        </p>

                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <span>+{achievement.points} XP</span>
                          <span>Unlocked {achievement.unlockedDate}</span>
                        </div>

                        <div className="flex items-center justify-center text-green-600">
                          <i className="ri-check-circle-fill mr-1"></i>
                          <span className="text-sm font-medium">Completed</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Locked Achievements */}
            {lockedAchievements.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <i className="ri-lock-line text-gray-400 mr-2"></i>
                  Locked Achievements ({lockedAchievements.length})
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lockedAchievements.map((achievement) => (
                    <Card 
                      key={achievement.id} 
                      className="relative overflow-hidden border-2 border-gray-300 opacity-75"
                    >
                      {/* Rarity Indicator */}
                      <div className="absolute top-0 right-0 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-bl-lg">
                        {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
                      </div>

                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className={`${achievement.icon} text-2xl text-gray-400`}></i>
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {achievement.title}
                        </h3>
                        
                        <p className="text-sm text-gray-600 mb-4">
                          {achievement.description}
                        </p>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>{achievement.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${achievement.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="text-xs text-gray-500 mb-3">
                          {achievement.requirement}
                        </div>

                        <div className="flex items-center justify-center text-gray-500">
                          <i className="ri-lock-line mr-1"></i>
                          <span className="text-sm">+{achievement.points} XP when unlocked</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredAchievements.length === 0 && (
              <Card className="text-center py-12">
                <i className="ri-trophy-line text-4xl text-gray-400 mb-4 block"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements found</h3>
                <p className="text-gray-600">
                  Try selecting a different category to view achievements.
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-blue-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <i className="ri-history-line mr-2"></i>
            Recent Achievement Activity
          </h3>
          <div className="space-y-3">
            {achievements
              .filter(a => a.unlocked)
              .sort((a, b) => new Date(b.unlockedDate!).getTime() - new Date(a.unlockedDate!).getTime())
              .slice(0, 3)
              .map((achievement) => (
                <div key={achievement.id} className="flex items-center space-x-4 p-3 bg-white rounded-lg">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getRarityColor(achievement.rarity)}`}>
                    <i className={`${achievement.icon} text-lg`}></i>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                    <p className="text-sm text-gray-600">Unlocked on {achievement.unlockedDate}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">+{achievement.points} XP</div>
                    <div className={`text-xs px-2 py-1 rounded-full ${getRarityColor(achievement.rarity)}`}>
                      {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </main>

      <MobileNavigation />
    </div>
  );
}
