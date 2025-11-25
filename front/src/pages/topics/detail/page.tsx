
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../../components/feature/Header';
import Button from '../../../components/base/Button';
import Card from '../../../components/base/Card';
import LoadingSpinner from '../../../components/effects/LoadingSpinner';
import CircularProgress from '../../../components/base/CircularProgress';

interface SubTopic {
  id: string;
  name: string;
  mastery: number;
  questionsAnswered: number;
  correctAnswers: number;
  lastPracticed?: Date;
}

interface TopicDetail {
  id: string;
  name: string;
  description: string;
  mastery: number;
  totalQuestions: number;
  questionsAnswered: number;
  correctAnswers: number;
  averageTime: number;
  lastPracticed?: Date;
  subTopics: SubTopic[];
  recentPerformance: {
    date: Date;
    score: number;
    questionsAnswered: number;
  }[];
  recommendations: string[];
}

export default function TopicDetail() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<TopicDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading topic data
    setTimeout(() => {
      const mockTopic: TopicDetail = {
        id: topicId || '1',
        name: 'Structural Engineering',
        description: 'Comprehensive coverage of structural analysis, design principles, material properties, and code requirements for various structural systems.',
        mastery: 78,
        totalQuestions: 150,
        questionsAnswered: 89,
        correctAnswers: 69,
        averageTime: 95, // seconds
        lastPracticed: new Date('2024-01-15'),
        subTopics: [
          {
            id: '1',
            name: 'Beam Design',
            mastery: 85,
            questionsAnswered: 25,
            correctAnswers: 21,
            lastPracticed: new Date('2024-01-15')
          },
          {
            id: '2',
            name: 'Column Design',
            mastery: 72,
            questionsAnswered: 18,
            correctAnswers: 13,
            lastPracticed: new Date('2024-01-12')
          },
          {
            id: '3',
            name: 'Connection Design',
            mastery: 68,
            questionsAnswered: 15,
            correctAnswers: 10,
            lastPracticed: new Date('2024-01-10')
          },
          {
            id: '4',
            name: 'Load Analysis',
            mastery: 90,
            questionsAnswered: 20,
            correctAnswers: 18,
            lastPracticed: new Date('2024-01-14')
          },
          {
            id: '5',
            name: 'Material Properties',
            mastery: 75,
            questionsAnswered: 11,
            correctAnswers: 8,
            lastPracticed: new Date('2024-01-08')
          }
        ],
        recentPerformance: [
          { date: new Date('2024-01-15'), score: 85, questionsAnswered: 10 },
          { date: new Date('2024-01-12'), score: 70, questionsAnswered: 8 },
          { date: new Date('2024-01-10'), score: 75, questionsAnswered: 12 },
          { date: new Date('2024-01-08'), score: 80, questionsAnswered: 15 },
          { date: new Date('2024-01-05'), score: 65, questionsAnswered: 9 }
        ],
        recommendations: [
          'Focus on connection design - your weakest area',
          'Practice more column design problems',
          'Review material properties for different steel grades',
          'Work on time management - average time is above target'
        ]
      };
      setTopic(mockTopic);
      setLoading(false);
    }, 1000);
  }, [topicId]);

  const getMasteryColor = (mastery: number) => {
    if (mastery >= 80) return 'text-green-600';
    if (mastery >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMasteryBgColor = (mastery: number) => {
    if (mastery >= 80) return 'bg-green-100';
    if (mastery >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" variant="engineering" />
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Topic Not Found</h2>
            <p className="text-gray-600 mb-6">The topic you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/topics')}>
              Back to Topics
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const accuracyPercentage = topic.questionsAnswered > 0 
    ? Math.round((topic.correctAnswers / topic.questionsAnswered) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="secondary"
              onClick={() => navigate('/topics')}
              className="flex items-center space-x-2"
            >
              <i className="ri-arrow-left-line"></i>
              <span>Back to Topics</span>
            </Button>
            
            <div className="flex space-x-3">
              <Button
                onClick={() => navigate(`/practice?topic=${topic.id}`)}
                className="flex items-center space-x-2"
              >
                <i className="ri-play-line"></i>
                <span>Practice Now</span>
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate(`/practice-test/new?topic=${topic.id}`)}
                className="flex items-center space-x-2"
              >
                <i className="ri-file-list-line"></i>
                <span>Take Test</span>
              </Button>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{topic.name}</h1>
          <p className="text-gray-600">{topic.description}</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <CircularProgress 
                  value={topic.mastery} 
                  size={80}
                  strokeWidth={8}
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Mastery Level</h3>
              <p className={`text-xl font-bold ${getMasteryColor(topic.mastery)}`}>
                {topic.mastery}%
              </p>
            </div>
          </Card>

          <Card className="text-center">
            <div className="p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-question-line text-2xl text-blue-600"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Questions Answered</h3>
              <p className="text-xl font-bold text-gray-900">
                {topic.questionsAnswered}/{topic.totalQuestions}
              </p>
            </div>
          </Card>

          <Card className="text-center">
            <div className="p-6">
              <div className={`w-16 h-16 ${getMasteryBgColor(accuracyPercentage)} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <i className={`ri-target-line text-2xl ${getMasteryColor(accuracyPercentage)}`}></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Accuracy</h3>
              <p className={`text-xl font-bold ${getMasteryColor(accuracyPercentage)}`}>
                {accuracyPercentage}%
              </p>
            </div>
          </Card>

          <Card className="text-center">
            <div className="p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-time-line text-2xl text-purple-600"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Avg. Time</h3>
              <p className="text-xl font-bold text-gray-900">
                {formatTime(topic.averageTime)}
              </p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sub-Topics */}
          <Card>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                <i className="ri-list-check text-blue-600"></i>
                <span>Sub-Topics</span>
              </h3>
              
              <div className="space-y-4">
                {topic.subTopics.map((subTopic) => (
                  <div key={subTopic.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{subTopic.name}</h4>
                      <span className={`text-sm font-bold ${getMasteryColor(subTopic.mastery)}`}>
                        {subTopic.mastery}%
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div
                        className={`h-2 rounded-full ${
                          subTopic.mastery >= 80 ? 'bg-green-500' :
                          subTopic.mastery >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${subTopic.mastery}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{subTopic.correctAnswers}/{subTopic.questionsAnswered} correct</span>
                      {subTopic.lastPracticed && (
                        <span>Last: {subTopic.lastPracticed.toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Recent Performance */}
          <Card>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                <i className="ri-line-chart-line text-green-600"></i>
                <span>Recent Performance</span>
              </h3>
              
              <div className="space-y-3 mb-6">
                {topic.recentPerformance.map((performance, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        performance.score >= 80 ? 'bg-green-500' :
                        performance.score >= 60 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                      <span className="text-sm text-gray-600">
                        {performance.date.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${getMasteryColor(performance.score)}`}>
                        {performance.score}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {performance.questionsAnswered} questions
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                  <i className="ri-lightbulb-line text-yellow-500"></i>
                  <span>Recommendations</span>
                </h4>
                <ul className="space-y-2">
                  {topic.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <i className="ri-arrow-right-line text-blue-600 mt-1 flex-shrink-0"></i>
                      <span className="text-sm text-gray-700">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button
            onClick={() => navigate(`/practice?topic=${topic.id}`)}
            className="flex items-center space-x-2"
          >
            <i className="ri-play-line"></i>
            <span>Practice Questions</span>
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => navigate(`/practice-test/new?topic=${topic.id}`)}
            className="flex items-center space-x-2"
          >
            <i className="ri-file-list-line"></i>
            <span>Topic Test</span>
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => navigate('/study-path')}
            className="flex items-center space-x-2"
          >
            <i className="ri-book-open-line"></i>
            <span>Study Materials</span>
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => navigate('/analytics')}
            className="flex items-center space-x-2"
          >
            <i className="ri-bar-chart-line"></i>
            <span>View Analytics</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
