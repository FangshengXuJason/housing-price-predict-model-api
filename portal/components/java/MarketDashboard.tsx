'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell,
} from 'recharts';
import { Card, CardBody, Skeleton, ErrorMessage } from '@/components/ui';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui';
import { useDashboardData } from '@/hooks/useDashboardData';
import type { FeatureStatistics } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FEATURE_LABELS: Record<string, string> = {
  square_footage: 'Square Footage',
  bedrooms: 'Bedrooms',
  bathrooms: 'Bathrooms',
  year_built: 'Year Built',
  lot_size: 'Lot Size',
  distance_to_city_center: 'Distance to City',
  school_rating: 'School Rating',
  price: 'Price',
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

function formatNumber(value: number, decimals = 2): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardBody className="text-center">
        <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400">
          {value}
        </p>
        {sub && (
          <p className="text-xs text-secondary-400 dark:text-secondary-500 mt-1">{sub}</p>
        )}
      </CardBody>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MarketDashboard() {
  const { statistics, priceByBedroom, correlations, rawData, loading, error, refetch } =
    useDashboardData();

  // ── Derived data ──────────────────────────────────────────────────────────

  const priceHistogram = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];
    const prices = rawData.map((d) => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const binCount = 6;
    const binWidth = (max - min) / binCount;
    const bins = Array.from({ length: binCount }, (_, i) => {
      const lo = min + i * binWidth;
      const hi = lo + binWidth;
      const count = prices.filter((p) => (i === binCount - 1 ? p >= lo && p <= hi : p >= lo && p < hi)).length;
      return {
        range: `${formatCompact(lo)}-${formatCompact(hi)}`,
        count,
        lo,
        hi,
      };
    });
    return bins;
  }, [rawData]);

  const bedroomData = useMemo(() => {
    if (!priceByBedroom) return [];
    return Object.entries(priceByBedroom)
      .map(([bedrooms, avgPrice]) => ({
        bedrooms: `${bedrooms} BR`,
        avgPrice,
        bedroomsNum: Number(bedrooms),
      }))
      .sort((a, b) => a.bedroomsNum - b.bedroomsNum);
  }, [priceByBedroom]);

  const correlationData = useMemo(() => {
    if (!correlations) return [];
    return Object.entries(correlations)
      .map(([feature, value]) => ({
        feature: FEATURE_LABELS[feature] || feature,
        value: Number(value),
      }))
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  }, [correlations]);

  const scatterSqFootage = useMemo(() => {
    if (!rawData) return [];
    return rawData.map((d) => ({ x: d.square_footage, y: d.price }));
  }, [rawData]);

  const scatterDistance = useMemo(() => {
    if (!rawData) return [];
    return rawData.map((d) => ({ x: d.distance_to_city_center, y: d.price }));
  }, [rawData]);

  const trendLineSq = useMemo(() => computeTrendLine(scatterSqFootage), [scatterSqFootage]);
  const trendLineDist = useMemo(() => computeTrendLine(scatterDistance), [scatterDistance]);

  const featureStatsRows = useMemo(() => {
    if (!statistics) return [];
    const rows: { name: string; stats: FeatureStatistics; isPrice: boolean }[] = [];
    rows.push({ name: 'Price', stats: statistics.price_statistics, isPrice: true });
    Object.entries(statistics.feature_statistics).forEach(([key, stats]) => {
      rows.push({ name: FEATURE_LABELS[key] || key, stats, isPrice: false });
    });
    return rows;
  }, [statistics]);

  // ── Loading state ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i}>
              <CardBody className="space-y-3">
                <Skeleton className="h-4 w-24 mx-auto" />
                <Skeleton className="h-8 w-32 mx-auto" />
              </CardBody>
            </Card>
          ))}
        </div>
        {[0, 1, 2, 3].map((i) => (
          <Card key={i}>
            <CardBody className="space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-64 w-full" />
            </CardBody>
          </Card>
        ))}
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────

  if (error) {
    return (
      <ErrorMessage
        title="Failed to load dashboard"
        message={error}
        onRetry={refetch}
      />
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const priceStats = statistics?.price_statistics;

  return (
    <div className="space-y-8">
      {/* Section 1: Summary Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Average Price"
          value={priceStats ? formatCurrency(priceStats.mean) : '—'}
        />
        <StatCard
          label="Median Price"
          value={priceStats ? formatCurrency(priceStats.median) : '—'}
        />
        <StatCard
          label="Price Range"
          value={priceStats ? `${formatCompact(priceStats.min)} – ${formatCompact(priceStats.max)}` : '—'}
          sub={priceStats ? `${formatCurrency(priceStats.max - priceStats.min)} spread` : undefined}
        />
        <StatCard
          label="Dataset Size"
          value={statistics ? statistics.count.toLocaleString() : '—'}
          sub="properties"
        />
      </section>

      {/* Section 2 & 3: Price Distribution + Price by Bedroom */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Distribution Histogram */}
        <Card>
          <CardBody>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
              Price Distribution
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priceHistogram} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="range"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    angle={-20}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    label={{
                      value: 'Count',
                      angle: -90,
                      position: 'insideLeft',
                      offset: -5,
                      style: { fill: '#64748b', fontSize: 12 },
                    }}
                  />
                  <Tooltip
                    formatter={(value) => [value, 'Properties']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Price by Bedroom */}
        <Card>
          <CardBody>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
              Average Price by Bedrooms
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bedroomData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="bedrooms"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(v) => formatCompact(v)}
                    label={{
                      value: 'Avg Price',
                      angle: -90,
                      position: 'insideLeft',
                      offset: -5,
                      style: { fill: '#64748b', fontSize: 12 },
                    }}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), 'Avg Price']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Bar dataKey="avgPrice" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </section>

      {/* Section 4: Feature Correlations */}
      <section>
        <Card>
          <CardBody>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
              Feature Correlations with Price
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={correlationData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    domain={[-1, 1]}
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="feature"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    width={90}
                  />
                  <Tooltip
                    formatter={(value) => [Number(value).toFixed(3), 'Correlation']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {correlationData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.value >= 0 ? '#6366f1' : '#e11d48'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </section>

      {/* Section 5: Scatter Plots */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price vs Square Footage */}
        <Card>
          <CardBody>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
              Price vs Square Footage
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Square Footage"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    label={{
                      value: 'Square Footage',
                      position: 'insideBottom',
                      offset: -10,
                      style: { fill: '#64748b', fontSize: 12 },
                    }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Price"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(v) => formatCompact(v)}
                    label={{
                      value: 'Price',
                      angle: -90,
                      position: 'insideLeft',
                      offset: -5,
                      style: { fill: '#64748b', fontSize: 12 },
                    }}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), 'Price']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Scatter data={scatterSqFootage} fill="#818cf8" fillOpacity={0.6} r={3} />
                  {trendLineSq.length > 0 && (
                    <Scatter data={trendLineSq} fill="#4f46e5" line={{ stroke: '#4f46e5', strokeWidth: 2 }} r={0} />
                  )}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Price vs Distance to City Center */}
        <Card>
          <CardBody>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
              Price vs Distance to City Center
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Distance to City"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    label={{
                      value: 'Distance to City Center',
                      position: 'insideBottom',
                      offset: -10,
                      style: { fill: '#64748b', fontSize: 12 },
                    }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Price"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(v) => formatCompact(v)}
                    label={{
                      value: 'Price',
                      angle: -90,
                      position: 'insideLeft',
                      offset: -5,
                      style: { fill: '#64748b', fontSize: 12 },
                    }}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), 'Price']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Scatter data={scatterDistance} fill="#818cf8" fillOpacity={0.6} r={3} />
                  {trendLineDist.length > 0 && (
                    <Scatter data={trendLineDist} fill="#4f46e5" line={{ stroke: '#4f46e5', strokeWidth: 2 }} r={0} />
                  )}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </section>

      {/* Section 6: Feature Statistics Table */}
      <section>
        <Card>
          <CardBody>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
              Feature Statistics
            </h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feature</TableHead>
                    <TableHead className="text-right">Mean</TableHead>
                    <TableHead className="text-right">Median</TableHead>
                    <TableHead className="text-right">Std Dev</TableHead>
                    <TableHead className="text-right">Min</TableHead>
                    <TableHead className="text-right">Max</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {featureStatsRows.map(({ name, stats, isPrice }) => (
                    <TableRow key={name}>
                      <TableCell className="font-medium text-secondary-900 dark:text-secondary-100">
                        {name}
                      </TableCell>
                      <TableCell className="text-right">
                        {isPrice ? formatCurrency(stats.mean) : formatNumber(stats.mean)}
                      </TableCell>
                      <TableCell className="text-right">
                        {isPrice ? formatCurrency(stats.median) : formatNumber(stats.median)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(stats.std_dev)}
                      </TableCell>
                      <TableCell className="text-right">
                        {isPrice ? formatCurrency(stats.min) : formatNumber(stats.min)}
                      </TableCell>
                      <TableCell className="text-right">
                        {isPrice ? formatCurrency(stats.max) : formatNumber(stats.max)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}

// ─── Trend line computation (least squares) ─────────────────────────────────

function computeTrendLine(
  points: { x: number; y: number }[]
): { x: number; y: number }[] {
  if (points.length < 2) return [];
  const n = points.length;
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumXX = 0;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumXX += p.x * p.x;
  }
  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return [];
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  const xs = points.map((p) => p.x);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  return [
    { x: minX, y: slope * minX + intercept },
    { x: maxX, y: slope * maxX + intercept },
  ];
}
