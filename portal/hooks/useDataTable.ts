'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { javaApiClient } from '@/lib/java-api-client';
import type { HousingRecord } from '@/types';

export type SortDirection = 'asc' | 'desc' | null;

export interface FilterRange {
  min?: number;
  max?: number;
}

export interface UseDataTableReturn {
  data: HousingRecord[];
  filteredAndSortedData: HousingRecord[];
  sortField: string | null;
  sortDirection: SortDirection;
  filters: Record<string, FilterRange>;
  loading: boolean;
  error: string | null;
  setSort: (field: string) => void;
  setFilter: (field: string, min?: number, max?: number) => void;
  clearFilters: () => void;
  exportToCSV: () => void;
  exportToPDF: () => void;
  refetch: () => void;
}

export function useDataTable(): UseDataTableReturn {
  const [data, setData] = useState<HousingRecord[]>([]);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [filters, setFilters] = useState<Record<string, FilterRange>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const housingData = await javaApiClient.getHousingData();
      setData(housingData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load housing data';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    Object.entries(filters).forEach(([field, range]) => {
      if (range.min !== undefined || range.max !== undefined) {
        result = result.filter((record) => {
          const value = record[field as keyof HousingRecord] as number;
          if (range.min !== undefined && value < range.min) return false;
          if (range.max !== undefined && value > range.max) return false;
          return true;
        });
      }
    });

    if (sortField && sortDirection) {
      result.sort((a, b) => {
        const aVal = a[sortField as keyof HousingRecord] as number;
        const bVal = b[sortField as keyof HousingRecord] as number;
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, filters, sortField, sortDirection]);

  const setSort = useCallback((field: string) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField, sortDirection]);

  const setFilter = useCallback((field: string, min?: number, max?: number) => {
    setFilters((prev) => ({
      ...prev,
      [field]: { min, max },
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const exportToCSV = useCallback(() => {
    const headers = ['ID', 'Square Footage', 'Bedrooms', 'Bathrooms', 'Year Built', 'Lot Size', 'Distance to City Center', 'School Rating', 'Price'];
    const rows = filteredAndSortedData.map((record) => [
      record.id,
      record.square_footage,
      record.bedrooms,
      record.bathrooms,
      record.year_built,
      record.lot_size,
      record.distance_to_city_center,
      record.school_rating,
      record.price,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    link.setAttribute('href', url);
    link.setAttribute('download', `housing-data-${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredAndSortedData]);

  const exportToPDF = useCallback(async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF();
      const headers = [['ID', 'Sq Ft', 'Beds', 'Baths', 'Year', 'Lot Size', 'Distance', 'School', 'Price']];
      const rows = filteredAndSortedData.map((record) => [
        record.id.toString(),
        record.square_footage.toFixed(0),
        record.bedrooms.toString(),
        record.bathrooms.toFixed(1),
        record.year_built.toString(),
        record.lot_size.toFixed(2),
        record.distance_to_city_center.toFixed(2),
        record.school_rating.toFixed(1),
        `$${record.price.toLocaleString()}`,
      ]);

      autoTable(doc, {
        head: headers,
        body: rows,
        startY: 20,
      });

      doc.setFontSize(16);
      doc.text('Housing Data', 14, 15);

      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      doc.save(`housing-data-${timestamp}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
      setError('Failed to export PDF');
    }
  }, [filteredAndSortedData]);

  return {
    data,
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
    refetch: fetchData,
  };
}
