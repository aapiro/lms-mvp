import { useState, useEffect, useCallback } from 'react';
import api from '../api/api';

/**
 * Hook for API calls with loading/error/data state.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useApi('/courses');
 *   const { data, execute, loading } = useApi('/admin/courses', { manual: true });
 */
export default function useApi(url, { manual = false, initialData = null } = {}) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!manual);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (overrideUrl, options = {}) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(overrideUrl || url, options);
        setData(res.data);
        return res.data;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [url]
  );

  useEffect(() => {
    if (!manual && url) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, manual]);

  return { data, loading, error, execute, refetch: () => execute(url), setData };
}
