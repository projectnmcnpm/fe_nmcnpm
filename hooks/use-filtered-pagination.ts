import { useEffect, useMemo } from "react";

type UseFilteredPaginationParams<T> = {
  items: T[];
  itemsPerPage: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  filterFn: (item: T) => boolean;
  resetDeps: ReadonlyArray<unknown>;
};

export function useFilteredPagination<T>({
  items,
  itemsPerPage,
  currentPage,
  setCurrentPage,
  filterFn,
  resetDeps,
}: UseFilteredPaginationParams<T>) {
  const filteredItems = useMemo(() => {
    return items.filter(filterFn);
  }, [items, filterFn]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [setCurrentPage, ...resetDeps]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages, setCurrentPage]);

  return {
    filteredItems,
    paginatedItems,
    totalPages,
  };
}
