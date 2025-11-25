
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import ProgressBar from '../../components/base/ProgressBar';
import { updateSEO, seoData } from '../../utils/seo';
import { userService } from '../../api';

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    examDate: '',
    studyGoal: '',
    dailyStudyTime: '',
    engineeringDiscipline: '',
    experienceLevel: '',
    notifications: {
      email: true,
      push: true,
      studyReminders: true,
      weeklyProgress: true
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    updateSEO(seoData.onboarding);
  }, []);

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field.startsWith('notifications.')) {
      const notificationField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [notificationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding - save to backend
      setIsLoading(true);
      setError(null);

      try {
        // Update user profile with exam date if provided
        if (formData.examDate) {
          const dateObj = new Date(formData.examDate + 'T00:00:00');
          await userService.updateProfile({
            exam_date: dateObj.toISOString()
          });
        }

        // Update notification settings
        await userService.updateNotificationSettings({
          email_notifications: formData.notifications.email,
          push_notifications: formData.notifications.push,
          daily_reminder: formData.notifications.studyReminders,
          weekly_report: formData.notifications.weeklyProgress
        });

        // Navigate to dashboard
        navigate('/dashboard');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save onboarding data');
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-calendar-line text-blue-600 text-2xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Set Your Exam Goal
        </h2>
        <p className="text-gray-600">
          Help us create a personalized study plan for your NPPE exam preparation.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          When are you planning to take the NPPE exam?
        </label>
        <input
          type="date"
          value={formData.examDate}
          onChange={(e) => handleInputChange('examDate', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          What's your primary study goal?
        </label>
        <div className="space-y-3">
          {[
            { value: 'first-attempt', label: 'Pass on my first attempt', icon: 'ri-target-line' },
            { value: 'retake', label: 'Retake and improve my score', icon: 'ri-refresh-line' },
            { value: 'thorough-prep', label: 'Thorough preparation over time', icon: 'ri-time-line' },
            { value: 'quick-review', label: 'Quick review before exam', icon: 'ri-speed-line' }
          ].map((goal) => (
            <label key={goal.value} className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="studyGoal"
                value={goal.value}
                checked={formData.studyGoal === goal.value}
                onChange={(e) => handleInputChange('studyGoal', e.target.value)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                formData.studyGoal === goal.value ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
              }`}>
                {formData.studyGoal === goal.value && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              <i className={`${goal.icon} text-gray-600 text-lg mr-3`}></i>
              <span className="font-medium text-gray-900">{goal.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          How much time can you dedicate to studying daily?
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: '30min', label: '30 minutes' },
            { value: '1hour', label: '1 hour' },
            { value: '2hours', label: '2 hours' },
            { value: '3hours+', label: '3+ hours' }
          ].map((time) => (
            <button
              key={time.value}
              onClick={() => handleInputChange('dailyStudyTime', time.value)}
              className={`p-3 border rounded-lg text-center transition-colors cursor-pointer ${
                formData.dailyStudyTime === time.value
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {time.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-user-line text-blue-600 text-2xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Tell Us About Yourself
        </h2>
        <p className="text-gray-600">
          This helps us customize your learning experience and provide relevant content.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          What's your engineering discipline?
        </label>
        <select
          value={formData.engineeringDiscipline}
          onChange={(e) => handleInputChange('engineeringDiscipline', e.target.value)}
          className="w-full px-4 py-3 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select your discipline</option>
          <option value="civil">Civil Engineering</option>
          <option value="mechanical">Mechanical Engineering</option>
          <option value="electrical">Electrical Engineering</option>
          <option value="chemical">Chemical Engineering</option>
          <option value="software">Software Engineering</option>
          <option value="environmental">Environmental Engineering</option>
          <option value="aerospace">Aerospace Engineering</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          How would you describe your experience level?
        </label>
        <div className="space-y-3">
          {[
            { 
              value: 'new-graduate', 
              label: 'New Graduate', 
              description: 'Recently graduated, preparing for first P.Eng application',
              icon: 'ri-graduation-cap-line'
            },
            { 
              value: 'experienced', 
              label: 'Experienced Engineer', 
              description: '4+ years of experience, ready for professional designation',
              icon: 'ri-briefcase-line'
            },
            { 
              value: 'senior', 
              label: 'Senior Engineer', 
              description: '10+ years of experience, seeking P.Eng for career advancement',
              icon: 'ri-award-line'
            }
          ].map((level) => (
            <label key={level.value} className="flex items-start p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="experienceLevel"
                value={level.value}
                checked={formData.experienceLevel === level.value}
                onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-full border-2 mr-3 mt-0.5 flex items-center justify-center ${
                formData.experienceLevel === level.value ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
              }`}>
                {formData.experienceLevel === level.value && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              <i className={`${level.icon} text-gray-600 text-lg mr-3 mt-0.5`}></i>
              <div>
                <div className="font-medium text-gray-900">{level.label}</div>
                <div className="text-sm text-gray-600">{level.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-notification-line text-blue-600 text-2xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Notification Preferences
        </h2>
        <p className="text-gray-600">
          Choose how you'd like to stay updated on your progress and receive study reminders.
        </p>
      </div>

      <div className="space-y-4">
        {[
          {
            key: 'email',
            title: 'Email Notifications',
            description: 'Receive important updates and announcements via email',
            icon: 'ri-mail-line'
          },
          {
            key: 'push',
            title: 'Push Notifications',
            description: 'Get instant notifications on your device',
            icon: 'ri-notification-3-line'
          },
          {
            key: 'studyReminders',
            title: 'Study Reminders',
            description: 'Daily reminders to help you stay on track with your study schedule',
            icon: 'ri-alarm-line'
          },
          {
            key: 'weeklyProgress',
            title: 'Weekly Progress Reports',
            description: 'Summary of your weekly progress and achievements',
            icon: 'ri-bar-chart-line'
          }
        ].map((notification) => (
          <div key={notification.key} className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
            <div className="flex items-start space-x-3">
              <i className={`${notification.icon} text-gray-600 text-lg mt-0.5`}></i>
              <div>
                <h3 className="font-medium text-gray-900">{notification.title}</h3>
                <p className="text-sm text-gray-600">{notification.description}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notifications[notification.key as keyof typeof formData.notifications]}
                onChange={(e) => handleInputChange(`notifications.${notification.key}`, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <i className="ri-information-line text-blue-600 text-lg mt-0.5"></i>
          <div>
            <h3 className="font-medium text-blue-900 mb-1">Privacy Note</h3>
            <p className="text-sm text-blue-700">
              You can change these preferences anytime in your account settings. We respect your privacy and will never share your information with third parties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-8 h-8 flex items-center justify-center">
              <i className="ri-settings-3-line text-blue-600 text-xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">NPPE Pro</h1>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <ProgressBar value={progress} animate={true} />
          </div>
        </div>

        <Card>
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <i className="ri-error-warning-line text-red-600 mr-2"></i>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Step Content */}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <div>
              {currentStep > 1 ? (
                <Button variant="secondary" onClick={handleBack} disabled={isLoading}>
                  <i className="ri-arrow-left-line mr-2"></i>
                  Back
                </Button>
              ) : (
                <button
                  onClick={handleSkip}
                  className="text-gray-600 hover:text-gray-700 font-medium cursor-pointer"
                  disabled={isLoading}
                >
                  Skip Setup
                </button>
              )}
            </div>

            <Button onClick={handleNext} disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center">
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  {currentStep === totalSteps ? 'Saving...' : 'Next Step'}
                </div>
              ) : (
                <>
                  {currentStep === totalSteps ? 'Complete Setup' : 'Next Step'}
                  <i className="ri-arrow-right-line ml-2"></i>
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
