"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { Props as LegendProps } from "recharts/types/component/DefaultLegendContent";
import { HousingFeatures, ModelInfoResponse } from "@/types";
import { Card, CardBody } from "@/components/ui";

interface FeatureContributionChartProps {
  features: HousingFeatures;
  modelInfo: ModelInfoResponse;
}

const DEFAULT_COEFFICIENTS: Record<string, number> = {
  square_footage: 759.27,
  bedrooms: 5463.86,
  bathrooms: 11368.38,
  year_built: -1101.95,
  lot_size: 22813.99,
  distance_to_city_center: 25937.05,
  school_rating: 14373.25,
};

const DEFAULT_INTERCEPT = 270375.0;

const FEATURE_LABELS: Record<string, string> = {
  square_footage: "Square Footage",
  bedrooms: "Bedrooms",
  bathrooms: "Bathrooms",
  year_built: "Year Built",
  lot_size: "Lot Size",
  distance_to_city_center: "Distance to City",
  school_rating: "School Rating",
};

const COLORS = [
  "#4f46e5", // indigo-600
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#8b5cf6", // violet-500
  "#06b6d4", // cyan-500
  "#ec4899", // pink-500
];

interface ContributionData {
  name: string;
  value: number;
  rawContribution: number;
  featureValue: number;
  coefficient: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ContributionData }>;
  formatCurrency: (value: number) => string;
  formatPercentage: (value: number) => string;
}

function CustomTooltip({ active, payload, formatCurrency, formatPercentage }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-white dark:bg-secondary-800 p-3 rounded-lg shadow-lg border border-secondary-200 dark:border-secondary-700">
        <p className="font-semibold text-secondary-900 dark:text-secondary-100 mb-1">
          {item.name}
        </p>
        <p className="text-sm text-secondary-600 dark:text-secondary-400">
          Contribution: {formatCurrency(item.rawContribution)}
        </p>
        <p className="text-sm text-secondary-600 dark:text-secondary-400">
          Impact: {formatPercentage(item.value)}
        </p>
        {item.featureValue > 0 && (
          <p className="text-xs text-secondary-500 dark:text-secondary-500 mt-1">
            Value: {item.featureValue} × Coeff: {item.coefficient}
          </p>
        )}
      </div>
    );
  }
  return null;
}

export default function FeatureContributionChart({
  features,
  modelInfo,
}: FeatureContributionChartProps) {
  const coefficients = modelInfo?.coefficients || DEFAULT_COEFFICIENTS;
  const intercept = modelInfo?.intercept || DEFAULT_INTERCEPT;

  const contributions = Object.entries(features).map(([key, value], index) => {
    const coefficient = coefficients[key] || 0;
    const contribution = Math.abs(value * coefficient);
    return {
      name: FEATURE_LABELS[key] || key,
      value: contribution,
      rawContribution: value * coefficient,
      featureValue: value,
      coefficient,
      color: COLORS[index % COLORS.length],
    };
  });

  const totalContribution = contributions.reduce((sum, item) => sum + item.value, 0);
  const totalWithIntercept = totalContribution + Math.abs(intercept);

  const data = [
    ...contributions,
    {
      name: "Base Price",
      value: Math.abs(intercept),
      rawContribution: intercept,
      featureValue: 0,
      coefficient: 1,
      color: "#64748b",
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${((value / totalWithIntercept) * 100).toFixed(1)}%`;
  };

  const renderLegend = (props: LegendProps) => {
    const { payload } = props;
    if (!payload) return null;

    return (
      <div className="grid grid-cols-2 gap-2 mt-4">
        {payload.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center text-xs">
            <div
              className="w-3 h-3 rounded-sm mr-2 flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-secondary-700 dark:text-secondary-300 truncate">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardBody>
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
          Feature Contribution Breakdown
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart aria-label="Feature contribution pie chart">
              <title>How Each Feature Contributes to the Final Price</title>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} formatPercentage={formatPercentage} />} />
              <Legend content={renderLegend} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
}
