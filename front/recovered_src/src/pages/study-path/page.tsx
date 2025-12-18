
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/feature/Header';
import MobileNavigation from '../../components/feature/MobileNavigation';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import ProgressBar from '../../components/base/ProgressBar';
import LoadingSpinner from '../../components/effects/LoadingSpinner';
import { updateSEO } from '../../utils/seo';
import { studyService } from '../../api';
import type { StudyPath as ApiStudyPath } from '../../api/types';

export default function StudyPath() {
  const navigate = useNavigate();
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [studyPath, setStudyPath] = useState<ApiStudyPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    updateSEO({
      title: 'Study Path - NPPE Pro',
      description: '8-week structured study path for NPPE exam',
      keywords: 'study path, learning path, NPPE',
      canonical: '/study-path'
    });
  }, []);

  useEffect(() => {
    const fetchStudyPath = async () => {
      try {
        const data = await studyService.getStudyPath();
        setStudyPath(data);
        setSelectedWeek(data.current_week || 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load study path');
      } finally {
        setLoading(false);
      }
    };

    fetchStudyPath();
  }, []);





  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="flex items-center justify-center h-96">
            <LoadingSpinner size="lg" />
          </div>
        </main>
        <MobileNavigation />
      </div>
    );
  }

  if (!studyPath) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <Card className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Study Path Found</h2>
            <p className="text-gray-600 mb-6">Start your personalized study path today.</p>
            <Button onClick={() => navigate('/onboarding')}>Create Study Path</Button>
          </Card>
        </main>
        <MobileNavigation />
      </div>
    );
  }

  const modules = studyPath.modules || [];
  const weekModules = modules.filter(m => m.week === selectedWeek);
  const completedCount = modules.filter(m => m.status === 'completed').length;
  const progressPercentage = studyPath.progress_percentage || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <i className="ri-error-warning-line text-red-600 text-xl mr-3"></i>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            8-Week Study Path
          </h1>
          <p className="text-gray-600">
            A structured curriculum designed to prepare you for the NPPE exam in 8 weeks.
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="md:col-span-3">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Progress</h2>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Completion</span>
                  <span>{completedCount}/{modules.length} modules</span>
                </div>
                <ProgressBar value={progressPercentage * 100} animate={true} />
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{Math.round(progressPercentage * 100)}%</div>
                  <div className="text-sm text-gray-600">Complete</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{selectedWeek}</div>
                  <div className="text-sm text-gray-600">Current Week</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.max(0, 8 - selectedWeek + 1)}
                  </div>
                  <div className="text-sm text-gray-600">Weeks Left</div>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <Button className="w-full mb-3">
                <i className="ri-play-circle-line mr-2"></i>
                Continue Learning
              </Button>
              <Button variant="secondary" className="w-full">
                <i className="ri-calendar-line mr-2"></i>
                View Schedule
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Week Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Weeks</h3>
              <div className="space-y-2">
                {Array.from({ length: 8 }, (_, i) => i + 1).map((weekNum) => {
                  const weekMods = modules.filter(m => m.week === weekNum);
                  const weekCompletedModules = weekMods.filter(m => m.status === 'completed').length;
                  const weekProgress = weekMods.length > 0 ? (weekCompletedModules / weekMods.length) * 100 : 0;
                  
                  return (
                    <button
                      key={weekNum}
                      onClick={() => setSelectedWeek(weekNum)}
                      className={`w-full p-3 rounded-lg text-left transition-colors cursor-pointer ${
                        selectedWeek === weekNum
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Week {weekNum}</span>
                        {weekProgress === 100 && (
                          <i className="ri-check-circle-fill text-green-600"></i>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">Week {weekNum} Content</div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${weekProgress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {weekCompletedModules}/{weekMods.length} modules
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Week Content */}
          <div className="lg:col-span-3">
            <Card>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Week {selectedWeek} Content
                  </h2>
                  <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                    {weekModules.filter(m => m.status === 'completed').length}/{weekModules.length} Complete
                  </span>
                </div>
                <p className="text-gray-600 text-lg">
                  Study modules for week {selectedWeek}
                </p>
              </div>

              {/* Modules */}
              <div className="space-y-4">
                {weekModules.map((module) => {
                  const isCompleted = module.status === 'completed';
                  const isLocked = false; // Simplify for now
                  
                  return (
                    <div
                      key={module.id}
                      className={`p-4 border rounded-lg transition-all ${
                        isCompleted 
                          ? 'border-green-200 bg-green-50' 
                          : isLocked
                          ? 'border-gray-200 bg-gray-50 opacity-60'
                          : 'border-gray-300 hover:border-gray-400 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100 text-blue-600">
                            <i className="ri-book-line text-lg"></i>
                          </div>
                          <div>
                            <h3 className={`font-medium ${isLocked ? 'text-gray-500' : 'text-gray-900'}`}>
                              {module.title}
                            </h3>
                            <div className="flex items-center space-x-3 text-sm text-gray-600">
                              <span className="flex items-center">
                                <i className="ri-time-line mr-1"></i>
                                {module.duration_minutes}m
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          {isCompleted && (
                            <div className="flex items-center text-green-600">
                              <i className="ri-check-circle-fill mr-1"></i>
                              <span className="text-sm font-medium">Completed</span>
                            </div>
                          )}
                          
                          {isLocked ? (
                            <div className="flex items-center text-gray-500">
                              <i className="ri-lock-line mr-1"></i>
                              <span className="text-sm">Locked</span>
                            </div>
                          ) : (
                            <div className="flex space-x-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                disabled={isLocked}
                                onClick={() => navigate(`/study-path/module?id=${module.id}`)}
                              >
                                {isCompleted ? 'Review' : 'Start'}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Week Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                <Button
                  variant="secondary"
                  onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
                  disabled={selectedWeek === 1}
                >
                  <i className="ri-arrow-left-line mr-2"></i>
                  Previous Week
                </Button>

                <div className="text-sm text-gray-600">
                  Week {selectedWeek} of 8
                </div>

                <Button
                  onClick={() => setSelectedWeek(Math.min(8, selectedWeek + 1))}
                  disabled={selectedWeek === 8}
                >
                  Next Week
                  <i className="ri-arrow-right-line ml-2"></i>
                </Button>
              </div>
            </Card>

            {/* Study Tips */}
            <Card className="mt-6 bg-gradient-to-r from-blue-50 to-blue-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <i className="ri-lightbulb-line mr-2"></i>
                Study Tips for Week {selectedWeek}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Focus Areas</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Take detailed notes during video sessions</li>
                    <li>• Practice active recall with key concepts</li>
                    <li>• Complete all practice questions</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Time Management</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Aim for 1-2 hours of study daily</li>
                    <li>• Break sessions into 25-minute chunks</li>
                    <li>• Review previous week's material</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <MobileNavigation />
    </div>
  );
}
