import { useState, useEffect, useCallback } from 'react';
import { testService } from '../../api';
import type { PracticeTest } from '../../api/types';
import Button from '../base/Button';
import Card from '../base/Card';
import LoadingSpinner from '../effects/LoadingSpinner';
import TestHistoryItem from './TestHistoryItem';

interface TestHistoryProps {
  topicId?: string;
  testKey?: string;
  pageSize?: number;
  refreshKey?: number;
}

// Session-based cache
const cache = new Map<string, { items: PracticeTest[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function TestHistory({ topicId, testKey, pageSize = 5, refreshKey = 0 }: TestHistoryProps) {
  const [items, setItems] = useState<PracticeTest[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in_progress'>('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const getCacheKey = useCallback((filter: string, pg: number) => {
    return `${topicId || testKey || 'all'}_${filter}_${pg}`;
  }, [topicId, testKey]);

  const loadHistory = useCallback(async (isLoadMore = false) => {
    const currentPage = isLoadMore ? page + 1 : 1;
    const cacheKey = getCacheKey(statusFilter, currentPage);

    // Check cache first
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        if (isLoadMore) {
          setItems(prev => [...prev, ...cached.items]);
          setPage(currentPage);
        } else {
          setItems(cached.items);
        }
        setLoading(false);
        setLoadingMore(false);
        return;
      }
    }

    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    setError('');

    try {
      const response = await testService.listHistory({
        topic_id: topicId,
        test_type: testKey,
        status: statusFilter,
        page: currentPage,
        page_size: pageSize,
      });

      // Cache the result
      cache.set(cacheKey, {
        items: response.items,
        timestamp: Date.now(),
      });

      if (isLoadMore) {
        // Merge without duplicates
        setItems(prev => {
          const existingIds = new Set(prev.map(item => item.id));
          const newItems = response.items.filter(item => !existingIds.has(item.id));
          return [...prev, ...newItems];
        });
        setPage(currentPage);
      } else {
        setItems(response.items);
        setPage(1);
      }

      setTotal(response.total);
      setHasMore(response.items.length === pageSize);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load test history');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [topicId, testKey, statusFilter, page, pageSize, getCacheKey]);

  useEffect(() => {
    // Debounce to avoid rapid API calls
    const timeout = setTimeout(() => {
      loadHistory(false);
    }, 150);

    return () => clearTimeout(timeout);
  }, [statusFilter, topicId, testKey, refreshKey]);

  const handleLoadMore = () => {
    loadHistory(true);
  };

  const handleRetry = () => {
    setError('');
    loadHistory(false);
  };

  const filteredItems = items;
  const completedCount = items.filter(t => t.status === 'completed').length;
  const inProgressCount = items.filter(t => t.status === 'in_progress').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Your History</h3>
        {total > 0 && (
          <span className="text-sm text-gray-500">{total} attempt{total !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        <Button
          variant={statusFilter === 'all' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setStatusFilter('all')}
        >
          All ({items.length})
        </Button>
        <Button
          variant={statusFilter === 'completed' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setStatusFilter('completed')}
        >
          Completed ({completedCount})
        </Button>
        <Button
          variant={statusFilter === 'in_progress' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setStatusFilter('in_progress')}
        >
          In Progress ({inProgressCount})
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="p-6 text-center bg-red-50 border-red-200">
          <i className="ri-error-warning-line text-red-600 text-2xl mb-2 block"></i>
          <p className="text-red-800 mb-4">{error}</p>
          <Button onClick={handleRetry} size="sm">
            <i className="ri-refresh-line mr-1"></i>
            Retry
          </Button>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && filteredItems.length === 0 && (
        <Card className="p-8 text-center">
          <i className="ri-file-list-line text-4xl text-gray-400 mb-3 block"></i>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No attempts yet</h4>
          <p className="text-sm text-gray-600">
            {statusFilter === 'all'
              ? 'Start your first attempt to see history here.'
              : `No ${statusFilter.replace('_', ' ')} attempts found.`}
          </p>
        </Card>
      )}

      {/* History List */}
      {!loading && !error && filteredItems.length > 0 && (
        <ul className="space-y-3" role="list" aria-label="Test attempt history">
          {filteredItems.map((test, index) => (
            <TestHistoryItem
              key={test.id}
              test={test}
              attemptNumber={total - (page - 1) * pageSize - index}
            />
          ))}
        </ul>
      )}

      {/* Load More */}
      {!loading && !error && hasMore && filteredItems.length > 0 && (
        <div className="flex justify-center pt-4">
          <Button
            variant="secondary"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Loading...</span>
              </>
            ) : (
              <>
                <i className="ri-arrow-down-line mr-1"></i>
                Load More
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
