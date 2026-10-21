"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { HousingFeatures, ModelInfoResponse } from "@/types";
import { Card, CardBody } from "@/components/ui";

interface PriceChartProps {
  features: HousingFeatures;
  predictedPrice: number;
  modelInfo?: ModelInfoResponse;
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
  square_footage: "Sq. Footage",
  bedrooms: "Bedrooms",
  bathrooms: "Bathrooms",
  year_built: "Year Built",
  lot_size: "Lot Size",
  distance_to_city_center: "Dist. to City",
  school_rating: "School Rating",
};

export default function PriceChart({ features, predictedPrice, modelInfo }: PriceChartProps) {
  const coefficients = modelInfo?.coefficients || DEFAULT_COEFFICIENTS;
  const intercept = modelInfo?.intercept || DEFAULT_INTERCEPT;

  const contributions = Object.entries(features).map(([key, value]) => {
    const coefficient = coefficients[key] || 0;
    const contribution = value * coefficient;
    return {
      name: FEATURE_LABELS[key] || key,
      contribution,
      value,
      coefficient,
    };
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getColor = (value: number) => {
    return value >= 0 ? "#4f46e5" : "#e11d48";
  };

  return (
    <Card>
      <CardBody>
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
          Price Breakdown
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={contributions}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              aria-label={`Price contribution chart showing predicted price of ${formatCurrency(predictedPrice)}`}
            >
              <title>Feature Contributions to Predicted Price</title>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                type="number"
                tickFormatter={(value) => formatCurrency(value)}
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#64748b"
                fontSize={12}
                width={80}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), "Contribution"]}
                labelStyle={{ color: "#0f172a", fontWeight: 600 }}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "0.5rem",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Bar dataKey="contribution" radius={[0, 4, 4, 0]}>
                {contributions.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.contribution)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 pt-4 border-t border-secondary-100 dark:border-secondary-800">
          <div className="flex justify-between items-center text-sm">
            <span className="text-secondary-600 dark:text-secondary-400">Base Price (Intercept)</span>
            <span className="font-semibold text-secondary-900 dark:text-secondary-100">
              {formatCurrency(intercept)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="text-secondary-600 dark:text-secondary-400">Predicted Total</span>
            <span className="font-bold text-primary-600 dark:text-primary-400 text-lg">
              {formatCurrency(predictedPrice)}
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
