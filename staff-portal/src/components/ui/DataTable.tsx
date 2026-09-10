import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { Button } from './Button';

export interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  pageSize?: number;
  emptyMessage?: string;
  actions?: React.ReactNode;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = true,
  searchPlaceholder = 'Search table entries...',
  searchKeys,
  pageSize = 5,
  emptyMessage = 'No matching records found.',
  actions,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Search filtering
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase();

    return data.filter((item) => {
      if (searchKeys && searchKeys.length > 0) {
        return searchKeys.some((key) => {
          const val = item[key];
          return val !== null && val !== undefined && String(val).toLowerCase().includes(query);
        });
      }

      return Object.values(item).some(
        (val) => val !== null && val !== undefined && String(val).toLowerCase().includes(query)
      );
    });
  }, [data, searchQuery, searchKeys]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const totalEntries = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalEntries);
  const currentSlice = filteredData.slice(startIndex, endIndex);

  return (
    <div className="w-full bg-white dark:bg-[#111827] rounded-xl border border-slate-200/70 dark:border-slate-800/80 shadow-xs overflow-hidden transition-colors">
      {/* Header Bar: Search Input & Actions */}
      {(searchable || actions) && (
        <div className="p-4 sm:p-4.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/60">
          {searchable ? (
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 font-normal text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              />
            </div>
          ) : (
            <div />
          )}

          {actions && <div className="flex items-center space-x-2.5">{actions}</div>}
        </div>
      )}

      {/* Clean Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200/70 dark:border-slate-800/80">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`py-3 px-4 ${
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                  } ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 font-normal text-slate-700 dark:text-slate-300">
            {currentSlice.length > 0 ? (
              currentSlice.map((item, rowIdx) => (
                <tr
                  key={item.id || rowIdx}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {columns.map((col, cIdx) => (
                    <td
                      key={col.key || `col_${cIdx}`}
                      className={`py-3.5 px-4 ${
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      } ${col.className || ''}`}
                    >
                      {typeof col.render === 'function'
                        ? col.render(item)
                        : (item as any)[col.key] ?? null}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-slate-400 dark:text-slate-500">
                  <Inbox className="w-7 h-7 mx-auto mb-2 opacity-40" />
                  <p className="font-medium text-xs">{emptyMessage}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 dark:border-slate-800/70 text-xs text-slate-500 dark:text-slate-400 font-medium">
        <div>
          Showing <span className="font-semibold text-slate-900 dark:text-slate-100">{totalEntries > 0 ? startIndex + 1 : 0}</span> to{' '}
          <span className="font-semibold text-slate-900 dark:text-slate-100">{endIndex}</span> of{' '}
          <span className="font-semibold text-slate-900 dark:text-slate-100">{totalEntries}</span> entries
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Page {validCurrentPage} of {totalPages}
          </span>
          <div className="flex items-center space-x-1.5">
            <Button
              size="sm"
              variant="outline"
              disabled={validCurrentPage <= 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={validCurrentPage >= totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Next
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
