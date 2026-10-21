'use client';

import { PredictionProvider } from '@/hooks';

export function Providers({ children }: { children: React.ReactNode }) {
  return <PredictionProvider>{children}</PredictionProvider>;
}
