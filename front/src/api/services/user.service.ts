import apiClient, { handleApiError } from '../client';
import type {
  UserProfile,
  UpdateProfileRequest,
  Notification,
  NotificationSettings,
  Bookmark,
  Subscription,
  CreateSubscriptionRequest,
} from '../types';

class UserService {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await apiClient.get<UserProfile>('/users/me');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    try {
      const response = await apiClient.put<UserProfile>('/users/me', data);
      
      // Update stored user data
      const currentUser = localStorage.getItem('user');
      if (currentUser) {
        const user = JSON.parse(currentUser);
        localStorage.setItem('user', JSON.stringify({ ...user, ...data }));
      }
      
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(file: File): Promise<{ avatar_url: string }> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await apiClient.post<{ avatar_url: string }>(
        '/users/me/avatar',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete account
   */
  async deleteAccount(): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>('/users/me');
      
      // Clear local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get user bookmarks
   */
  async getBookmarks(): Promise<Bookmark[]> {
    try {
      const response = await apiClient.get<Bookmark[]>('/users/me/bookmarks');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get notifications
   */
  async getNotifications(): Promise<Notification[]> {
    try {
      const response = await apiClient.get<Notification[]>('/notifications');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(notificationId: string): Promise<void> {
    try {
      await apiClient.put(`/notifications/${notificationId}/read`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get notification settings
   */
  async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const response = await apiClient.get<NotificationSettings>('/users/me/notification-settings');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(data: Partial<NotificationSettings>): Promise<NotificationSettings> {
    try {
      const response = await apiClient.put<NotificationSettings>(
        '/users/me/notification-settings',
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get current subscription
   */
  async getSubscription(): Promise<Subscription> {
    try {
      const response = await apiClient.get<Subscription>('/subscriptions/current');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create subscription
   */
  async createSubscription(data: CreateSubscriptionRequest): Promise<Subscription> {
    try {
      const response = await apiClient.post<Subscription>('/subscriptions', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>('/subscriptions/current');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new UserService();