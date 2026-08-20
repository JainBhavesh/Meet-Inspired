import { useCallback, useState } from 'react';
import { RoomManagerContext } from '../../../lib/livekit/RoomManagerContext';
import { AudioOutputContext } from '../AudioOutputContext';
import { useMeeting } from '../hooks/useMeeting';
import { useConnectionState } from '../hooks/useConnectionState';
import { LoadingState } from '../../../components/LoadingState/LoadingState';
import { ConnectionError } from '../../../components/ErrorMessage/ConnectionError';
import { ErrorBoundary } from '../../../components/ErrorBoundary/ErrorBoundary';
import { MeetingHeader } from './MeetingHeader';
import { MeetingControls } from './MeetingControls';
import { MeetingSidebar } from './MeetingSidebar';
import { ParticipantGrid } from '../../participants/components/ParticipantGrid';
import type { JoinSession } from '../../prejoin/types';
import styles from './MeetingRoom.module.css';

export interface MeetingRoomProps {
  meetingId: string;
  session: JoinSession;
  onLeave: () => void;
}

export function MeetingRoom({ meetingId, session, onLeave }: MeetingRoomProps) {
  const { roomManager, fatalError, retry, leave } = useMeeting(meetingId, session);

  const handleLeave = useCallback(() => {
    void leave().finally(onLeave);
  }, [leave, onLeave]);

  if (fatalError) {
    return (
      <div className={styles.fullScreen}>
        <ConnectionError message={fatalError} onRetry={retry} />
      </div>
    );
  }

  if (!roomManager) {
    return (
      <div className={styles.fullScreen}>
        <LoadingState label="Connecting to meeting…" />
      </div>
    );
  }

  return (
    <RoomManagerContext.Provider value={roomManager}>
      <AudioOutputContext.Provider value={session.speakerDeviceId}>
        <ErrorBoundary fallbackTitle="The meeting view hit a problem">
          <ConnectedMeetingRoom meetingId={meetingId} onLeave={handleLeave} onRetry={retry} />
        </ErrorBoundary>
      </AudioOutputContext.Provider>
    </RoomManagerContext.Provider>
  );
}

interface ConnectedMeetingRoomProps {
  meetingId: string;
  onLeave: () => void;
  onRetry: () => void;
}

function ConnectedMeetingRoom({ meetingId, onLeave, onRetry }: ConnectedMeetingRoomProps) {
  const { connectionState, error } = useConnectionState();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  if (connectionState === 'idle' || connectionState === 'connecting') {
    return (
      <div className={styles.fullScreen}>
        <LoadingState label="Connecting to meeting…" />
      </div>
    );
  }

  if (connectionState === 'failed') {
    return (
      <div className={styles.fullScreen}>
        <ConnectionError message={error ?? undefined} onRetry={onRetry} />
      </div>
    );
  }

  if (connectionState === 'disconnected') {
    return (
      <div className={styles.fullScreen}>
        <ConnectionError message="You were disconnected from the meeting." onRetry={onRetry} />
      </div>
    );
  }

  return (
    <div className={styles.room}>
      <MeetingHeader meetingId={meetingId} />
      <div className={styles.body}>
        <main className={styles.stage}>
          <ParticipantGrid />
        </main>
        {isSidebarOpen && <MeetingSidebar onClose={() => setSidebarOpen(false)} />}
      </div>
      <MeetingControls
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onLeave={onLeave}
      />
    </div>
  );
}
