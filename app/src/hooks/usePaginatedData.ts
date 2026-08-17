import { useCallback, useEffect, useRef, useState } from "react";

export type PageRequest = {
  limit: number;
  offset: number;
  q?: string;
};

export type PageResult<T> = {
  count: number;
  results: T[];
};

type PaginatedDataOptions<T> = {
  loadPage: (request: PageRequest) => Promise<PageResult<T>>;
  query: string;
  pageSize?: number;
  requestKey?: string;
};

export function usePaginatedData<T>({
  loadPage,
  query,
  pageSize = 25,
  requestKey = "",
}: PaginatedDataOptions<T>) {
  const loaderRef = useRef(loadPage);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    loaderRef.current = loadPage;
  }, [loadPage]);

  useEffect(() => {
    setPage(1);
  }, [query, requestKey]);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(
      () => {
        setIsLoading(true);
        setError("");
        void loaderRef
          .current({
            limit: pageSize,
            offset: (page - 1) * pageSize,
            ...(query.trim() ? { q: query.trim() } : {}),
          })
          .then((result) => {
            if (!active) return;
            if (result.results.length === 0 && result.count > 0 && page > 1) {
              setPage(Math.ceil(result.count / pageSize));
              return;
            }
            setItems(result.results);
            setTotal(result.count);
          })
          .catch((loadError: unknown) => {
            if (!active) return;
            setItems([]);
            setTotal(0);
            setError(
              loadError instanceof Error
                ? loadError.message
                : "Não foi possível carregar esta página.",
            );
          })
          .finally(() => {
            if (active) setIsLoading(false);
          });
      },
      query.trim() ? 250 : 0,
    );

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [page, pageSize, query, requestKey, revision]);

  const reload = useCallback(() => setRevision((value) => value + 1), []);

  return {
    error,
    isLoading,
    items,
    page,
    pageSize,
    reload,
    setPage,
    total,
  };
}
