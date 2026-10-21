"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Button,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
  Badge,
  Pagination,
  Skeleton,
  ErrorMessage,
} from "@/components/ui";
import { usePredictions, usePredictionContext } from "@/hooks";
import { PAGINATION_DEFAULTS } from "@/lib/constants";
import type { SinglePredictionResponse } from "@/types";
import PredictionDetailCard from "./PredictionDetailCard";
import DeleteConfirmModal from "./DeleteConfirmModal";

// ─── Formatting helpers ────────────────────────────────────────────────────────

function formatDate(timestamp: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(timestamp));
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function PredictionHistoryTable() {
  const {
    data,
    loading,
    error,
    page,
    setPage,
    totalPages,
    refetch,
  } = usePredictions();

  const { selectedIds, toggleSelection, clearSelection } =
    usePredictionContext();

  const [detailPrediction, setDetailPrediction] =
    useState<SinglePredictionResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<
    SinglePredictionResponse | null
  >(null);
  const [deleteMultiple, setDeleteMultiple] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const predictions = data?.predictions ?? [];
  const total = data?.total ?? 0;
  const startItem = (page - 1) * PAGINATION_DEFAULTS.limit + 1;
  const endItem = Math.min(page * PAGINATION_DEFAULTS.limit, total);

  // ─── Delete handlers ──────────────────────────────────────────────────────

  const handleDeleteSingle = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { pythonApiClient } = await import("@/lib/api-client");
      await pythonApiClient.deletePrediction(deleteTarget.id);
      setDeleteTarget(null);
      refetch();
    } catch {
      // Error handled by API client
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, refetch]);

  const handleDeleteSelected = useCallback(async () => {
    setDeleting(true);
    try {
      const { pythonApiClient } = await import("@/lib/api-client");
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          pythonApiClient.deletePrediction(id)
        )
      );
      clearSelection();
      setDeleteMultiple(false);
      refetch();
    } catch {
      // Error handled by API client
    } finally {
      setDeleting(false);
    }
  }, [selectedIds, clearSelection, refetch]);

  // ─── Render states ────────────────────────────────────────────────────────

  if (error) {
    return (
      <ErrorMessage
        title="Failed to load predictions"
        message={error.detail || "Something went wrong."}
        onRetry={refetch}
      />
    );
  }

  // ─── Empty state ──────────────────────────────────────────────────────────

  if (!loading && predictions.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-secondary-100 flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-secondary-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-secondary-900 mb-1">
          No predictions yet
        </h3>
        <p className="text-sm text-secondary-500 mb-6 max-w-sm mx-auto">
          Get started by making your first property value prediction.
        </p>
        <Link href="/">
          <Button>Go to Estimator</Button>
        </Link>
      </div>
    );
  }

  // ─── Main table ───────────────────────────────────────────────────────────

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          {selectedIds.size > 0 && (
            <Badge variant="info">{selectedIds.size} selected</Badge>
          )}
          <span className="text-sm text-secondary-500">
            {total > 0
              ? `Showing ${startItem}–${endItem} of ${total} predictions`
              : ""}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.size >= 2 && (
            <Link href={`/comparison?ids=${Array.from(selectedIds).join(",")}`}>
              <Button variant="primary" size="sm">
                Add Selected to Comparison
              </Button>
            </Link>
          )}
          {selectedIds.size > 0 && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setDeleteMultiple(true)}
            >
              Delete Selected
            </Button>
          )}
          {total > 0 && (
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Table – desktop */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-secondary-200 bg-white shadow-sm">
        <Table aria-label="Prediction history">
          <TableCaption className="sr-only">
            Past property price predictions with features and results
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <span className="sr-only">Select</span>
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead className="text-right">Sq Footage</TableHead>
              <TableHead className="text-right">Beds</TableHead>
              <TableHead className="text-right">Baths</TableHead>
              <TableHead className="text-right">Predicted Price</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: PAGINATION_DEFAULTS.limit }).map(
                  (_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell><Skeleton className="h-4 w-4 rounded" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-6 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-6 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    </TableRow>
                  )
                )
              : predictions.map((p) => {
                  const isSelected = selectedIds.has(p.id);
                  return (
                    <TableRow
                      key={p.id}
                      className={isSelected ? "bg-primary-50" : ""}
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          aria-label={`Select prediction ${p.id}`}
                          checked={isSelected}
                          onChange={() => toggleSelection(p.id)}
                          className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm text-secondary-600">
                        #{p.id}
                      </TableCell>
                      <TableCell className="text-sm text-secondary-700">
                        {formatDate(p.timestamp)}
                      </TableCell>
                      <TableCell className="text-sm text-secondary-700 text-right tabular-nums">
                        {formatNumber(p.features.square_footage)} sqft
                      </TableCell>
                      <TableCell className="text-sm text-secondary-700 text-right tabular-nums">
                        {p.features.bedrooms}
                      </TableCell>
                      <TableCell className="text-sm text-secondary-700 text-right tabular-nums">
                        {p.features.bathrooms}
                      </TableCell>
                      <TableCell className="text-sm font-semibold text-secondary-900 text-right tabular-nums">
                        {formatCurrency(p.predicted_price)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDetailPrediction(p)}
                            aria-label={`View details for prediction ${p.id}`}
                            className="!px-2"
                          >
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(p)}
                            aria-label={`Delete prediction ${p.id}`}
                            className="!px-2 text-error-600 hover:text-error-700"
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
          </TableBody>
        </Table>
      </div>

      {/* Card list – mobile */}
      <div className="md:hidden space-y-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={`mobile-skeleton-${i}`}
                className="rounded-lg border border-secondary-200 bg-white p-4 space-y-3"
              >
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))
          : predictions.map((p) => {
              const isSelected = selectedIds.has(p.id);
              return (
                <div
                  key={p.id}
                  className={`rounded-lg border bg-white p-4 shadow-sm ${
                    isSelected
                      ? "border-primary-400 ring-1 ring-primary-200"
                      : "border-secondary-200"
                  }`}
                >
                  {/* Row 1: ID + checkbox */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        aria-label={`Select prediction ${p.id}`}
                        checked={isSelected}
                        onChange={() => toggleSelection(p.id)}
                        className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                      />
                      <span className="font-mono text-xs text-secondary-500">
                        #{p.id}
                      </span>
                    </div>
                    <Badge variant="default">
                      {formatCurrency(p.predicted_price)}
                    </Badge>
                  </div>

                  {/* Row 2: Timestamp */}
                  <p className="text-xs text-secondary-500 mb-3">
                    {formatDate(p.timestamp)}
                  </p>

                  {/* Row 3: Key features */}
                  <div className="grid grid-cols-3 gap-2 text-xs text-secondary-600 mb-3">
                    <span>{formatNumber(p.features.square_footage)} sqft</span>
                    <span>{p.features.bedrooms} bed</span>
                    <span>{p.features.bathrooms} bath</span>
                  </div>

                  {/* Row 4: Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-secondary-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDetailPrediction(p)}
                      className="flex-1 text-xs"
                    >
                      View Details
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(p)}
                      className="flex-1 text-xs text-error-600"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Detail slide-over / modal */}
      {detailPrediction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setDetailPrediction(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Prediction details"
        >
          <div onClick={(e) => e.stopPropagation()}>
            <PredictionDetailCard
              prediction={detailPrediction}
              onClose={() => setDetailPrediction(null)}
            />
          </div>
        </div>
      )}

      {/* Delete single confirmation */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteSingle}
        title="Delete Prediction"
        message={`Are you sure you want to delete prediction #${deleteTarget?.id}? This action cannot be undone.`}
        loading={deleting}
      />

      {/* Delete multiple confirmation */}
      <DeleteConfirmModal
        isOpen={deleteMultiple}
        onClose={() => setDeleteMultiple(false)}
        onConfirm={handleDeleteSelected}
        title="Delete Selected Predictions"
        message={`Are you sure you want to delete ${selectedIds.size} selected prediction(s)? This action cannot be undone.`}
        loading={deleting}
      />
    </>
  );
}
