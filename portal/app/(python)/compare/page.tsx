import type { Metadata } from 'next';
import ComparisonPanel from '@/components/ComparisonPanel';

export const metadata: Metadata = {
  title: 'Compare - Property Value Estimator',
};

export default function ComparePage() {
  return <ComparisonPanel />;
}
