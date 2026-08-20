import { useCallback, useEffect, useRef, useState } from 'react';
import { useRoomManager } from '../../../lib/livekit/RoomManagerContext';
import { useLocalParticipantData } from '../../participants/hooks/useLocalParticipantData';
import { useParticipants } from '../../participants/hooks/useParticipants';
import { CameraToggle } from '../../../components/MediaToggle/CameraToggle';
import { MicrophoneToggle } from '../../../components/MediaToggle/MicrophoneToggle';
import { IconButton } from '../../../components/IconButton/IconButton';
import { Tooltip } from '../../../components/Tooltip/Tooltip';
import { Icon } from '../../../components/Icon/Icon';
import { logger } from '../../../lib/logger';
import styles from './MeetingControls.module.css';

export interface MeetingControlsProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onLeave: () => void;
}

export function MeetingControls({ isSidebarOpen, onToggleSidebar, onLeave }: MeetingControlsProps) {
  const roomManager = useRoomManager();
  const local = useLocalParticipantData();
  const { screenShareParticipantId } = useParticipants();
  const [screenShareError, setScreenShareError] = useState<string | null>(null);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(errorTimeoutRef.current), []);

  const someoneElseIsSharing = screenShareParticipantId !== null && screenShareParticipantId !== local.identity;

  const handleToggleCamera = useCallback(() => {
    roomManager.setCameraEnabled(!local.isCameraEnabled).catch((cause: unknown) => {
      logger.error('MeetingControls', 'Failed to toggle camera', { cause });
    });
  }, [roomManager, local.isCameraEnabled]);

  const handleToggleMicrophone = useCallback(() => {
    roomManager.setMicrophoneEnabled(!local.isMicrophoneEnabled).catch((cause: unknown) => {
      logger.error('MeetingControls', 'Failed to toggle microphone', { cause });
    });
  }, [roomManager, local.isMicrophoneEnabled]);

  const handleToggleScreenShare = useCallback(() => {
    roomManager.setScreenShareEnabled(!local.isScreenSharing).catch((cause: unknown) => {
      // Most commonly: the user cancelled the "share your screen" browser
      // prompt, or the browser doesn't support display capture at all.
      logger.warn('MeetingControls', 'Screen share request did not complete', { cause });
      setScreenShareError('Screen share was cancelled or is unavailable.');
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = setTimeout(() => setScreenShareError(null), 4000);
    });
  }, [roomManager, local.isScreenSharing]);

  return (
    <div className={styles.bar}>
      <MicrophoneToggle enabled={local.isMicrophoneEnabled} onToggle={handleToggleMicrophone} />
      <CameraToggle enabled={local.isCameraEnabled} onToggle={handleToggleCamera} />

      <Tooltip label={screenShareError ?? (local.isScreenSharing ? 'Stop presenting' : 'Present screen')}>
        <IconButton
          aria-label={local.isScreenSharing ? 'Stop presenting' : 'Present screen'}
          active={local.isScreenSharing}
          disabled={someoneElseIsSharing}
          onClick={handleToggleScreenShare}
        >
          <Icon name={local.isScreenSharing ? 'screen-share-off' : 'screen-share'} />
        </IconButton>
      </Tooltip>

      <Tooltip label={isSidebarOpen ? 'Hide participants' : 'Show participants'}>
        <IconButton aria-label="Show participants" active={isSidebarOpen} onClick={onToggleSidebar}>
          <Icon name="users" />
        </IconButton>
      </Tooltip>

      <div className={styles.divider} />

      <Tooltip label="Leave call">
        <IconButton aria-label="Leave call" danger className={styles.leave} onClick={onLeave}>
          <Icon name="leave" />
        </IconButton>
      </Tooltip>
    </div>
  );
}
