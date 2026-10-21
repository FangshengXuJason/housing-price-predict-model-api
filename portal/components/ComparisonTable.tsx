'use client';

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui';
import type { SinglePredictionResponse } from '@/types';

interface ComparisonTableProps {
  predictions: SinglePredictionResponse[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

type FeatureKey = keyof SinglePredictionResponse['features'];

const FEATURE_ROWS: { key: FeatureKey; label: string }[] = [
  { key: 'square_footage', label: 'Square Footage' },
  { key: 'bedrooms', label: 'Bedrooms' },
  { key: 'bathrooms', label: 'Bathrooms' },
  { key: 'year_built', label: 'Year Built' },
  { key: 'lot_size', label: 'Lot Size' },
  { key: 'distance_to_city_center', label: 'Distance to City Center' },
  { key: 'school_rating', label: 'School Rating' },
];

export default function ComparisonTable({ predictions }: ComparisonTableProps) {
  // Find min/max for each feature for highlighting
  const featureStats = FEATURE_ROWS.map(({ key }) => {
    const values = predictions.map((p) => p.features[key]);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  });

  // Price stats
  const prices = predictions.map((p) => p.predicted_price);
  const priceMin = Math.min(...prices);
  const priceMax = Math.max(...prices);

  const getFeatureCellClass = (value: number, statIndex: number) => {
    const stat = featureStats[statIndex];
    if (predictions.length < 2) return '';
    if (value === stat.max) return 'text-primary-700 font-semibold bg-primary-50';
    if (value === stat.min) return 'text-success-700 font-semibold bg-success-50';
    return '';
  };

  const getPriceCellClass = (value: number) => {
    if (predictions.length < 2) return '';
    if (value === priceMax) return 'text-primary-700 font-bold bg-primary-50';
    if (value === priceMin) return 'text-success-700 font-bold bg-success-50';
    return 'font-bold';
  };

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <Table aria-label="Feature comparison table">
        <caption className="sr-only">
          Side-by-side comparison of {predictions.length} property predictions
        </caption>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[180px]">Feature</TableHead>
            {predictions.map((pred, index) => (
              <TableHead key={pred.id} className="min-w-[140px] text-center">
                Property {index + 1}
                <span className="block text-xs font-normal text-secondary-500 mt-0.5">
                  #{pred.id}
                </span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {FEATURE_ROWS.map(({ key, label }, statIndex) => (
            <TableRow key={key}>
              <TableCell className="font-medium text-secondary-700">
                {label}
              </TableCell>
              {predictions.map((pred) => {
                const value = pred.features[key];
                const displayValue =
                  key === 'square_footage' || key === 'lot_size'
                    ? formatNumber(value)
                    : value;
                return (
                  <TableCell
                    key={pred.id}
                    className={`text-center ${getFeatureCellClass(value, statIndex)}`}
                  >
                    {displayValue}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}

          {/* Predicted Price Row - Highlighted */}
          <TableRow className="border-t-2 border-secondary-300 bg-secondary-50">
            <TableCell className="font-bold text-secondary-900 text-base">
              Predicted Price
            </TableCell>
            {predictions.map((pred) => (
              <TableCell
                key={pred.id}
                className={`text-center text-base ${getPriceCellClass(pred.predicted_price)}`}
              >
                {formatCurrency(pred.predicted_price)}
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
