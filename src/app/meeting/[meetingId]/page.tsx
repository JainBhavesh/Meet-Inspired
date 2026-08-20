'use client';

import dynamic from 'next/dynamic';

// The entire meeting experience touches browser-only APIs (getUserMedia,
// WebRTC, livekit-client) from the moment its modules are evaluated, not
// just when they run — importing it into a server render pass at all would
// break. `ssr: false` keeps this route's content client-only, same as the
// original single-page app; Next.js only allows `ssr: false` inside a
// Client Component, which is why this file itself is one (rather than
// leaving it as the default Server Component and only marking the child).
const MeetingPageClient = dynamic(() => import('./MeetingPageClient'), { ssr: false });

export default function MeetingPage() {
  return <MeetingPageClient />;
}
