'use client';

import { useEffect } from 'react';
import { useComparison, usePredictionContext } from '@/hooks';
import { Card, CardBody, ErrorMessage, Skeleton } from '@/components/ui';
import ComparisonSummary from '@/components/ComparisonSummary';
import ComparisonTable from '@/components/ComparisonTable';
import ComparisonChart from '@/components/charts/ComparisonChart';
import type { SinglePredictionResponse } from '@/types';

interface ComparisonPanelProps {
  preSelectedIds?: number[];
}

export default function ComparisonPanel({ preSelectedIds = [] }: ComparisonPanelProps) {
  const {
    comparisonData,
    isLoading,
    error,
    compare,
  } = useComparison();

  const { selectedPredictions } = usePredictionContext();

  // On mount: merge preSelectedIds (from URL) + context predictions, then auto-compare
  useEffect(() => {
    const contextIds = selectedPredictions.map((p: SinglePredictionResponse) => p.id);
    const merged = Array.from(new Set([...preSelectedIds, ...contextIds]));

    if (merged.length >= 2) {
      compare(merged);
    }
    // Only run on mount with initial preSelectedIds
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preSelectedIds]);

  return (
    <div className="space-y-8">
      {/* Error display */}
      {error && <ErrorMessage message={error} />}

      {/* Loading skeleton */}
      {isLoading && !comparisonData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardBody className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-28" />
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
          <Card>
            <CardBody>
              <Skeleton className="h-6 w-40 mb-4" />
              <Skeleton className="h-64 w-full" />
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-48 w-full" />
            </CardBody>
          </Card>
        </div>
      )}

      {/* Results Area */}
      {comparisonData && (
        <>
          {/* Summary Statistics */}
          <ComparisonSummary summary={comparisonData.summary} />

          {/* Comparison Chart */}
          <Card>
            <CardBody>
              <h2 className="text-xl font-semibold text-secondary-900 mb-4">
                Price Comparison
              </h2>
              <ComparisonChart predictions={comparisonData.predictions} />
            </CardBody>
          </Card>

          {/* Detailed Feature Comparison */}
          <Card>
            <CardBody>
              <h2 className="text-xl font-semibold text-secondary-900 mb-4">
                Feature Comparison
              </h2>
              <ComparisonTable predictions={comparisonData.predictions} />
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
