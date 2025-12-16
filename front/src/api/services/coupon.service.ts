import apiClient, { handleApiError } from '../client';

export interface RedeemCouponRequest {
  code: string;
}

export interface RedeemCouponResponse {
  message: string;
  exam_attempts_left: number;
  access_expires_at: string;
}

class CouponService {
  /**
   * Redeem a coupon for test access
   */
  async redeemCoupon(data: RedeemCouponRequest): Promise<RedeemCouponResponse> {
    try {
      const response = await apiClient.post<RedeemCouponResponse>('/coupons/redeem', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new CouponService();
