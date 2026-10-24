"use client";

import { SinglePredictionResponse, ModelInfoResponse } from "@/types";
import { Card, CardBody, CardFooter, Badge, Button } from "@/components/ui";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "@/components/ui";
import { FEATURE_CONSTRAINTS } from "@/lib/constants";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface FormResultsProps {
  prediction: SinglePredictionResponse;
  onAddToComparison?: () => void;
  onNewPrediction?: () => void;
  modelInfo: ModelInfoResponse;
}

const FEATURE_LABELS: Record<string, string> = {
  square_footage: "Square Footage",
  bedrooms: "Bedrooms",
  bathrooms: "Bathrooms",
  year_built: "Year Built",
  lot_size: "Lot Size",
  distance_to_city_center: "Distance to City",
  school_rating: "School Rating",
};

const FEATURE_ORDER = [
  "square_footage",
  "bedrooms",
  "bathrooms",
  "year_built",
  "lot_size",
  "distance_to_city_center",
  "school_rating",
] as const;

function formatFeatureValue(key: string, value: number): string {
  const fmt = (n: number, decimals = 0) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(n);

  switch (key) {
    case "square_footage":
      return `${fmt(value)} sq ft`;
    case "bedrooms":
      return fmt(value);
    case "bathrooms":
      return fmt(value, value % 1 === 0 ? 0 : 1);
    case "year_built":
      return fmt(value);
    case "lot_size":
      return `${fmt(value)} sq ft`;
    case "distance_to_city_center":
      return `${fmt(value, 1)} mi`;
    case "school_rating":
      return `${fmt(value, 1)}/10`;
    default:
      return fmt(value);
  }
}

interface ChartBarData {
  name: string;
  contribution: number;
  value: number;
  coefficient: number;
  fill: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartBarData }>;
  formatCurrency: (value: number) => string;
}

function ChartTooltip({ active, payload, formatCurrency }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-white dark:bg-secondary-800 p-3 rounded-lg shadow-lg border border-secondary-200 dark:border-secondary-700 text-sm">
        <p className="font-semibold text-secondary-900 dark:text-secondary-100 mb-1.5">
          {d.name}
        </p>
        <div className="space-y-0.5 text-secondary-600 dark:text-secondary-400">
          <p>Value: {d.name === "Base Price" ? "—" : d.value.toLocaleString()}</p>
          <p>Coefficient: {d.name === "Base Price" ? "—" : d.coefficient.toLocaleString()}</p>
          <p className="font-medium text-secondary-900 dark:text-secondary-100">
            Contribution: {formatCurrency(d.contribution)}
          </p>
        </div>
      </div>
    );
  }
  return null;
}

export default function FormResults({
  prediction,
  onAddToComparison,
  onNewPrediction,
  modelInfo,
}: FormResultsProps) {
  const coefficients = modelInfo.coefficients;
  const intercept = modelInfo.intercept;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Build row data for table
  const featureRows = FEATURE_ORDER.map((key) => {
    const value = prediction.features[key];
    const coefficient = coefficients[key] ?? 0;
    const contribution = value * coefficient;
    return { key, value, coefficient, contribution };
  });

  const totalContribution = featureRows.reduce((s, r) => s + r.contribution, 0);
  const computedPrice = intercept + totalContribution;

  // Build chart data (features + intercept)
  const chartData: ChartBarData[] = [
    ...featureRows.map((r) => ({
      name: FEATURE_LABELS[r.key],
      contribution: r.contribution,
      value: r.value,
      coefficient: r.coefficient,
      fill: r.contribution >= 0 ? "#10b981" : "#f43f5e",
    })),
    {
      name: "Base Price",
      contribution: intercept,
      value: 0,
      coefficient: 1,
      fill: "#f59e0b",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero price card */}
      <Card>
        <CardBody className="text-center py-12">
          <div className="mb-4">
            <Badge variant="primary" size="sm">
              Prediction #{prediction.id}
            </Badge>
          </div>
          <h2 className="text-lg font-medium text-secondary-600 dark:text-secondary-400 mb-2">
            Estimated Property Value
          </h2>
          <div className="text-5xl sm:text-6xl font-bold text-primary-600 dark:text-primary-400 mb-4">
            {formatCurrency(prediction.predicted_price)}
          </div>
          <p className="text-sm text-secondary-500 dark:text-secondary-500">
            Based on AI analysis of property features
          </p>
        </CardBody>
        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
          {onAddToComparison && (
            <Button variant="secondary" onClick={onAddToComparison}>
              Add to Comparison
            </Button>
          )}
          {onNewPrediction && (
            <Button variant="primary" onClick={onNewPrediction}>
              New Estimation
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Price Breakdown Chart */}
      <Card>
        <CardBody>
          <h3 className="text-base font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            Price Breakdown
          </h3>
          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                aria-label={`Price breakdown chart showing predicted price of ${formatCurrency(prediction.predicted_price)}`}
              >
                <title>Price Breakdown by Feature</title>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={(v) => formatCurrency(v)}
                  stroke="#64748b"
                  fontSize={11}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={11}
                  width={80}
                />
                <Tooltip
                  content={<ChartTooltip formatCurrency={formatCurrency} />}
                  cursor={{ fill: "rgba(148,163,184,0.08)" }}
                />
                <Bar dataKey="contribution" radius={[0, 4, 4, 0]} barSize={20}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      {/* Prediction Details Table */}
      <Card>
        <CardBody className="p-0 overflow-x-auto">
          <Table aria-label="Prediction detail breakdown">
            <TableCaption className="px-4 pt-4 pb-2 text-base font-semibold text-secondary-900 dark:text-secondary-100">
              Prediction Details
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">Coeff</TableHead>
                <TableHead className="text-right">Contribution</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {featureRows.map((r) => (
                <TableRow key={r.key}>
                  <TableCell className="font-medium text-secondary-900 dark:text-secondary-100">
                    {FEATURE_LABELS[r.key]}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatFeatureValue(r.key, r.value)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-secondary-500 dark:text-secondary-400">
                    {r.coefficient.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell
                    className={`text-right tabular-nums font-medium ${
                      r.contribution >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {r.contribution >= 0 ? "+" : ""}
                    {formatCurrency(r.contribution)}
                  </TableCell>
                </TableRow>
              ))}

              {/* Intercept row */}
              <TableRow>
                <TableCell className="font-medium text-secondary-900 dark:text-secondary-100">
                  Base Price (Intercept)
                </TableCell>
                <TableCell className="text-right text-secondary-500 dark:text-secondary-400">
                  —
                </TableCell>
                <TableCell className="text-right text-secondary-500 dark:text-secondary-400">
                  —
                </TableCell>
                <TableCell className="text-right tabular-nums font-medium text-amber-600 dark:text-amber-400">
                  {formatCurrency(intercept)}
                </TableCell>
              </TableRow>

              {/* Total row */}
              <TableRow className="bg-secondary-50 dark:bg-secondary-900/50 font-bold">
                <TableCell className="font-bold text-secondary-900 dark:text-secondary-100">
                  Predicted Price
                </TableCell>
                <TableCell />
                <TableCell />
                <TableCell className="text-right tabular-nums font-bold text-primary-600 dark:text-primary-400 text-base">
                  {formatCurrency(computedPrice)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
