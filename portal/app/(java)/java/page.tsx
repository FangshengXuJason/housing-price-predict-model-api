import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Java Backend - Coming Soon",
  description:
    "Java 21 + Spring Boot backend for the housing price prediction portal",
};

const FEATURES = [
  {
    title: "Property Value Estimation",
    description:
      "Submit property features and receive instant AI-powered price predictions using our trained ML model.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h2.25m-10.5-9V6.375c0-.621.504-1.125 1.125-1.125h.75c.621 0 1.125.504 1.125 1.125v5.25m-6-3h6"
        />
      </svg>
    ),
  },
  {
    title: "Prediction History",
    description:
      "Browse past predictions with pagination, search, and detailed breakdowns of each estimation.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
    ),
  },
  {
    title: "Comparison Analysis",
    description:
      "Compare multiple predictions side-by-side with statistical summaries including min, max, and average values.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
        />
      </svg>
    ),
  },
  {
    title: "Batch Predictions",
    description:
      "Submit multiple property configurations in a single request for efficient bulk price estimation.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75 6.429 9.75m11.142 0 4.179 2.25L12 17.25 2.25 12l4.179-2.25m11.142 0 4.179 2.25L12 22.5l-9.75-5.25 4.179-2.25"
        />
      </svg>
    ),
  },
];

export default function JavaComingSoonPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="mb-10 sm:mb-14">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-secondary-900 dark:text-secondary-50">
              Java Backend
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-100 dark:bg-accent-900/40 px-3.5 py-1 text-sm font-semibold text-accent-700 dark:text-accent-300 ring-1 ring-accent-600/20 dark:ring-accent-400/30 w-fit">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                />
              </svg>
              Coming Soon
            </span>
          </div>
          <p className="text-base sm:text-lg text-secondary-600 dark:text-secondary-400 leading-relaxed">
            This section will be powered by a{" "}
            <strong className="font-semibold text-secondary-800 dark:text-secondary-200">
              Java 21 + Spring Boot
            </strong>{" "}
            backend, providing the same prediction capabilities as the Python
            service with enterprise-grade performance and scalability.
          </p>
        </header>

        {/* Tech stack info */}
        <div className="rounded-xl bg-accent-50 dark:bg-accent-950/30 border border-accent-200 dark:border-accent-800/50 p-5 sm:p-6 mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-accent-700 dark:text-accent-400 mb-3">
            Planned Tech Stack
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Language", value: "Java 21" },
              { label: "Framework", value: "Spring Boot 3" },
              { label: "Build Tool", value: "Maven" },
              { label: "Port", value: "8002" },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs text-accent-600 dark:text-accent-500 font-medium">
                  {item.label}
                </p>
                <p className="text-sm font-semibold text-accent-900 dark:text-accent-100 mt-0.5">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Feature cards */}
        <section aria-labelledby="features-heading">
          <h2
            id="features-heading"
            className="text-xl sm:text-2xl font-bold text-secondary-900 dark:text-secondary-50 mb-6"
          >
            Planned Features
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <article
                key={feature.title}
                className="group relative rounded-xl border border-secondary-200 dark:border-secondary-700/60 bg-white dark:bg-secondary-800/50 p-5 sm:p-6 transition-all hover:border-accent-300 dark:hover:border-accent-600/50 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 rounded-lg bg-accent-100 dark:bg-accent-900/40 p-2.5 text-accent-600 dark:text-accent-400">
                    {feature.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-base font-semibold text-secondary-900 dark:text-secondary-50">
                        {feature.title}
                      </h3>
                      <span className="inline-flex items-center rounded-md bg-secondary-100 dark:bg-secondary-700 px-2 py-0.5 text-xs font-medium text-secondary-600 dark:text-secondary-400">
                        Planned
                      </span>
                    </div>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* CTA - Link to Python version */}
        <div className="mt-10 sm:mt-14 rounded-xl border border-secondary-200 dark:border-secondary-700/60 bg-secondary-50 dark:bg-secondary-800/30 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <h3 className="text-base font-semibold text-secondary-900 dark:text-secondary-50 mb-1">
                Want to try it now?
              </h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                The Python backend is fully functional with all features
                available.
              </p>
            </div>
            <Link
              href="/estimator"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 hover:bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors whitespace-nowrap"
            >
              Try the Python version
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
