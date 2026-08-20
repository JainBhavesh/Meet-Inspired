'use client';

import type { ReactNode } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary';

/**
 * Composition root for app-wide providers. There's deliberately little
 * here — meeting state lives in RoomManagerContext, scoped to the meeting
 * route, not hoisted app-wide. See docs/ARCHITECTURE.md.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return <ErrorBoundary fallbackTitle="The application hit a problem">{children}</ErrorBoundary>;
}
