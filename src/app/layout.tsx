import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppProviders } from './providers';
import '../styles/tokens.css';
import '../styles/global.css';

export const metadata: Metadata = {
  title: 'Meet Inspired',
  description: 'A Google Meet-inspired video meeting app built with React, Next.js, and LiveKit.',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
