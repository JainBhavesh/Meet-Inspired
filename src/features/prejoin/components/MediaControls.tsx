import { useState } from 'react';
import { CameraToggle } from '../../../components/MediaToggle/CameraToggle';
import { MicrophoneToggle } from '../../../components/MediaToggle/MicrophoneToggle';
import { IconButton } from '../../../components/IconButton/IconButton';
import { Tooltip } from '../../../components/Tooltip/Tooltip';
import { Icon } from '../../../components/Icon/Icon';
import { Modal } from '../../../components/Modal/Modal';
import { DeviceSelector } from '../../../components/DeviceSelector/DeviceSelector';
import { supportsAudioOutputSelection } from '../../../lib/media/audioOutput';
import type { MediaDevice, SelectedDevices } from '../../../types';
import styles from './MediaControls.module.css';

export interface MediaControlsProps {
  isCameraEnabled: boolean;
  isMicrophoneEnabled: boolean;
  onToggleCamera: () => void;
  onToggleMicrophone: () => void;
  cameras: MediaDevice[];
  microphones: MediaDevice[];
  speakers: MediaDevice[];
  selectedDevices: SelectedDevices;
  onSelectDevice: (kind: 'camera' | 'microphone' | 'speaker', deviceId: string) => void;
}

export function MediaControls({
  isCameraEnabled,
  isMicrophoneEnabled,
  onToggleCamera,
  onToggleMicrophone,
  cameras,
  microphones,
  speakers,
  selectedDevices,
  onSelectDevice,
}: MediaControlsProps) {
  const [isSettingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <div className={styles.row}>
        <MicrophoneToggle enabled={isMicrophoneEnabled} onToggle={onToggleMicrophone} />
        <CameraToggle enabled={isCameraEnabled} onToggle={onToggleCamera} />
        <Tooltip label="Device settings">
          <IconButton aria-label="Device settings" onClick={() => setSettingsOpen(true)}>
            <Icon name="settings" />
          </IconButton>
        </Tooltip>
      </div>

      <Modal open={isSettingsOpen} title="Device settings" onClose={() => setSettingsOpen(false)}>
        <div className={styles.panel}>
          <DeviceSelector
            label="Microphone"
            icon="mic"
            devices={microphones}
            selectedDeviceId={selectedDevices.microphoneId}
            onChange={(id) => onSelectDevice('microphone', id)}
          />
          <DeviceSelector
            label="Camera"
            icon="video"
            devices={cameras}
            selectedDeviceId={selectedDevices.cameraId}
            onChange={(id) => onSelectDevice('camera', id)}
          />
          {supportsAudioOutputSelection() && (
            <DeviceSelector
              label="Speaker"
              icon="signal"
              devices={speakers}
              selectedDeviceId={selectedDevices.speakerId}
              onChange={(id) => onSelectDevice('speaker', id)}
            />
          )}
        </div>
      </Modal>
    </>
  );
}
