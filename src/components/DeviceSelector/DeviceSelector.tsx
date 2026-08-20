import { useId, type ChangeEvent } from 'react';
import type { MediaDevice } from '../../types';
import { Icon, type IconName } from '../Icon/Icon';
import styles from './DeviceSelector.module.css';

export interface DeviceSelectorProps {
  label: string;
  icon: IconName;
  devices: MediaDevice[];
  selectedDeviceId: string | null;
  onChange: (deviceId: string) => void;
  disabled?: boolean;
}

export function DeviceSelector({
  label,
  icon,
  devices,
  selectedDeviceId,
  onChange,
  disabled = false,
}: DeviceSelectorProps) {
  const selectId = useId();
  const isDisabled = disabled || devices.length === 0;

  function handleChange(event: ChangeEvent<HTMLSelectElement>): void {
    onChange(event.target.value);
  }

  return (
    <div className={styles.field}>
      <label htmlFor={selectId} className={styles.label}>
        <Icon name={icon} size={16} />
        {label}
      </label>
      <div className={styles.selectWrapper}>
        <select
          id={selectId}
          className={styles.select}
          value={selectedDeviceId ?? ''}
          onChange={handleChange}
          disabled={isDisabled}
        >
          {devices.length === 0 && <option value="">No devices found</option>}
          {devices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label}
            </option>
          ))}
        </select>
        <Icon name="chevron-down" size={16} className={styles.chevron} />
      </div>
    </div>
  );
}
