/**
 * Error and DOMException expose `name`/`message` via prototype getters, and
 * `instanceof Error`/`instanceof DOMException` checks are unreliable across
 * realms or when a value has passed through another bundle's copy of the
 * class — duck-typing on the fields themselves is what actually holds up,
 * and is what let a real "camera permission denied" DOMException fall
 * through to a generic error message instead of matching its `NotAllowedError`
 * case.
 */
export function isErrorLike(value: unknown): value is { name: string; message: string; stack?: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { name?: unknown }).name === 'string' &&
    typeof (value as { message?: unknown }).message === 'string'
  );
}
