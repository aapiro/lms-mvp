import { renderHook, act } from '@testing-library/react';
import usePagination from '../hooks/usePagination';
import api from '../api/api';

vi.mock('../api/api', () => ({
  default: { get: vi.fn() },
}));

beforeEach(() => {
  api.get.mockReset();
});

test('Spring Page response: extracts content and computes hasMore from totalPages', async () => {
  api.get.mockResolvedValueOnce({
    data: { content: [{ id: 1 }, { id: 2 }], totalPages: 3 },
  });
  const { result } = renderHook(() => usePagination('/admin/students', { size: 2 }));

  await act(async () => { await result.current.loadPage(0); });

  expect(api.get).toHaveBeenCalledWith('/admin/students?page=0&size=2');
  expect(result.current.items).toHaveLength(2);
  expect(result.current.hasMore).toBe(true);
  expect(result.current.page).toBe(0);
});

test('last Spring page sets hasMore false', async () => {
  api.get.mockResolvedValueOnce({ data: { content: [{ id: 5 }], totalPages: 3 } });
  const { result } = renderHook(() => usePagination('/admin/students', { size: 2 }));

  await act(async () => { await result.current.loadPage(2); });
  expect(result.current.hasMore).toBe(false);
});

test('plain array response: hasMore follows page-size heuristic', async () => {
  api.get.mockResolvedValueOnce({ data: [{ id: 1 }] });
  const { result } = renderHook(() => usePagination('/waitlist', { size: 20 }));

  await act(async () => { await result.current.loadPage(0); });
  expect(result.current.items).toHaveLength(1);
  expect(result.current.hasMore).toBe(false);
});

test('failed load rethrows and clears loading', async () => {
  api.get.mockRejectedValueOnce(new Error('boom'));
  const { result } = renderHook(() => usePagination('/admin/students'));

  await expect(
    act(async () => { await result.current.loadPage(0); })
  ).rejects.toThrow('boom');
  expect(result.current.loading).toBe(false);
});

test('appends extraParams and respects existing query string', async () => {
  api.get.mockResolvedValueOnce({ data: [] });
  const { result } = renderHook(() =>
    usePagination('/search?q=java', { size: 10, extraParams: 'sort=title' })
  );

  await act(async () => { await result.current.loadPage(1); });
  expect(api.get).toHaveBeenCalledWith('/search?q=java&page=1&size=10&sort=title');
});
