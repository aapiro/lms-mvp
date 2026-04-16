import { useState, useCallback } from 'react';
import api from '../api/api';

/**
 * Hook for paginated API lists.
 *
 * Usage:
 *   const { items, page, loading, loadPage, hasMore } = usePagination('/admin/students', { size: 20 });
 */
export default function usePagination(baseUrl, { size = 20, extraParams = '' } = {}) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadPage = useCallback(
    async (pageNum = 0, params = extraParams) => {
      setLoading(true);
      try {
        const sep = baseUrl.includes('?') ? '&' : '?';
        const res = await api.get(`${baseUrl}${sep}page=${pageNum}&size=${size}${params ? `&${params}` : ''}`);
        const data = res.data;
        const content = data.content || data;
        setItems(content);
        setPage(pageNum);
        // If it's a Spring Page, use totalPages; otherwise check array length
        if (data.totalPages !== undefined) {
          setHasMore(pageNum + 1 < data.totalPages);
        } else {
          setHasMore(Array.isArray(content) && content.length >= size);
        }
        return content;
      } catch (err) {
        console.error(`Error loading ${baseUrl}`, err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [baseUrl, size, extraParams]
  );

  return { items, page, loading, loadPage, hasMore, setItems };
}
