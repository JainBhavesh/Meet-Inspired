import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useMediaPermissions } from './useMediaPermissions';

const originalPermissions = navigator.permissions as Permissions | undefined;

afterEach(() => {
  if (originalPermissions) {
    Object.defineProperty(navigator, 'permissions', { value: originalPermissions, configurable: true });
  } else {
    Object.defineProperty(navigator, 'permissions', { value: undefined, configurable: true });
  }
  vi.restoreAllMocks();
});

function mockPermissionsApi(stateByName: Record<string, string>) {
  const query = vi.fn(({ name }: { name: string }) => {
    const status = {
      state: stateByName[name] ?? 'prompt',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    return Promise.resolve(status as unknown as PermissionStatus);
  });
  Object.defineProperty(navigator, 'permissions', { value: { query }, configurable: true });
  return query;
}

describe('useMediaPermissions', () => {
  it('reports "unsupported" when the browser has no Permissions API', async () => {
    Object.defineProperty(navigator, 'permissions', { value: undefined, configurable: true });

    const { result } = renderHook(() => useMediaPermissions());

    await waitFor(() => {
      expect(result.current.camera).toBe('unsupported');
      expect(result.current.microphone).toBe('unsupported');
    });
  });

  it('reflects the granted/denied state reported by the Permissions API', async () => {
    mockPermissionsApi({ camera: 'granted', microphone: 'denied' });

    const { result } = renderHook(() => useMediaPermissions());

    await waitFor(() => {
      expect(result.current.camera).toBe('granted');
      expect(result.current.microphone).toBe('denied');
    });
  });

  it('queries both camera and microphone independently', async () => {
    const query = mockPermissionsApi({ camera: 'granted', microphone: 'granted' });

    renderHook(() => useMediaPermissions());

    await waitFor(() => {
      expect(query).toHaveBeenCalledWith({ name: 'camera' });
      expect(query).toHaveBeenCalledWith({ name: 'microphone' });
    });
  });
});
