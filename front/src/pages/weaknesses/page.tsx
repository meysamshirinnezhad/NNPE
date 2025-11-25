
import { useState, useEffect } from 'react';
import Header from '../../components/feature/Header';
import LoadingSpinner from '../../components/effects/LoadingSpinner';
import { dashboardService } from '../../api';
import type { WeakTopic as ApiWeakTopic } from '../../api/types';

interface WeakTopic {
  id: string;
  name: string;
  accuracy: number;
  questionsAttempted: number;
  lastPracticed: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  recommendations: string[];
}

const mockWeakTopics: WeakTopic[] = [
  {
    id: '1',
    name: 'Structural Analysis',
    accuracy: 45,
    questionsAttempted: 28,
    lastPracticed: '2024-01-15',
    difficulty: 'Hard',
    recommendations: [
      'Review beam deflection calculations',
      'Practice moment distribution method',
      'Study influence lines for continuous beams'
    ]
  },
  {
    id: '2',
    name: 'Concrete Design',
    accuracy: 52,
    questionsAttempted: 35,
    lastPracticed: '2024-01-14',
    difficulty: 'Medium',
    recommendations: [
      'Focus on reinforcement detailing',
      'Practice shear design calculations',
      'Review ACI code provisions'
    ]
  },
  {
    id: '3',
    name: 'Geotechnical Engineering',
    accuracy: 38,
    questionsAttempted: 22,
    lastPracticed: '2024-01-13',
    difficulty: 'Hard',
    recommendations: [
      'Study soil classification systems',
      'Practice bearing capacity calculations',
      'Review slope stability analysis'
    ]
  },
  {
    id: '4',
    name: 'Transportation Engineering',
    accuracy: 58,
    questionsAttempted: 31,
    lastPracticed: '2024-01-12',
    difficulty: 'Medium',
    recommendations: [
      'Review traffic flow theory',
      'Practice pavement design',
      'Study intersection design principles'
    ]
  }
];

export default function Weaknesses() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>(mockWeakTopics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWeaknesses = async () => {
      try {
        const data = await dashboardService.getWeaknesses();
        // Map API data to component format
        const mappedTopics: WeakTopic[] = data.weak_topics.map((topic: ApiWeakTopic) => ({
          id: Math.random().toString(),
          name: topic.name,
          accuracy: topic.score,
          questionsAttempted: topic.questions_attempted || 0,
          lastPracticed: new Date().toISOString().split('T')[0],
          difficulty: topic.score < 50 ? 'Hard' : topic.score < 70 ? 'Medium' : 'Easy' as 'Easy' | 'Medium' | 'Hard',
          recommendations: topic.sub_topics?.map(st => `Focus on ${st.name}`) || []
        }));
        setWeakTopics(mappedTopics.length > 0 ? mappedTopics : mockWeakTopics);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load weaknesses');
        setWeakTopics(mockWeakTopics); // Fall back to mock data
      } finally {
        setLoading(false);
      }
    };

    fetchWeaknesses();
  }, []);

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy < 50) return 'text-red-600 bg-red-50';
    if (accuracy < 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-96">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <i className="ri-error-warning-line text-red-600 text-xl mr-3"></i>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Weakness Analysis</h1>
          <p className="text-gray-600">Identify and improve your weak areas with AI-powered recommendations</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="ri-alert-line text-red-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Critical Areas</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <i className="ri-time-line text-yellow-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Needs Practice</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="ri-target-line text-blue-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Accuracy</p>
                <p className="text-2xl font-bold text-gray-900">48%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="ri-lightbulb-line text-green-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recommendations</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </div>
        </div>

        {/* Weak Topics List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Areas Needing Improvement</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {weakTopics.map((topic) => (
              <div key={topic.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-medium text-gray-900">{topic.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(topic.difficulty)}`}>
                      {topic.difficulty}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedTopic(selectedTopic === topic.id ? null : topic.id)}
                    className="text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                  >
                    {selectedTopic === topic.id ? 'Hide Details' : 'View Details'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAccuracyColor(topic.accuracy)}`}>
                      {topic.accuracy}% Accuracy
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <i className="ri-question-line mr-1"></i>
                    {topic.questionsAttempted} questions attempted
                  </div>
                  <div className="text-sm text-gray-600">
                    <i className="ri-calendar-line mr-1"></i>
                    Last practiced: {new Date(topic.lastPracticed).toLocaleDateString()}
                  </div>
                </div>

                {selectedTopic === topic.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">AI Recommendations:</h4>
                    <ul className="space-y-2">
                      {topic.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <i className="ri-arrow-right-s-line text-blue-600 mt-0.5"></i>
                          <span className="text-sm text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex space-x-3">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
                        Practice Now
                      </button>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
                        Study Materials
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Study Plan */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recommended Study Plan</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Week 1-2: Focus on Structural Analysis</h3>
                <p className="text-sm text-gray-600">Complete 50 practice questions and review beam theory</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
                Start Plan
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Week 3-4: Geotechnical Fundamentals</h3>
                <p className="text-sm text-gray-600">Master soil mechanics and foundation design principles</p>
              </div>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
                View Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
