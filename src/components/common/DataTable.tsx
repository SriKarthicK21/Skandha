import React, { useState, useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Filter
} from 'lucide-react';

export interface ColumnDef<T> {
  key: string;
  header: React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (row: T, index: number) => string | number;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchFilter?: (row: T, query: string) => boolean;
  pageSize?: number;
  stickyHeader?: boolean;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
  id?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  searchable = true,
  searchPlaceholder = 'Filter records...',
  searchFilter,
  pageSize = 10,
  stickyHeader = true,
  isLoading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There are currently no items matching your criteria.',
  emptyAction,
  onRowClick,
  className = '',
  id
}: DataTableProps<T>) {
  const { theme } = useGRC();
  const isLight = theme === 'light';

  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase().trim();

    if (searchFilter) {
      return data.filter(row => searchFilter(row, q));
    }

    // Default search across all string/number fields of row
    return data.filter(row => {
      return Object.values(row as Record<string, unknown>).some(val => {
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(q);
      });
    });
  }, [data, searchQuery, searchFilter]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return sortDirection === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [filteredData, sortKey, sortDirection]);

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  return (
    <div id={id} className={`w-full flex flex-col space-y-3 ${className}`}>
      {/* Table Toolbar: Search Filter & Record Count */}
      {searchable && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border transition-colors outline-hidden ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
                  : 'bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono self-end sm:self-center">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{sortedData.length}</span> records
          </div>
        </div>
      )}

      {/* Responsive Horizontal Scroll Container (prevents page-level overflow) */}
      <div className={`skanda-table-container border rounded-xl overflow-hidden ${
        isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-900/80 border-slate-800 shadow-xs'
      }`}>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="skanda-table w-full text-left border-collapse">
            {/* Table Header */}
            <thead>
              <tr className={`border-b text-xs font-semibold select-none ${
                isLight
                  ? 'bg-slate-50/90 text-slate-700 border-slate-200'
                  : 'bg-slate-950/60 text-slate-300 border-slate-800'
              } ${stickyHeader ? 'sticky top-0 z-10 backdrop-blur-xs' : ''}`}>
                {columns.map(col => {
                  const alignClass =
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left';

                  return (
                    <th
                      key={col.key}
                      style={{ width: col.width }}
                      onClick={col.sortable ? () => handleSort(col.key) : undefined}
                      className={`px-3.5 py-3 text-xs tracking-tight ${alignClass} ${
                        col.sortable ? 'cursor-pointer hover:text-blue-600 dark:hover:text-blue-400' : ''
                      } ${col.className || ''}`}
                    >
                      <div className={`inline-flex items-center space-x-1.5 ${
                        col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'
                      }`}>
                        <span>{col.header}</span>
                        {col.sortable && (
                          <span className="shrink-0 text-slate-400">
                            {sortKey === col.key ? (
                              sortDirection === 'asc' ? (
                                <ChevronUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                              )
                            ) : (
                              <ChevronsUpDown className="w-3 h-3 opacity-50" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {isLoading ? (
                // Skeleton Rows
                Array.from({ length: 5 }).map((_, rIdx) => (
                  <tr key={rIdx} className="animate-pulse">
                    {columns.map((col, cIdx) => (
                      <td key={cIdx} className="px-3.5 py-3">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedData.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={columns.length} className="py-12 px-4 text-center">
                    <div className="max-w-xs mx-auto flex flex-col items-center justify-center space-y-2 text-slate-400 dark:text-slate-500">
                      <Inbox className="w-8 h-8 opacity-40 mb-1" />
                      <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                        {emptyTitle}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {emptyDescription}
                      </p>
                      {emptyAction && <div className="pt-2">{emptyAction}</div>}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, rIdx) => {
                  const key = keyExtractor(row, rIdx);
                  return (
                    <tr
                      key={key}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      className={`transition-colors ${
                        onRowClick ? 'cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20'
                      }`}
                    >
                      {columns.map(col => {
                        const alignClass =
                          col.align === 'right'
                            ? 'text-right'
                            : col.align === 'center'
                            ? 'text-center'
                            : 'text-left';

                        return (
                          <td
                            key={col.key}
                            className={`px-3.5 py-3 ${alignClass} ${col.className || ''}`}
                          >
                            {col.render
                              ? col.render(row, rIdx)
                              : String((row as Record<string, unknown>)[col.key] ?? '')}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        {sortedData.length > pageSize && (
          <div className={`px-4 py-2.5 border-t flex items-center justify-between text-xs ${
            isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/40 border-slate-800'
          }`}>
            <span className="text-slate-500 dark:text-slate-400">
              Page <span className="font-semibold text-slate-700 dark:text-slate-200">{currentPage}</span> of{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">{totalPages}</span>
            </span>

            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-1 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-slate-700 dark:text-slate-200"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-1 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-slate-700 dark:text-slate-200"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DataTable;
