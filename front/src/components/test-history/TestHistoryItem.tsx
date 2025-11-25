import { useNavigate } from 'react-router-dom';
import Button from '../base/Button';
import Card from '../base/Card';
import type { PracticeTest } from '../../api/types';

interface TestHistoryItemProps {
  test: PracticeTest;
  attemptNumber: number;
}

export default function TestHistoryItem({ test, attemptNumber }: TestHistoryItemProps) {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <li className="list-none">
      <Card className="hover:shadow-md transition-shadow">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-600">
                Attempt #{attemptNumber}
              </span>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(test.status)}`}>
                {test.status === 'in_progress' ? 'In Progress' : test.status.charAt(0).toUpperCase() + test.status.slice(1)}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {formatDate(test.completed_at || test.started_at)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {test.status === 'completed' && (
                <>
                  <div>
                    <div className={`text-2xl font-bold ${getScoreColor(test.score)}`}>
                      {test.score}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {test.correct_answers}/{test.total_questions}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <i className="ri-time-line mr-1"></i>
                    {formatDuration(test.time_spent_seconds)}
                  </div>
                </>
              )}
              {test.status === 'in_progress' && (
                <div className="text-sm text-gray-600">
                  {test.total_questions} questions
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {test.status === 'completed' && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/test/${test.id}/results`)}
                    aria-label={`View results for attempt ${attemptNumber} from ${formatDate(test.completed_at || test.started_at)}`}
                  >
                    <i className="ri-bar-chart-line mr-1"></i>
                    Results
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/test/${test.id}/review`)}
                    aria-label={`Review answers for attempt ${attemptNumber} from ${formatDate(test.completed_at || test.started_at)}`}
                  >
                    <i className="ri-eye-line mr-1"></i>
                    Review
                  </Button>
                </>
              )}
              {test.status === 'in_progress' && (
                <Button
                  size="sm"
                  onClick={() => navigate(`/practice-test/take/${test.id}`)}
                  className="bg-yellow-600 hover:bg-yellow-700"
                  aria-label={`Resume in-progress attempt ${attemptNumber} from ${formatDate(test.started_at)}`}
                >
                  <i className="ri-play-line mr-1"></i>
                  Resume
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </li>
  );
}