import { memo } from 'react';
import { IconButton } from '../IconButton/IconButton';
import { Tooltip } from '../Tooltip/Tooltip';
import { Icon } from '../Icon/Icon';

export interface MicrophoneToggleProps {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

function MicrophoneToggleComponent({ enabled, onToggle, disabled = false }: MicrophoneToggleProps) {
  const label = enabled ? 'Mute microphone' : 'Unmute microphone';

  return (
    <Tooltip label={label}>
      <IconButton aria-label={label} active={!enabled} onClick={onToggle} disabled={disabled}>
        <Icon name={enabled ? 'mic' : 'mic-off'} />
      </IconButton>
    </Tooltip>
  );
}

export const MicrophoneToggle = memo(MicrophoneToggleComponent);
