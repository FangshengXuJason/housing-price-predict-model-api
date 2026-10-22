import type { Metadata } from 'next';
import ComparisonPanel from '@/components/ComparisonPanel';

export const metadata: Metadata = {
  title: 'Compare - Property Value Estimator',
};

interface ComparePageProps {
  searchParams: Promise<{ ids?: string }>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const params = await searchParams;
  const ids = params.ids
    ? params.ids
        .split(',')
        .map((s) => Number(s.trim()))
        .filter((n) => !isNaN(n) && n > 0)
    : [];
  return <ComparisonPanel preSelectedIds={ids} />;
}
