"use client";

import { Card, Button, Badge } from "@/components/ui";
import type { SinglePredictionResponse } from "@/types";

interface PredictionDetailCardProps {
  prediction: SinglePredictionResponse;
  onClose: () => void;
}

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

export default function PredictionDetailCard({
  prediction,
  onClose,
}: PredictionDetailCardProps) {
  const { id, timestamp, features, predicted_price } = prediction;

  const featureItems = [
    { label: "Square Footage", value: `${formatNumber(features.square_footage)} sqft` },
    { label: "Bedrooms", value: features.bedrooms.toString() },
    { label: "Bathrooms", value: features.bathrooms.toString() },
    { label: "Year Built", value: features.year_built.toString() },
    { label: "Lot Size", value: `${formatNumber(features.lot_size)} sqft` },
    { label: "Distance to City Center", value: `${features.distance_to_city_center} miles` },
    { label: "School Rating", value: `${features.school_rating}/10` },
  ];

  return (
    <Card className="w-full max-w-lg">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 p-5 border-b border-secondary-200">
        <div>
          <h3 className="text-lg font-semibold text-secondary-900">
            Prediction Details
          </h3>
          <p className="text-sm text-secondary-500 mt-0.5">
            ID: #{id} &middot; {formatDate(timestamp)}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="Close details"
          className="!p-1"
        >
          <svg
            className="h-5 w-5 text-secondary-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>

      {/* Predicted Price */}
      <div className="px-5 py-4 bg-primary-50 border-b border-secondary-200">
        <p className="text-sm font-medium text-primary-700 mb-1">Predicted Price</p>
        <p className="text-3xl font-bold text-primary-900">
          {formatCurrency(predicted_price)}
        </p>
      </div>

      {/* Features Grid */}
      <div className="p-5">
        <h4 className="text-sm font-semibold text-secondary-700 uppercase tracking-wide mb-3">
          Property Features
        </h4>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
          {featureItems.map((item) => (
            <div key={item.label} className="space-y-0.5">
              <dt className="text-xs text-secondary-500">{item.label}</dt>
              <dd className="text-sm font-medium text-secondary-900">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-secondary-200">
        <Badge variant="info">ID: {id}</Badge>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
    </Card>
  );
}
