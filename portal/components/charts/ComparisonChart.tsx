'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { SinglePredictionResponse } from '@/types';

interface ComparisonChartProps {
  predictions: SinglePredictionResponse[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

// Color palette for bars - shades of indigo/blue
const BAR_COLORS = [
  '#4f46e5', // indigo-600
  '#6366f1', // indigo-500
  '#818cf8', // indigo-400
  '#3730a3', // indigo-800
  '#4338ca', // indigo-700
  '#a5b4fc', // indigo-300
  '#312e81', // indigo-900
  '#c7d2fe', // indigo-200
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      name: string;
      predictedPrice: number;
      id: number;
    };
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-white border border-secondary-200 rounded-lg shadow-lg p-4 max-w-xs">
      <p className="font-semibold text-secondary-900 mb-2">{label}</p>
      <div className="space-y-1 text-sm">
        <p className="text-secondary-600">
          Prediction ID: <span className="font-medium text-secondary-900">#{data.id}</span>
        </p>
        <p className="text-secondary-600">
          Predicted Price:{' '}
          <span className="font-bold text-primary-700">
            {formatCurrency(data.predictedPrice)}
          </span>
        </p>
      </div>
    </div>
  );
}

export default function ComparisonChart({ predictions }: ComparisonChartProps) {
  const chartData = predictions.map((pred, index) => ({
    name: `Property ${index + 1}`,
    predictedPrice: pred.predicted_price,
    id: pred.id,
  }));

  return (
    <div
      className="w-full h-[400px]"
      role="img"
      aria-label={`Bar chart comparing ${predictions.length} property predictions`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <title>Property Price Comparison Chart</title>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="name"
            stroke="#64748b"
            fontSize={14}
            tickLine={false}
            axisLine={{ stroke: '#cbd5e1' }}
          />
          <YAxis
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#cbd5e1' }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            label={{
              value: 'Price (USD)',
              angle: -90,
              position: 'insideLeft',
              offset: -5,
              style: { fill: '#64748b', fontSize: 12 },
            }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} />
          <Legend
            verticalAlign="top"
            height={36}
            wrapperStyle={{ paddingBottom: '20px' }}
          />
          <Bar
            dataKey="predictedPrice"
            name="Predicted Price"
            radius={[8, 8, 0, 0]}
            maxBarSize={80}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={BAR_COLORS[index % BAR_COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
