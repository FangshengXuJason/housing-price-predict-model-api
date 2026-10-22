import type { Metadata } from "next";
import PredictionHistoryTable from "@/components/PredictionHistoryTable";

export const metadata: Metadata = {
  title: "History - Property Value Estimator",
  description: "View and manage your past housing price predictions",
};

export default function HistoryPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <header className="mb-6 sm:mb-8">
        <p className="text-secondary-600 dark:text-secondary-400">
          View and manage your past predictions
        </p>
      </header>
      <PredictionHistoryTable />
    </div>
  );
}
