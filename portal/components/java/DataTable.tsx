'use client';

import { useState, useMemo } from 'react';
import { useDataTable, type SortDirection } from '@/hooks/useDataTable';
import {
  Card,
  CardBody,
  Button,
  Input,
  Badge,
  Spinner,
  ErrorMessage,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui';
import type { HousingRecord } from '@/types';

// ─── Column Definitions ───────────────────────────────────────────────────────

interface ColumnDef {
  key: keyof HousingRecord;
  label: string;
  format: (value: number) => string;
  align: 'left' | 'right';
}

const COLUMNS: ColumnDef[] = [
  { key: 'id', label: 'ID', format: (v) => v.toString(), align: 'left' },
  {
    key: 'price',
    label: 'Price',
    format: (v) =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(v),
    align: 'right',
  },
  {
    key: 'square_footage',
    label: 'Square Footage',
    format: (v) => v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
    align: 'right',
  },
  { key: 'bedrooms', label: 'Bedrooms', format: (v) => v.toString(), align: 'right' },
  {
    key: 'bathrooms',
    label: 'Bathrooms',
    format: (v) => v.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    align: 'right',
  },
  { key: 'year_built', label: 'Year Built', format: (v) => v.toString(), align: 'right' },
  {
    key: 'lot_size',
    label: 'Lot Size',
    format: (v) => v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
    align: 'right',
  },
  {
    key: 'distance_to_city_center',
    label: 'Distance to City Center',
    format: (v) => v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    align: 'right',
  },
  {
    key: 'school_rating',
    label: 'School Rating',
    format: (v) => v.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    align: 'right',
  },
];

const FILTERABLE_FIELDS: { key: string; label: string }[] = [
  { key: 'price', label: 'Price' },
  { key: 'square_footage', label: 'Square Footage' },
  { key: 'bedrooms', label: 'Bedrooms' },
  { key: 'bathrooms', label: 'Bathrooms' },
  { key: 'year_built', label: 'Year Built' },
  { key: 'lot_size', label: 'Lot Size' },
  { key: 'distance_to_city_center', label: 'Distance to City' },
  { key: 'school_rating', label: 'School Rating' },
];

// ─── Sort Icon ────────────────────────────────────────────────────────────────

function SortIcon({ field, sortField, sortDirection }: { field: string; sortField: string | null; sortDirection: SortDirection }) {
  const isActive = sortField === field;
  return (
    <span className="inline-flex flex-col ml-1 leading-none">
      <span
        className={`text-[10px] leading-[10px] ${
          isActive && sortDirection === 'asc' ? 'text-primary-600 dark:text-primary-400' : 'text-secondary-300 dark:text-secondary-600'
        }`}
      >
        ↑
      </span>
      <span
        className={`text-[10px] leading-[10px] ${
          isActive && sortDirection === 'desc' ? 'text-primary-600 dark:text-primary-400' : 'text-secondary-300 dark:text-secondary-600'
        }`}
      >
        ↓
      </span>
    </span>
  );
}

// ─── Filter Panel ─────────────────────────────────────────────────────────────

interface FilterPanelProps {
  filters: Record<string, { min?: number; max?: number }>;
  onSetFilter: (field: string, min?: number, max?: number) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

function FilterPanel({ filters, onSetFilter, onClearFilters, activeFilterCount }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4">
      <div className="flex items-center gap-3 mb-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
        >
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="primary" size="sm">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Clear All
          </Button>
        )}
      </div>

      {isOpen && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-lg border border-secondary-200 bg-secondary-50 dark:bg-secondary-900/50 dark:border-secondary-700">
          {FILTERABLE_FIELDS.map(({ key, label }) => {
            const current = filters[key] || {};
            return (
              <div key={key} className="space-y-2">
                <p className="text-xs font-semibold text-secondary-600 dark:text-secondary-400 uppercase tracking-wider">
                  {label}
                </p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={current.min ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      onSetFilter(key, val === '' ? undefined : Number(val), current.max);
                    }}
                    className="flex-1 text-sm"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={current.max ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      onSetFilter(key, current.min, val === '' ? undefined : Number(val));
                    }}
                    className="flex-1 text-sm"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DataTable() {
  const {
    filteredAndSortedData,
    sortField,
    sortDirection,
    filters,
    loading,
    error,
    setSort,
    setFilter,
    clearFilters,
    exportToCSV,
    exportToPDF,
    refetch,
  } = useDataTable();

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter((f) => f.min !== undefined || f.max !== undefined).length;
  }, [filters]);

  // ── Loading state ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <Card>
        <CardBody className="flex flex-col items-center justify-center py-16">
          <Spinner size="lg" className="text-primary-600 dark:text-primary-400" />
          <p className="mt-4 text-sm text-secondary-500 dark:text-secondary-400">Loading housing data...</p>
        </CardBody>
      </Card>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────

  if (error) {
    return (
      <Card>
        <CardBody>
          <ErrorMessage title="Failed to load data" message={error} onRetry={refetch} />
        </CardBody>
      </Card>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Card>
      <CardBody>
        {/* Header with title and export buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
              Housing Data
            </h3>
            <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
              {filteredAndSortedData.length} records
              {activeFilterCount > 0 && ` · ${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={exportToCSV} className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Export CSV
            </Button>
            <Button variant="secondary" size="sm" onClick={exportToPDF} className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              Export PDF
            </Button>
          </div>
        </div>

        {/* Filter panel */}
        <FilterPanel
          filters={filters}
          onSetFilter={setFilter}
          onClearFilters={clearFilters}
          activeFilterCount={activeFilterCount}
        />

        {/* Data table */}
        <div className="overflow-x-auto -mx-6 px-6">
          <Table>
            <TableHeader>
              <TableRow>
                {COLUMNS.map((col) => (
                  <TableHead
                    key={col.key}
                    className={`cursor-pointer select-none hover:text-secondary-900 dark:hover:text-secondary-100 transition-colors ${
                      col.align === 'right' ? 'text-right' : ''
                    }`}
                    onClick={() => setSort(col.key)}
                  >
                    <span className="inline-flex items-center">
                      {col.label}
                      <SortIcon field={col.key} sortField={sortField} sortDirection={sortDirection} />
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={COLUMNS.length} className="text-center py-12 text-secondary-500 dark:text-secondary-400">
                    No data matches the current filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedData.map((record) => (
                  <TableRow key={record.id}>
                    {COLUMNS.map((col) => (
                      <TableCell
                        key={col.key}
                        className={`${
                          col.align === 'right' ? 'text-right' : ''
                        } ${col.key === 'id' ? 'font-medium text-secondary-900 dark:text-secondary-100' : ''}`}
                      >
                        {col.format(record[col.key] as number)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer with record count */}
        <div className="mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-700 flex items-center justify-between">
          <p className="text-xs text-secondary-500 dark:text-secondary-400">
            Showing {filteredAndSortedData.length} of {filteredAndSortedData.length} records
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
