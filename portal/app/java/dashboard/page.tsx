import type { Metadata } from "next";
import MarketDashboard from "@/components/java/MarketDashboard";

export const metadata: Metadata = {
  title: "Market Dashboard - Property Price Analytics",
  description:
    "Explore interactive visualizations of property market data including price distributions, feature correlations, and statistical summaries.",
};

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <header className="mb-8 sm:mb-12 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-secondary-900 dark:text-secondary-50 mb-3">
          Market Dashboard
        </h1>
        <p className="text-base sm:text-lg text-secondary-600 dark:text-secondary-400 leading-relaxed max-w-3xl mx-auto">
          Interactive analytics and visualizations for the housing price dataset.
          Explore distributions, correlations, and feature statistics.
        </p>
      </header>
      <MarketDashboard />
    </div>
  );
}
