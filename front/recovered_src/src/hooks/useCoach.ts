import { useState, useEffect } from 'react';
import { coachService } from '../api';
import type { CoachResponse } from '../api';

export const useCoach = () => {
  const [data, setData] = useState<CoachResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCoach = async () => {
    try {
      setLoading(true);
      setError(null);
      const coachData = await coachService.getCoach();
      setData(coachData);
    } catch (err: any) {
      console.error('Coach fetch error:', err);
      setError(err?.response?.data?.error || err?.message || 'Failed to fetch AI coach');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      if (mounted) {
        await fetchCoach();
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
    refresh: fetchCoach,
  };
};
