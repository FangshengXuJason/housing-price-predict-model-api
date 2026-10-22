'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { pythonApiClient } from '@/lib/api-client';
import { PAGINATION_DEFAULTS } from '@/lib/constants';
import type {
  SinglePredictionResponse,
  PredictionHistoryResponse,
  ComparisonResponse,
  ApiError,
} from '@/types';

// ─── Prediction Context (selected predictions for comparison) ──────────────────

interface PredictionContextValue {
  selectedIds: Set<number>;
  selectedPredictions: SinglePredictionResponse[];
  toggleSelection: (id: number) => void;
  clearSelection: () => void;
}

const PredictionContext = createContext<PredictionContextValue | undefined>(undefined);

export function PredictionProvider({ children }: { children: ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectedPredictions, setSelectedPredictions] = useState<SinglePredictionResponse[]>([]);

  const toggleSelection = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setSelectedPredictions([]);
  }, []);

  return (
    <PredictionContext.Provider value={{ selectedIds, selectedPredictions, toggleSelection, clearSelection }}>
      {children}
    </PredictionContext.Provider>
  );
}

export function usePredictionContext() {
  const ctx = useContext(PredictionContext);
  if (!ctx) throw new Error('usePredictionContext must be used within PredictionProvider');
  return ctx;
}

// ─── usePredictions ────────────────────────────────────────────────────────────

interface UsePredictionsReturn {
  data: PredictionHistoryResponse | null;
  loading: boolean;
  error: ApiError | null;
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  refetch: () => void;
}

export function usePredictions(): UsePredictionsReturn {
  const [data, setData] = useState<PredictionHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [page, setPage] = useState(1);

  const fetchPredictions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await pythonApiClient.getPredictions({
        skip: (page - 1) * PAGINATION_DEFAULTS.limit,
        limit: PAGINATION_DEFAULTS.limit,
      });
      setData(result);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    const load = async () => {
      await fetchPredictions();
    };
    load();
  }, [fetchPredictions]);

  const totalPages = data ? Math.ceil(data.total / PAGINATION_DEFAULTS.limit) : 0;

  return { data, loading, error, page, setPage, totalPages, refetch: fetchPredictions };
}

// ── useComparison ─────────────────────────────────────────────────────────────

interface UseComparisonReturn {
  comparisonData: ComparisonResponse | null;
  isLoading: boolean;
  error: string | null;
  compare: (ids: number[]) => Promise<void>;
}

export function useComparison(): UseComparisonReturn {
  const [comparisonData, setComparisonData] = useState<ComparisonResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const compare = useCallback(async (ids: number[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await pythonApiClient.comparePredictions({ prediction_ids: ids });
      setComparisonData(result);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.detail || 'Comparison failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    comparisonData,
    isLoading,
    error,
    compare,
  };
}
