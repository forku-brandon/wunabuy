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
    <div className="w-full bg-white dark:bg-[#151C28] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 transition-colors">
      {/* Header Bar: Search Input & Actions */}
      {(searchable || actions) && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          {searchable ? (
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-100/80 dark:bg-slate-800/80 border-none rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-900 dark:text-slate-100"
              />
            </div>
          ) : (
            <div />
          )}

          {actions && <div className="flex items-center space-x-3">{actions}</div>}
        </div>
      )}

      {/* Touch-Friendly Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-extrabold border-b border-slate-200/80 dark:border-slate-800">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`py-3.5 px-4 ${
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
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
            {currentSlice.length > 0 ? (
              currentSlice.map((item, rowIdx) => (
                <tr
                  key={item.id || rowIdx}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`py-4 px-4 ${
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      } ${col.className || ''}`}
                    >
                      {col.render(item)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-slate-400 dark:text-slate-500">
                  <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="font-semibold text-xs">{emptyMessage}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-semibold">
        <div>
          Showing <strong className="text-slate-900 dark:text-slate-100">{totalEntries > 0 ? startIndex + 1 : 0}</strong> to{' '}
          <strong className="text-slate-900 dark:text-slate-100">{endIndex}</strong> of{' '}
          <strong className="text-slate-900 dark:text-slate-100">{totalEntries}</strong> entries
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
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
