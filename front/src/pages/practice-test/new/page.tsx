
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/feature/Header';
import MobileNavigation from '../../../components/feature/MobileNavigation';
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';
import LoadingSpinner from '../../../components/effects/LoadingSpinner';
import { updateSEO } from '../../../utils/seo';
import { testService, questionService } from '../../../api';
import type { Topic } from '../../../api/types';

export default function PracticeTestNew() {
  const navigate = useNavigate();
  const [testConfig, setTestConfig] = useState({
    testType: 'full_exam' as 'full_exam' | 'topic_specific' | 'custom',
    topics: [] as string[],
    difficulty: 'mixed' as 'easy' | 'medium' | 'hard' | 'mixed',
    timeLimit: 'standard',
    questionCount: 100,
    customTime: 180
  });
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    updateSEO({
      title: 'New Practice Test - NPPE Pro',
      description: 'Create a new practice test',
      keywords: 'practice test, NPPE',
      canonical: '/practice-test/new'
    });
  }, []);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await questionService.getTopics();
        setTopics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load topics');
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  const testTypes = [
    {
      id: 'full_exam' as const,
      name: 'Full NPPE Simulation',
      description: 'Complete 100-question exam simulation matching the real NPPE format',
      duration: '3 hours',
      questions: 100,
      recommended: true
    },
    {
      id: 'topic_specific' as const,
      name: 'Topic-Focused Test',
      description: 'Focus on specific topics you want to practice',
      duration: 'Variable',
      questions: '20-50',
      recommended: false
    },
    {
      id: 'custom' as const,
      name: 'Custom Test',
      description: 'Create your own test with custom settings',
      duration: 'Custom',
      questions: 'Custom',
      recommended: false
    }
  ];

  const handleTestTypeChange = (typeId: 'full_exam' | 'topic_specific' | 'custom') => {
    setTestConfig(prev => ({
      ...prev,
      testType: typeId,
      questionCount: typeId === 'full_exam' ? 100 : prev.questionCount,
      topics: typeId === 'full_exam' ? [] : prev.topics
    }));
  };

  const handleTopicToggle = (topicId: string) => {
    setTestConfig(prev => ({
      ...prev,
      topics: prev.topics.includes(topicId)
        ? prev.topics.filter(id => id !== topicId)
        : [...prev.topics, topicId]
    }));
  };

  const getEstimatedDuration = () => {
    if (testConfig.testType === 'full_exam') return '3 hours';
    if (testConfig.timeLimit === 'standard') {
      return `${Math.round(testConfig.questionCount * 1.8)} minutes`;
    }
    return `${testConfig.customTime} minutes`;
  };

  const canStartTest = () => {
    if (testConfig.testType === 'topic_specific') {
      return testConfig.topics.length > 0;
    }
    return true;
  };

  const handleStartTest = async () => {
    setCreating(true);
    setError('');
    
    try {
      const result = await testService.startTest({
        test_type: testConfig.testType,
        topic_ids: testConfig.topics.length > 0 ? testConfig.topics : undefined,
        difficulty: testConfig.difficulty !== 'mixed' ? testConfig.difficulty : undefined,
        question_count: testConfig.questionCount,
        time_limit_minutes: testConfig.timeLimit === 'custom' ? testConfig.customTime :
                            testConfig.testType === 'full_exam' ? 180 :
                            Math.round(testConfig.questionCount * 1.8)
      });
      
      navigate(`/practice-test/take/${result.test_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create test');
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="flex items-center justify-center h-96">
            <LoadingSpinner size="lg" />
          </div>
        </main>
        <MobileNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <i className="ri-error-warning-line text-red-600 text-xl mr-3"></i>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Practice Test
          </h1>
          <p className="text-gray-600">
            Configure your practice test to match your study goals and preparation needs.
          </p>
        </div>

        <div className="space-y-8">
          {/* Test Type Selection */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Choose Test Type</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {testTypes.map((type) => (
                <div
                  key={type.id}
                  onClick={() => handleTestTypeChange(type.id)}
                  className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                    testConfig.testType === type.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {type.recommended && (
                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      Recommended
                    </span>
                  )}
                  <div className="flex items-center mb-2">
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                      testConfig.testType === type.id
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {testConfig.testType === type.id && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900">{type.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{type.duration}</span>
                    <span>{type.questions} questions</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Topic Selection (for topic-focused tests) */}
          {(testConfig.testType === 'topic_specific' || testConfig.testType === 'custom') && (
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Topics</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {topics.map((topic) => (
                  <label
                    key={topic.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      testConfig.topics.includes(topic.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={testConfig.topics.includes(topic.id)}
                      onChange={() => handleTopicToggle(topic.id)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center ${
                      testConfig.topics.includes(topic.id)
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {testConfig.topics.includes(topic.id) && (
                        <i className="ri-check-line text-white text-xs"></i>
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">{topic.name}</span>
                    </div>
                  </label>
                ))}
              </div>
              {testConfig.testType === 'topic_specific' && testConfig.topics.length === 0 && (
                <p className="text-sm text-red-600 mt-3">
                  Please select at least one topic to continue.
                </p>
              )}
            </Card>
          )}

          {/* Test Configuration */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Test Configuration</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Difficulty Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Difficulty Level
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'easy', name: 'Easy', description: 'Fundamental concepts' },
                    { id: 'medium', name: 'Medium', description: 'Standard exam level' },
                    { id: 'hard', name: 'Hard', description: 'Challenging questions' },
                    { id: 'mixed', name: 'Mixed', description: 'All difficulty levels' }
                  ].map((difficulty) => (
                    <label key={difficulty.id} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="difficulty"
                        value={difficulty.id}
                        checked={testConfig.difficulty === difficulty.id}
                        onChange={(e) => setTestConfig(prev => ({ ...prev, difficulty: e.target.value as 'easy' | 'medium' | 'hard' | 'mixed' }))}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                        testConfig.difficulty === difficulty.id
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {testConfig.difficulty === difficulty.id && (
                          <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                        )}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">{difficulty.name}</span>
                        <span className="text-sm text-gray-500 ml-2">{difficulty.description}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Time Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Time Limit
                </label>
                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="timeLimit"
                      value="standard"
                      checked={testConfig.timeLimit === 'standard'}
                      onChange={(e) => setTestConfig(prev => ({ ...prev, timeLimit: e.target.value }))}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                      testConfig.timeLimit === 'standard'
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {testConfig.timeLimit === 'standard' && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                    <span className="font-medium text-gray-900">Standard (1.8 min/question)</span>
                  </label>
                  
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="timeLimit"
                      value="custom"
                      checked={testConfig.timeLimit === 'custom'}
                      onChange={(e) => setTestConfig(prev => ({ ...prev, timeLimit: e.target.value }))}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                      testConfig.timeLimit === 'custom'
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {testConfig.timeLimit === 'custom' && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                    <span className="font-medium text-gray-900">Custom</span>
                  </label>
                  
                  {testConfig.timeLimit === 'custom' && (
                    <div className="ml-7">
                      <input
                        type="number"
                        value={testConfig.customTime}
                        onChange={(e) => setTestConfig(prev => ({ ...prev, customTime: parseInt(e.target.value) || 0 }))}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="10"
                        max="300"
                      />
                      <span className="ml-2 text-sm text-gray-600">minutes</span>
                    </div>
                  )}
                  
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="timeLimit"
                      value="unlimited"
                      checked={testConfig.timeLimit === 'unlimited'}
                      onChange={(e) => setTestConfig(prev => ({ ...prev, timeLimit: e.target.value }))}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                      testConfig.timeLimit === 'unlimited'
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {testConfig.timeLimit === 'unlimited' && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                    <span className="font-medium text-gray-900">Unlimited</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Custom Question Count */}
            {testConfig.testType === 'custom' && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Questions
                </label>
                <input
                  type="number"
                  value={testConfig.questionCount}
                  onChange={(e) => setTestConfig(prev => ({ ...prev, questionCount: parseInt(e.target.value) || 0 }))}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="5"
                  max="100"
                />
                <span className="ml-2 text-sm text-gray-600">questions (5-100)</span>
              </div>
            )}
          </Card>

          {/* Test Summary */}
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Summary</h2>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {testConfig.questionCount}
                </div>
                <div className="text-sm text-gray-600">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {getEstimatedDuration()}
                </div>
                <div className="text-sm text-gray-600">Duration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {testConfig.testType === 'topic_specific' ? testConfig.topics.length : 'All'}
                </div>
                <div className="text-sm text-gray-600">Topics</div>
              </div>
            </div>

            {testConfig.testType === 'topic_specific' && testConfig.topics.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Selected Topics:</h3>
                <div className="flex flex-wrap gap-2">
                  {testConfig.topics.map(topicId => {
                    const topic = topics.find(t => t.id === topicId);
                    return (
                      <span key={topicId} className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                        {topic?.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <Button
                onClick={handleStartTest}
                disabled={!canStartTest() || creating}
                size="lg"
                className="px-8"
              >
                {creating ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Creating Test...</span>
                  </>
                ) : (
                  <>
                    <i className="ri-play-circle-line mr-2"></i>
                    Start Practice Test
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </main>

      <MobileNavigation />
    </div>
  );
}
