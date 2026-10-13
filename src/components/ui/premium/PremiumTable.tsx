import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { PremiumInput } from './PremiumInput';
import { PremiumSkeleton } from './PremiumSkeleton';

export interface PremiumTableColumn<T> {
  key: string;
  header: string;
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
  className?: string;
}

export interface PremiumTableProps<T> {
  columns: PremiumTableColumn<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string;
  isLoading?: boolean;
  pageSize?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchFilter?: (row: T, query: string) => boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
}

export function PremiumTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  pageSize = 10,
  searchable = true,
  searchPlaceholder = 'Search records...',
  searchFilter,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items matching your criteria.',
  emptyAction,
  onRowClick,
  className = ''
}: PremiumTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filtering
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    if (searchFilter) {
      return data.filter(item => searchFilter(item, searchQuery));
    }
    // Default string search across object properties
    const q = searchQuery.toLowerCase();
    return data.filter(item => {
      return Object.values(item as any).some(val =>
        val !== null && val !== undefined && String(val).toLowerCase().includes(q)
      );
    });
  }, [data, searchQuery, searchFilter]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a: any, b: any) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;
      const comparison = valA < valB ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortKey, sortDirection]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
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

  if (isLoading) {
    return <PremiumSkeleton variant="table" rows={pageSize || 5} className={className} />;
  }

  return (
    <div className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden flex flex-col ${className}`}>
      {/* Search Header */}
      {searchable && (
        <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="w-full max-w-xs">
            <PremiumInput
              icon={Search}
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 text-xs"
            />
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0">
            {sortedData.length} records
          </span>
        </div>
      )}

      {/* Table Body */}
      <div className="overflow-x-auto min-h-0">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 select-none">
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`h-10 px-4 font-semibold tracking-tight ${
                    col.sortable ? 'cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors' : ''
                  } ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'} ${
                    col.className || ''
                  }`}
                >
                  <div className="inline-flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-slate-400">
                        {sortKey === col.key ? (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          )
                        ) : (
                          <ChevronsUpDown className="w-3 h-3 opacity-60" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center">
                  <div className="max-w-sm mx-auto space-y-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
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
              paginatedData.map((row, idx) => (
                <tr
                  key={keyExtractor(row, idx)}
                  onClick={() => onRowClick?.(row)}
                  className={`transition-colors duration-120 ${
                    onRowClick ? 'cursor-pointer hover:bg-slate-50/90 dark:hover:bg-slate-800/50' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`py-3 px-4 text-slate-700 dark:text-slate-300 ${
                        col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                      } ${col.className || ''}`}
                    >
                      {col.render ? col.render(row, idx) : (row as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Page {currentPage} of {totalPages}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PremiumTable;
