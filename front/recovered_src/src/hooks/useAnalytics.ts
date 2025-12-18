import { useState, useEffect } from 'react';
import { dashboardService } from '../api';
import type { AnalyticsData, WeakTopic } from '../api';

export const useAnalytics = (timeframe: '7d' | '30d' | '90d' | 'all' = '30d') => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const analyticsData = await dashboardService.getAnalytics(timeframe);
      setData(analyticsData);
    } catch (err: any) {
      console.error('Analytics fetch error:', err);
      setError(err?.response?.data?.error || err?.message || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      if (mounted) {
        await fetchAnalytics();
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [timeframe]);

  return {
    data,
    loading,
    error,
    refresh: fetchAnalytics,
  };
};

export const useWeaknesses = () => {
  const [data, setData] = useState<{ weak_topics: WeakTopic[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeaknesses = async () => {
    try {
      setLoading(true);
      setError(null);
      const weaknessesData = await dashboardService.getWeaknesses();
      setData(weaknessesData);
    } catch (err: any) {
      console.error('Weaknesses fetch error:', err);
      setError(err?.response?.data?.error || err?.message || 'Failed to fetch weaknesses data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      if (mounted) {
        await fetchWeaknesses();
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    refresh: fetchWeaknesses,
  };
};
