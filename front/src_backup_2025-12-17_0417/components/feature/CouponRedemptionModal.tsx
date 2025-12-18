import React, { useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import Modal from '../base/Modal';
import Button from '../base/Button';
import Input from '../base/Input';
import { couponService } from '../../api';

interface CouponRedemptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CouponRedemptionModal: React.FC<CouponRedemptionModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user, setUser } = useAuthContext();
  const [couponCode, setCouponCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await couponService.redeemCoupon({ code: couponCode.trim() });

      // Update user context with new attempts and expiration
      if (user) {
        setUser({
          ...user,
          exam_attempts_left: response.exam_attempts_left || 3,
          access_expires_at: response.access_expires_at
        });
      }

      setSuccess('Coupon redeemed successfully! You now have 3 exam attempts.');
      setCouponCode('');

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
        onSuccess();
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to redeem coupon. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setCouponCode('');
      setError(null);
      setSuccess(null);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Redeem Coupon">
      <div className="p-6">
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">
            Enter your coupon code to get 3 exam attempts valid for 30 days.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <Input
              label="Coupon Code"
              value={couponCode}
              onChange={(value) => setCouponCode(value)}
              placeholder="Enter your coupon code"
              disabled={isLoading}
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !couponCode.trim()}
              loading={isLoading}
            >
              {isLoading ? 'Redeeming...' : 'Redeem Coupon'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CouponRedemptionModal;
