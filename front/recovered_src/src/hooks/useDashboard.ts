import { useState, useEffect } from 'react';
import { dashboardService } from '../api';
import type { DashboardData } from '../api';

export const useDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardData = await dashboardService.getDashboard();
      setData(dashboardData);
    } catch (err: any) {
      console.error('Dashboard fetch error:', err);
      setError(err?.response?.data?.error || err?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      if (mounted) {
        await fetchDashboard();
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
    refresh: fetchDashboard,
  };
};
