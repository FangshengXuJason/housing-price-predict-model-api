import Link from "next/link";

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col flex-1">
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="bg-white border-b border-secondary-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link
                href="/"
                className="text-secondary-600 hover:text-primary-600 transition-colors"
              >
                Home
              </Link>
            </li>
            <li
              className="text-secondary-400"
              aria-hidden="true"
            >
              /
            </li>
            <li>
              <span className="text-secondary-900 font-medium">History</span>
            </li>
          </ol>
        </div>
      </nav>

      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-3xl font-bold tracking-tight text-secondary-900">
          Prediction History
        </h1>
      </div>

      {/* Children */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 -mt-2 w-full">
        {children}
      </div>
    </div>
  );
}
