'use client';

import { lazy, Suspense, useCallback, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PreJoinScreen } from '@/features/prejoin/components/PreJoinScreen';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { Button } from '@/components/Button/Button';
import { isValidMeetingId } from '@/utils/meetingId';
import type { JoinSession } from '@/features/prejoin/types';
import styles from './page.module.css';

// The meeting experience (LiveKit, participant grid, media controls) is
// only needed after the user clicks "Join now" — splitting it out keeps it
// off the bundle for everyone who's still on the pre-join screen. This is
// a second, more granular split on top of the route-level one in page.tsx.
const MeetingRoom = lazy(() =>
  import('@/features/meeting/components/MeetingRoom').then((module) => ({ default: module.MeetingRoom })),
);

export default function MeetingPageClient() {
  const params = useParams<{ meetingId: string }>();
  const meetingId = params.meetingId;
  const router = useRouter();
  const [session, setSession] = useState<JoinSession | null>(null);

  const handleLeave = useCallback(() => {
    setSession(null);
    router.replace('/');
  }, [router]);

  if (!isValidMeetingId(meetingId)) {
    return (
      <div className={styles.invalidScreen}>
        <h1 className={styles.invalidTitle}>That meeting link isn&apos;t valid</h1>
        <p className={styles.invalidBody}>Check the link you were given, or start a new meeting instead.</p>
        <Button onClick={() => router.push('/')}>Start a new meeting</Button>
      </div>
    );
  }

  if (!session) {
    return <PreJoinScreen meetingId={meetingId} onJoin={setSession} />;
  }

  return (
    <Suspense
      fallback={
        <div className={styles.fullScreen}>
          <LoadingState label="Loading meeting…" />
        </div>
      }
    >
      <MeetingRoom meetingId={meetingId} session={session} onLeave={handleLeave} />
    </Suspense>
  );
}
