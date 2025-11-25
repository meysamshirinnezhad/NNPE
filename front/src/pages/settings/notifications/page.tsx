
import { useState, useEffect } from 'react';
import Header from '../../../components/feature/Header';
import LoadingSpinner from '../../../components/effects/LoadingSpinner';
import { userService } from '../../../api';

interface NotificationSettings {
  email: {
    studyReminders: boolean;
    weeklyProgress: boolean;
    examAlerts: boolean;
    forumActivity: boolean;
    systemUpdates: boolean;
    marketing: boolean;
  };
  push: {
    studyReminders: boolean;
    practiceAlerts: boolean;
    achievementUnlocked: boolean;
    groupActivity: boolean;
    examCountdown: boolean;
  };
  sms: {
    examReminders: boolean;
    importantUpdates: boolean;
  };
}

export default function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      studyReminders: true,
      weeklyProgress: true,
      examAlerts: true,
      forumActivity: false,
      systemUpdates: true,
      marketing: false
    },
    push: {
      studyReminders: true,
      practiceAlerts: true,
      achievementUnlocked: true,
      groupActivity: false,
      examCountdown: true
    },
    sms: {
      examReminders: true,
      importantUpdates: false
    }
  });

  const [studyReminderTime, setStudyReminderTime] = useState('19:00');
  const [reminderDays, setReminderDays] = useState(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await userService.getNotificationSettings();
        // Map backend notification settings to local format if needed
        if (data.email_notifications !== undefined) {
          setSettings(prev => ({
            ...prev,
            email: { ...prev.email, studyReminders: data.email_notifications }
          }));
        }
        if (data.push_notifications !== undefined) {
          setSettings(prev => ({
            ...prev,
            push: { ...prev.push, studyReminders: data.push_notifications }
          }));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleToggle = (category: keyof NotificationSettings, setting: string) => {
    setSettings(prev => {
      const categorySettings = prev[category];
      return {
        ...prev,
        [category]: {
          ...categorySettings,
          [setting]: !(categorySettings as any)[setting]
        }
      };
    });
  };

  const handleDayToggle = (day: string) => {
    setReminderDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const days = [
    { id: 'monday', label: 'Mon' },
    { id: 'tuesday', label: 'Tue' },
    { id: 'wednesday', label: 'Wed' },
    { id: 'thursday', label: 'Thu' },
    { id: 'friday', label: 'Fri' },
    { id: 'saturday', label: 'Sat' },
    { id: 'sunday', label: 'Sun' }
  ];

  const handleSaveSettings = async () => {
    setSaving(true);
    setError('');
    setSuccessMessage('');
    
    try {
      await userService.updateNotificationSettings({
        email_notifications: settings.email.studyReminders,
        push_notifications: settings.push.studyReminders
      });
      setSuccessMessage('Notification settings saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

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
        
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <i className="ri-check-line text-green-600 text-xl mr-3"></i>
              <p className="text-green-800">{successMessage}</p>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notification Settings</h1>
          <p className="text-gray-600">Customize how and when you receive notifications</p>
        </div>

        <div className="mb-8">
          <nav className="flex space-x-8">
            <a href="/settings/account" className="text-gray-500 hover:text-gray-700 pb-2">
              Account
            </a>
            <a href="/settings/subscription" className="text-gray-500 hover:text-gray-700 pb-2">
              Subscription
            </a>
            <a href="/settings/notifications" className="border-b-2 border-blue-500 text-blue-600 pb-2 font-medium">
              Notifications
            </a>
          </nav>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Email Notifications</h2>
            </div>
            <div className="p-6 space-y-6">
              {Object.entries(settings.email).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {key === 'studyReminders' && 'Daily reminders to keep you on track'}
                      {key === 'weeklyProgress' && 'Weekly summary of your study progress'}
                      {key === 'examAlerts' && 'Important exam-related announcements'}
                      {key === 'forumActivity' && 'Replies and mentions in forum discussions'}
                      {key === 'systemUpdates' && 'Platform updates and new features'}
                      {key === 'marketing' && 'Tips, success stories, and promotional content'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle('email', key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Push Notifications</h2>
            </div>
            <div className="p-6 space-y-6">
              {Object.entries(settings.push).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {key === 'studyReminders' && 'Push notifications for study sessions'}
                      {key === 'practiceAlerts' && 'Reminders to complete practice questions'}
                      {key === 'achievementUnlocked' && 'Celebrate when you unlock achievements'}
                      {key === 'groupActivity' && 'Updates from your study groups'}
                      {key === 'examCountdown' && 'Countdown alerts as exam approaches'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle('push', key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Study Reminder Schedule</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reminder Time</label>
                <input
                  type="time"
                  value={studyReminderTime}
                  onChange={(e) => setStudyReminderTime(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Reminder Days</label>
                <div className="flex space-x-2">
                  {days.map((day) => (
                    <button
                      key={day.id}
                      onClick={() => handleDayToggle(day.id)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        reminderDays.includes(day.id)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">SMS Notifications</h2>
            </div>
            <div className="p-6 space-y-6">
              {Object.entries(settings.sms).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {key === 'examReminders' && 'Critical exam date reminders via SMS'}
                      {key === 'importantUpdates' && 'Urgent platform updates and alerts'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle('sms', key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
