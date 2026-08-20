import { useId, useState, type ChangeEvent, type FocusEvent } from 'react';
import { NAME_MAX_LENGTH, validateDisplayName } from '../../../utils/validation';
import styles from './NameInput.module.css';

export interface NameInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function NameInput({ value, onChange }: NameInputProps) {
  const inputId = useId();
  const [touched, setTouched] = useState(false);

  const { isValid, error } = validateDisplayName(value);
  const showError = touched && !isValid && value.length > 0;

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    onChange(event.target.value);
  }

  function handleBlur(_event: FocusEvent<HTMLInputElement>): void {
    setTouched(true);
  }

  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.label}>
        Your name
      </label>
      <input
        id={inputId}
        className={`${styles.input} ${showError ? styles.inputError : ''}`}
        type="text"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        maxLength={NAME_MAX_LENGTH}
        placeholder="Enter your name"
        autoComplete="name"
        required
        aria-invalid={showError}
        aria-describedby={showError ? `${inputId}-error` : undefined}
      />
      {showError && (
        <p id={`${inputId}-error`} className={styles.errorText}>
          {error}
        </p>
      )}
    </div>
  );
}
