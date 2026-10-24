'use client';

import { useState, useEffect, useCallback } from 'react';
import { javaApiClient } from '@/lib/java-api-client';
import type { AggregateStatisticsResponse } from '@/types';

export interface HousingRecord {
  id: number;
  square_footage: number;
  bedrooms: number;
  bathrooms: number;
  year_built: number;
  lot_size: number;
  distance_to_city_center: number;
  school_rating: number;
  price: number;
}

export interface DashboardData {
  statistics: AggregateStatisticsResponse | null;
  priceByBedroom: Record<number, number> | null;
  correlations: Record<string, number> | null;
  rawData: HousingRecord[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDashboardData(): DashboardData {
  const [statistics, setStatistics] = useState<AggregateStatisticsResponse | null>(null);
  const [priceByBedroom, setPriceByBedroom] = useState<Record<number, number> | null>(null);
  const [correlations, setCorrelations] = useState<Record<string, number> | null>(null);
  const [rawData, setRawData] = useState<HousingRecord[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, priceByBedroomRes, correlationsRes, rawRes] = await Promise.allSettled([
        javaApiClient.getStatistics(),
        javaApiClient.getPriceByBedroom(),
        javaApiClient.getCorrelations(),
        fetch('/java-api/dashboard/data').then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        }),
      ]);

      // Track if we have any data to display
      let hasAnyData = false;
      let errorMessage = '';

      if (statsRes.status === 'fulfilled') {
        setStatistics(statsRes.value);
        hasAnyData = true;
      } else {
        errorMessage += 'Failed to load statistics. ';
      }

      if (priceByBedroomRes.status === 'fulfilled') {
        setPriceByBedroom(priceByBedroomRes.value);
        hasAnyData = true;
      } else {
        errorMessage += 'Failed to load price by bedroom. ';
      }

      if (correlationsRes.status === 'fulfilled') {
        setCorrelations(correlationsRes.value);
        hasAnyData = true;
      } else {
        errorMessage += 'Failed to load correlations. ';
      }

      if (rawRes.status === 'fulfilled') {
        setRawData(rawRes.value as HousingRecord[]);
        hasAnyData = true;
      } else {
        errorMessage += 'Failed to load raw data. ';
      }

      // Only show error if we have no data at all
      if (!hasAnyData) {
        setError(errorMessage.trim() || 'Failed to load dashboard data');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { statistics, priceByBedroom, correlations, rawData, loading, error, refetch: fetchData };
}
