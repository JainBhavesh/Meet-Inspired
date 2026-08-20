import { logger } from '../logger';
import { livekitConfig } from './livekitConfig';
import type { TokenRequest, TokenResponse } from './types';

export class TokenRequestError extends Error {
  override readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'TokenRequestError';
    this.cause = cause;
  }
}

export async function requestLiveKitToken(request: TokenRequest): Promise<TokenResponse> {
  let response: Response;

  try {
    response = await fetch(livekitConfig.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  } catch (cause) {
    logger.error('tokenService', 'Network error while requesting token', { cause });
    throw new TokenRequestError('Could not reach the meeting server.', cause);
  }

  if (!response.ok) {
    logger.error('tokenService', 'Token endpoint returned an error status', {
      status: response.status,
    });
    throw new TokenRequestError(`Meeting server rejected the request (${response.status}).`);
  }

  try {
    const data = (await response.json()) as Partial<TokenResponse>;
    if (!data.token || !data.serverUrl) {
      throw new Error('Response is missing token or serverUrl');
    }
    return { token: data.token, serverUrl: data.serverUrl };
  } catch (cause) {
    logger.error('tokenService', 'Token endpoint returned a malformed response', { cause });
    throw new TokenRequestError('Meeting server returned an unexpected response.', cause);
  }
}
