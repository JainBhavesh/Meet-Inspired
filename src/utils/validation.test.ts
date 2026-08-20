import { describe, expect, it } from 'vitest';
import { getInitials, validateDisplayName } from './validation';

describe('validateDisplayName', () => {
  it('rejects an empty name', () => {
    const result = validateDisplayName('');
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/required/i);
  });

  it('rejects a name that is only whitespace', () => {
    const result = validateDisplayName('    ');
    expect(result.isValid).toBe(false);
    expect(result.trimmedValue).toBe('');
  });

  it('rejects a single-character name', () => {
    const result = validateDisplayName('A');
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/at least/i);
  });

  it('rejects a name past the maximum length', () => {
    const result = validateDisplayName('A'.repeat(51));
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/at most/i);
  });

  it('accepts a well-formed name', () => {
    const result = validateDisplayName('Bhavesh Jain');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
    expect(result.trimmedValue).toBe('Bhavesh Jain');
  });

  it('trims surrounding whitespace before validating length', () => {
    const result = validateDisplayName('  Bo  ');
    expect(result.isValid).toBe(true);
    expect(result.trimmedValue).toBe('Bo');
  });
});

describe('getInitials', () => {
  it('uses the first letter of the first and last word', () => {
    expect(getInitials('Bhavesh Jain')).toBe('BJ');
  });

  it('uses a single letter for a one-word name', () => {
    expect(getInitials('Bhavesh')).toBe('B');
  });

  it('collapses extra whitespace between words', () => {
    expect(getInitials('  Bhavesh   Jain  ')).toBe('BJ');
  });

  it('falls back to "?" for an empty name', () => {
    expect(getInitials('')).toBe('?');
  });

  it('uses the first and last of a multi-word name, ignoring the middle', () => {
    expect(getInitials('Mary Jane Watson')).toBe('MW');
  });
});
