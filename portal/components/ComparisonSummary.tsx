'use client';

import { Card, CardBody } from '@/components/ui';
import type { ComparisonSummary as ComparisonSummaryType } from '@/types';

interface ComparisonSummaryProps {
  summary: ComparisonSummaryType;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ComparisonSummary({ summary }: ComparisonSummaryProps) {
  const stats = [
    {
      label: 'Min Price',
      value: summary.min_price,
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      ),
      colorClasses: {
        bg: 'bg-success-50',
        icon: 'text-success-600',
        value: 'text-success-700',
      },
    },
    {
      label: 'Max Price',
      value: summary.max_price,
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      ),
      colorClasses: {
        bg: 'bg-primary-50',
        icon: 'text-primary-600',
        value: 'text-primary-700',
      },
    },
    {
      label: 'Average Price',
      value: summary.avg_price,
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      colorClasses: {
        bg: 'bg-accent-50',
        icon: 'text-accent-600',
        value: 'text-accent-700',
      },
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardBody className="flex items-center gap-4">
            <div
              className={`flex-shrink-0 w-12 h-12 rounded-lg ${stat.colorClasses.bg} flex items-center justify-center ${stat.colorClasses.icon}`}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-600">
                {stat.label}
              </p>
              <p className={`text-2xl font-bold ${stat.colorClasses.value}`}>
                {formatCurrency(stat.value)}
              </p>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
