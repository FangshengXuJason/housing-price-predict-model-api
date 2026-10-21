'use client';

import { useState, useCallback } from 'react';
import { useComparison, usePredictionContext } from '@/hooks';
import { Button, Card, CardBody, ErrorMessage, Skeleton } from '@/components/ui';
import ComparisonSummary from '@/components/ComparisonSummary';
import ComparisonTable from '@/components/ComparisonTable';
import ComparisonChart from '@/components/charts/ComparisonChart';
import type { SinglePredictionResponse } from '@/types';

export default function ComparisonPanel() {
  const {
    selectedPredictionIds,
    addPredictionId,
    removePredictionId,
    clearSelection,
    comparisonData,
    isLoading,
    error,
    compare,
    clearComparison,
  } = useComparison();

  const { selectedPredictions } = usePredictionContext();
  const [manualId, setManualId] = useState('');

  // Merge context-selected IDs with manually added ones
  const allSelectedIds = Array.from(
    new Set([
      ...selectedPredictionIds,
      ...selectedPredictions.map((p: SinglePredictionResponse) => p.id),
    ])
  );

  const handleAddId = useCallback(() => {
    const id = parseInt(manualId.trim(), 10);
    if (!isNaN(id) && id > 0 && !allSelectedIds.includes(id)) {
      addPredictionId(id);
      setManualId('');
    }
  }, [manualId, allSelectedIds, addPredictionId]);

  const handleCompare = useCallback(() => {
    if (allSelectedIds.length >= 2) {
      compare(allSelectedIds);
    }
  }, [allSelectedIds, compare]);

  const handleClear = useCallback(() => {
    clearSelection();
    clearComparison();
  }, [clearSelection, clearComparison]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleAddId();
      }
    },
    [handleAddId]
  );

  return (
    <div className="space-y-8">
      {/* Selection Area */}
      <Card>
        <CardBody>
          <h2 className="text-xl font-semibold text-secondary-900 mb-4">
            Select Predictions to Compare
          </h2>

          {/* Selected IDs as removable badges */}
          {allSelectedIds.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-secondary-600 mb-2">
                Selected predictions:
              </p>
              <div className="flex flex-wrap gap-2">
                {allSelectedIds.map((id) => (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                  >
                    #{id}
                    <button
                      onClick={() => removePredictionId(id)}
                      className="ml-1 text-primary-600 hover:text-primary-900 transition-colors"
                      aria-label={`Remove prediction ${id}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Manual ID input */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <label
                htmlFor="prediction-id"
                className="block text-sm font-medium text-secondary-700 mb-1"
              >
                Enter Prediction ID
              </label>
              <input
                id="prediction-id"
                type="number"
                min="1"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. 1, 2, 3..."
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-secondary-900 placeholder-secondary-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleAddId}
                disabled={!manualId.trim() || isNaN(parseInt(manualId.trim(), 10)) || parseInt(manualId.trim(), 10) <= 0}
                variant="secondary"
              >
                Add
              </Button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleCompare}
              disabled={allSelectedIds.length < 2 || isLoading}
              variant="primary"
            >
              {isLoading ? 'Comparing...' : 'Compare'}
            </Button>
            <Button
              onClick={handleClear}
              disabled={allSelectedIds.length === 0 && !comparisonData}
              variant="secondary"
            >
              Clear
            </Button>
          </div>

          {allSelectedIds.length < 2 && (
            <p className="mt-3 text-sm text-secondary-500">
              Select at least 2 predictions to compare.
            </p>
          )}
        </CardBody>
      </Card>

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
