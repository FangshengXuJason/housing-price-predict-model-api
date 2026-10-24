"use client";

import { useState, useEffect } from "react";
import { javaApiClient } from "@/lib/java-api-client";
import type { AggregateStatisticsResponse } from "@/types";
import { Card, CardBody, Skeleton, Badge } from "@/components/ui";

interface AnalyticsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPredictionPrice?: number | null;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export default function AnalyticsSidebar({
  isOpen,
  onClose,
  currentPredictionPrice,
}: AnalyticsSidebarProps) {
  const [stats, setStats] = useState<AggregateStatisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    dataset: true,
    price: true,
    bedroom: false,
    correlation: false,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await javaApiClient.getStatistics();
        setStats(data);
        setError(null);
      } catch (err) {
        setError("Failed to load analytics");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const getPositionIndicator = () => {
    if (!stats || !currentPredictionPrice) return null;
    const { min, max } = stats.price_statistics;
    const range = max - min;
    if (range === 0) return 50;
    const position = ((currentPredictionPrice - min) / range) * 100;
    return Math.max(0, Math.min(100, position));
  };

  const positionPercent = getPositionIndicator();

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <aside
        className={`fixed right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-secondary-900 shadow-2xl z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="complementary"
        aria-label="Analytics sidebar"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-secondary-900 border-b border-secondary-200 dark:border-secondary-700 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-secondary-900 dark:text-secondary-100">
            Dataset Analytics
          </h2>
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 transition-colors"
            aria-label="Close analytics sidebar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loading && (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-error-200 bg-error-50 p-4 text-sm text-error-700">
              {error}
            </div>
          )}

          {stats && !loading && (
            <>
              {/* Dataset Summary */}
              <CollapsibleSection
                title="Dataset Summary"
                expanded={expandedSections.dataset}
                onToggle={() => toggleSection("dataset")}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary-600 dark:text-secondary-400">Total Records</span>
                    <Badge variant="primary" size="sm">{stats.count.toLocaleString()}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary-600 dark:text-secondary-400">Price Range</span>
                    <span className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                      {formatCurrency(stats.price_statistics.min)} – {formatCurrency(stats.price_statistics.max)}
                    </span>
                  </div>
                </div>
              </CollapsibleSection>

              {/* Price Statistics */}
              <CollapsibleSection
                title="Price Statistics"
                expanded={expandedSections.price}
                onToggle={() => toggleSection("price")}
              >
                <div className="space-y-2">
                  <StatRow label="Mean" value={formatCurrency(stats.price_statistics.mean)} />
                  <StatRow label="Median" value={formatCurrency(stats.price_statistics.median)} />
                  <StatRow label="Std Dev" value={formatCurrency(stats.price_statistics.std_dev)} />
                  <StatRow label="Min" value={formatCurrency(stats.price_statistics.min)} />
                  <StatRow label="Max" value={formatCurrency(stats.price_statistics.max)} />
                </div>
              </CollapsibleSection>

              {/* Current Prediction Context */}
              {currentPredictionPrice && (
                <Card className="border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20">
                  <CardBody className="p-4">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-2">
                      Your Prediction Position
                    </p>
                    <p className="text-lg font-bold text-secondary-900 dark:text-secondary-100 mb-3">
                      {formatCurrency(currentPredictionPrice)}
                    </p>
                    <div className="relative h-2 bg-secondary-200 dark:bg-secondary-700 rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${positionPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5 text-xs text-secondary-500 dark:text-secondary-400">
                      <span>Min</span>
                      <span>Max</span>
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Price by Bedroom */}
              <CollapsibleSection
                title="Price by Bedroom"
                expanded={expandedSections.bedroom}
                onToggle={() => toggleSection("bedroom")}
              >
                <div className="space-y-1.5">
                  {Object.entries(stats.price_by_bedroom)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([bedroom, price]) => (
                      <div key={bedroom} className="flex justify-between items-center py-1 border-b border-secondary-100 dark:border-secondary-800 last:border-0">
                        <span className="text-sm text-secondary-600 dark:text-secondary-400">
                          {bedroom} {Number(bedroom) === 1 ? "Bedroom" : "Bedrooms"}
                        </span>
                        <span className="text-sm font-semibold text-secondary-900 dark:text-secondary-100">
                          {formatCurrency(price)}
                        </span>
                      </div>
                    ))}
                </div>
              </CollapsibleSection>

              {/* Feature Correlations */}
              <CollapsibleSection
                title="Feature Correlations"
                expanded={expandedSections.correlation}
                onToggle={() => toggleSection("correlation")}
              >
                <div className="space-y-3">
                  {Object.entries(stats.correlations)
                    .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
                    .map(([feature, corr]) => {
                      const absCorr = Math.abs(corr);
                      const barColor = corr >= 0 ? "bg-primary-500" : "bg-rose-500";
                      const label = feature
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase());
                      return (
                        <div key={feature}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium text-secondary-700 dark:text-secondary-300 truncate">
                              {label}
                            </span>
                            <span className="text-xs font-bold text-secondary-900 dark:text-secondary-100 ml-2">
                              {formatNumber(corr, 3)}
                            </span>
                          </div>
                          <div className="h-1.5 bg-secondary-100 dark:bg-secondary-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${barColor} rounded-full transition-all duration-500`}
                              style={{ width: `${absCorr * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CollapsibleSection>
            </>
          )}
        </div>
      </aside>
    </>
  );
}

function CollapsibleSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-secondary-200 dark:border-secondary-700 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-secondary-50 dark:bg-secondary-800/50 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors text-left"
        aria-expanded={expanded}
      >
        <span className="text-sm font-semibold text-secondary-900 dark:text-secondary-100">
          {title}
        </span>
        <svg
          className={`w-4 h-4 text-secondary-500 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && <div className="px-4 py-3">{children}</div>}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-secondary-600 dark:text-secondary-400">{label}</span>
      <span className="text-sm font-semibold text-secondary-900 dark:text-secondary-100 tabular-nums">
        {value}
      </span>
    </div>
  );
}
