import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import Card from '../base/Card';
import Button from '../base/Button';
import CountUpNumber from '../base/CountUpNumber';

interface ExamAttemptsCounterProps {
  onRedeemClick: () => void;
}

const ExamAttemptsCounter: React.FC<ExamAttemptsCounterProps> = ({ onRedeemClick }) => {
  const { user } = useAuthContext();
  const [timeLeft, setTimeLeft] = useState<string>('');

  // Calculate time left until expiration
  useEffect(() => {
    if (!user?.access_expires_at) return;

    const updateTimeLeft = () => {
      const now = new Date();
      const expiresAt = new Date(user.access_expires_at!);
      const diffMs = expiresAt.getTime() - now.getTime();

      if (diffMs <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days} days, ${hours}h left`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m left`);
      } else {
        setTimeLeft(`${minutes}m left`);
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [user?.access_expires_at]);

  const attemptsLeft = user?.exam_attempts_left || 0;
  const isExpired = timeLeft === 'Expired';
  const isLow = attemptsLeft <= 1;

  return (
    <Card className="text-center" glassmorphism={true} interactive3d={true} glow={true}>
      <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 rounded-full">
        <i className={`ri-ticket-line text-2xl ${isLow || isExpired ? 'text-red-500' : 'text-primary'}`}></i>
      </div>

      <div className={`text-3xl font-bold mb-1 ${isLow || isExpired ? 'text-red-600' : 'text-gray-900'} animate-number-count`}>
        <CountUpNumber end={attemptsLeft} duration={1200} delay={400} />
      </div>

      <h3 className="font-semibold text-gray-900 mb-1">Exam Tries Left</h3>

      {user?.access_expires_at && (
        <p className={`text-small font-medium mb-4 ${isExpired ? 'text-red-600' : 'text-neutral'}`}>
          Expires in: {timeLeft}
        </p>
      )}

      <Button
        variant="secondary"
        size="sm"
        className="w-full"
        onClick={onRedeemClick}
      >
        <i className="ri-add-circle-line mr-2"></i>
        Get More Attempts
      </Button>
    </Card>
  );
};

export default ExamAttemptsCounter;
