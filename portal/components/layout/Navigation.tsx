'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/constants';

export function Navigation() {
  const pathname = usePathname();

  const pythonItems = NAV_ITEMS.filter((item) => item.group === 'python');
  const javaItems = NAV_ITEMS.filter((item) => item.group === 'java');

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <nav aria-label="Main navigation" className="flex flex-col gap-6">
      {/* Python Backend Section */}
      <div>
        <h3 className="text-xs font-semibold text-secondary-500 uppercase tracking-wider px-3 mb-2">
          Python Backend
        </h3>
        <ul className="space-y-1">
          {pythonItems.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    active
                      ? 'bg-primary-50 text-primary-700 border-l-2 border-primary-600'
                      : 'text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Java Backend Section */}
      <div>
        <h3 className="text-xs font-semibold text-secondary-500 uppercase tracking-wider px-3 mb-2">
          Java Backend
        </h3>
        <ul className="space-y-1">
          {javaItems.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <div
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    active
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-secondary-500'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {item.label}
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent-100 text-accent-800">
                      Soon
                    </span>
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
