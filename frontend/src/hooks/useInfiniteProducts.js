import { useCallback, useEffect, useRef, useState } from 'react';
import { productService } from '../services/productService';

const PAGE_SIZE = 24;

// Cursor-paginated product fetcher with race-condition guards.
// Each filter change bumps requestIdRef; in-flight responses for older
// request ids are discarded so a slow first page can't stomp a fresh one.
export function useInfiniteProducts(params, { pageSize = PAGE_SIZE } = {}) {
  const [products, setProducts] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const requestIdRef = useRef(0);
  const abortRef = useRef(null);
  const paramsKey = JSON.stringify(params);

  const fetchPage = useCallback(
    async (cursorArg, isInitial, requestId) => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      if (isInitial) setIsLoading(true);
      else setIsLoadingMore(true);
      setError(null);

      try {
        const response = await productService.getProductsPaginated(
          { ...params, limit: pageSize, ...(cursorArg ? { cursor: cursorArg } : {}) },
          { signal: controller.signal }
        );
        if (requestId !== requestIdRef.current) return;

        const incoming = response.products || [];
        setProducts((prev) => (isInitial ? incoming : [...prev, ...incoming]));
        setCursor(response.nextCursor || null);
        setHasMore(Boolean(response.hasMore));
      } catch (err) {
        if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
        if (requestId !== requestIdRef.current) return;
        setError(err);
        setHasMore(false);
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [params, pageSize, paramsKey] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Reset and refetch first page whenever filter inputs change.
  useEffect(() => {
    requestIdRef.current += 1;
    const id = requestIdRef.current;
    setProducts([]);
    setCursor(null);
    setHasMore(true);
    fetchPage(null, true, id);
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [paramsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = useCallback(() => {
    if (isLoading || isLoadingMore || !hasMore || !cursor) return;
    fetchPage(cursor, false, requestIdRef.current);
  }, [cursor, hasMore, isLoading, isLoadingMore, fetchPage]);

  return { products, isLoading, isLoadingMore, hasMore, error, loadMore };
}

// Debounce a value so rapid filter edits don't fire one request per keystroke.
export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// Calls onIntersect once when the returned ref enters the viewport (with margin).
// Re-arms whenever onIntersect identity changes, so the hook fires again after
// each loadMore resolves and a new cursor is set.
export function useIntersectionTrigger(onIntersect, { rootMargin = '300px', enabled = true } = {}) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || !enabled) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onIntersect();
      },
      { rootMargin }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [onIntersect, rootMargin, enabled]);
  return ref;
}
