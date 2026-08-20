'use client';

import { useEffect, useState } from 'react';
import { useLocalMedia } from '../hooks/useLocalMedia';
import { useMediaDevices } from '../../../hooks/useMediaDevices';
import { useMediaPermissions } from '../../../hooks/useMediaPermissions';
import { MeetingPreview } from './MeetingPreview';
import { NameInput } from './NameInput';
import { MeetingInfo } from './MeetingInfo';
import { JoinButton } from './JoinButton';
import { validateDisplayName } from '../../../utils/validation';
import type { SelectedDevices } from '../../../types';
import type { JoinSession } from '../types';
import styles from './PreJoinScreen.module.css';

export interface PreJoinScreenProps {
  meetingId: string;
  onJoin: (session: JoinSession) => void;
}

export function PreJoinScreen({ meetingId, onJoin }: PreJoinScreenProps) {
  const [displayName, setDisplayName] = useState(() => sessionStorage.getItem('meet:displayName') ?? '');
  const [selectedDevices, setSelectedDevices] = useState<SelectedDevices>({
    cameraId: null,
    microphoneId: null,
    speakerId: null,
  });

  const { cameras, microphones, speakers, refresh: refreshDevices } = useMediaDevices();
  const permissions = useMediaPermissions();

  // `selectedDevices` only holds an explicit user override. Until they pick
  // something, the "selected" device is just the first one available — that
  // default is derived at read time rather than written back into state via
  // an effect, so there's no extra render pass just to populate it.
  const effectiveDevices: SelectedDevices = {
    cameraId: selectedDevices.cameraId ?? cameras[0]?.deviceId ?? null,
    microphoneId: selectedDevices.microphoneId ?? microphones[0]?.deviceId ?? null,
    speakerId: selectedDevices.speakerId ?? speakers[0]?.deviceId ?? null,
  };

  const localMedia = useLocalMedia({
    cameraDeviceId: effectiveDevices.cameraId,
    microphoneDeviceId: effectiveDevices.microphoneId,
  });

  // Device labels are only populated by the browser once a stream has been
  // granted — re-enumerate as soon as that happens so the settings panel
  // shows real names instead of "Camera 1".
  useEffect(() => {
    if (localMedia.videoTrack || localMedia.audioTrack) refreshDevices();
  }, [localMedia.videoTrack, localMedia.audioTrack, refreshDevices]);

  const { isValid, trimmedValue } = validateDisplayName(displayName);

  function handleSelectDevice(kind: 'camera' | 'microphone' | 'speaker', deviceId: string): void {
    setSelectedDevices((prev) => ({
      ...prev,
      [`${kind}Id`]: deviceId,
    }));
  }

  function handleJoin(): void {
    if (!isValid) return;
    sessionStorage.setItem('meet:displayName', trimmedValue);
    onJoin({
      displayName: trimmedValue,
      cameraEnabled: localMedia.isCameraEnabled && !localMedia.cameraError,
      microphoneEnabled: localMedia.isMicrophoneEnabled && !localMedia.microphoneError,
      cameraDeviceId: effectiveDevices.cameraId,
      microphoneDeviceId: effectiveDevices.microphoneId,
      speakerDeviceId: effectiveDevices.speakerId,
    });
  }

  return (
    <div className={styles.screen}>
      <div className={styles.heading}>
        <h1 className={styles.title}>Ready to join?</h1>
        <p className={styles.subtitle}>Check your camera and microphone before you go in.</p>
      </div>

      <div className={styles.layout}>
        <MeetingPreview
          videoTrack={localMedia.videoTrack}
          isCameraStarting={localMedia.isCameraStarting}
          cameraError={localMedia.cameraError}
          displayName={trimmedValue}
          isCameraEnabled={localMedia.isCameraEnabled}
          isMicrophoneEnabled={localMedia.isMicrophoneEnabled}
          onToggleCamera={localMedia.toggleCamera}
          onToggleMicrophone={localMedia.toggleMicrophone}
          cameras={cameras}
          microphones={microphones}
          speakers={speakers}
          selectedDevices={effectiveDevices}
          onSelectDevice={handleSelectDevice}
        />

        <div className={styles.sidePanel}>
          <NameInput value={displayName} onChange={setDisplayName} />
          <MeetingInfo meetingId={meetingId} />
          <div className={styles.footer}>
            {permissions.camera === 'denied' && (
              <p className={styles.permissionNote}>Camera access is blocked in your browser settings.</p>
            )}
            {permissions.microphone === 'denied' && (
              <p className={styles.permissionNote}>Microphone access is blocked in your browser settings.</p>
            )}
            <JoinButton disabled={!isValid} onClick={handleJoin} />
          </div>
        </div>
      </div>
    </div>
  );
}
