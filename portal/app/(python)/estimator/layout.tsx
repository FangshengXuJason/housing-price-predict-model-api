import Link from "next/link";

export default function EstimatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col flex-1">
      <nav aria-label="Breadcrumb" className="bg-white dark:bg-secondary-900 border-b border-secondary-200 dark:border-secondary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Home
              </Link>
            </li>
            <li className="text-secondary-400 dark:text-secondary-600" aria-hidden="true">
              /
            </li>
            <li>
              <span className="text-secondary-900 dark:text-secondary-100 font-medium">
                Estimator
              </span>
            </li>
          </ol>
        </div>
      </nav>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
