import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchField?: keyof T | ((item: T) => string);
  filters?: React.ReactNode;
  actions?: (row: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  emptyStateMessage?: string;
}

export function DataTable<T>({
  data,
  columns,
  searchPlaceholder = 'Search records...',
  searchField,
  filters,
  actions,
  keyExtractor,
  pageSize = 10,
  onRowClick,
  emptyStateMessage,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter Data
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(item => {
      if (typeof searchField === 'function') {
        return searchField(item).toLowerCase().includes(searchTerm.toLowerCase());
      }
      if (searchField && item[searchField]) {
        return String(item[searchField]).toLowerCase().includes(searchTerm.toLowerCase());
      }
      // Fallback search across all string/number fields
      return Object.values(item as Record<string, any>).some(val => 
        val && String(val).toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [data, searchTerm, searchField]);

  // Sort Data
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    return [...filteredData].sort((a, b) => {
      const valA = a[sortColumn];
      const valB = b[sortColumn];
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Paginate Data
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (columnKey?: keyof T) => {
    if (!columnKey) return;
    if (sortColumn === columnKey) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  return (
    <div className="bg-white border-3 border-slate-900 brutal-shadow p-4 rounded-none">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4 pb-3 border-b-2 border-slate-900">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-slate-50 border-2 border-slate-900 focus:outline-none focus:bg-amber-50 placeholder:text-slate-500"
          />
        </div>

        {filters && (
          <div className="flex flex-wrap items-center gap-2">
            {filters}
          </div>
        )}
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto border-2 border-slate-900">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white uppercase font-black tracking-wide border-b-2 border-slate-900">
              {columns.map((col, i) => (
                <th
                  key={i}
                  className={`p-3 font-extrabold select-none ${col.sortable ? 'cursor-pointer hover:bg-slate-800' : ''}`}
                  onClick={() => col.sortable && handleSort(col.accessorKey)}
                  style={{ width: col.width }}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>{col.header}</span>
                    {col.sortable && <ArrowUpDown className="w-3 h-3 text-slate-400" />}
                  </div>
                </th>
              ))}
              {actions && <th className="p-3 font-extrabold text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-200 font-medium text-slate-900">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="p-0">
                  <EmptyState description={emptyStateMessage} />
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr
                  key={keyExtractor(row)}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`hover:bg-amber-100/60 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  } ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}`}
                >
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="p-3 align-middle font-semibold border-r border-slate-200">
                      {col.cell
                        ? col.cell(row, idx)
                        : col.accessorKey
                        ? String(row[col.accessorKey] ?? '')
                        : null}
                    </td>
                  ))}
                  {actions && (
                    <td 
                      className="p-3 text-right align-middle font-bold border-l border-slate-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-3 border-t-2 border-slate-900 text-xs font-bold text-slate-800">
        <div>
          Showing <span className="text-indigo-700 font-black">{sortedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to{' '}
          <span className="text-indigo-700 font-black">{Math.min(currentPage * pageSize, sortedData.length)}</span> of{' '}
          <span className="text-slate-950 font-black">{sortedData.length}</span> entries
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 border-2 border-slate-900 bg-white brutal-shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-all"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 bg-amber-300 border-2 border-slate-900 font-black">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 border-2 border-slate-900 bg-white brutal-shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-all"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
