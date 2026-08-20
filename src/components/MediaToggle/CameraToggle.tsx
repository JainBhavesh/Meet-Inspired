import { memo } from 'react';
import { IconButton } from '../IconButton/IconButton';
import { Tooltip } from '../Tooltip/Tooltip';
import { Icon } from '../Icon/Icon';

export interface CameraToggleProps {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

function CameraToggleComponent({ enabled, onToggle, disabled = false }: CameraToggleProps) {
  const label = enabled ? 'Turn off camera' : 'Turn on camera';

  return (
    <Tooltip label={label}>
      <IconButton aria-label={label} active={!enabled} onClick={onToggle} disabled={disabled}>
        <Icon name={enabled ? 'video' : 'video-off'} />
      </IconButton>
    </Tooltip>
  );
}

export const CameraToggle = memo(CameraToggleComponent);
