export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 50;

export interface NameValidationResult {
  isValid: boolean;
  trimmedValue: string;
  error: string | null;
}

export function validateDisplayName(rawValue: string): NameValidationResult {
  const trimmedValue = rawValue.trim();

  if (trimmedValue.length === 0) {
    return { isValid: false, trimmedValue, error: 'Name is required' };
  }

  if (trimmedValue.length < NAME_MIN_LENGTH) {
    return {
      isValid: false,
      trimmedValue,
      error: `Name must be at least ${NAME_MIN_LENGTH} characters`,
    };
  }

  if (trimmedValue.length > NAME_MAX_LENGTH) {
    return {
      isValid: false,
      trimmedValue,
      error: `Name must be at most ${NAME_MAX_LENGTH} characters`,
    };
  }

  return { isValid: true, trimmedValue, error: null };
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}
