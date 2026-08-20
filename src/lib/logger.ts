import { isErrorLike } from './errorLike';

type LogPayload = Record<string, unknown> | undefined;

const isDev = process.env.NODE_ENV !== 'production';

function format(scope: string, message: string): string {
  return `[${scope}] ${message}`;
}

function normalizeValue(value: unknown): unknown {
  if (isErrorLike(value)) return { name: value.name, message: value.message, stack: value.stack };
  // `undefined` (a promise rejected with no reason at all) silently vanishes
  // under JSON-based serialization instead of showing up as a key with an
  // empty value, which is indistinguishable from the payload never having
  // been passed in the first place — say so explicitly instead.
  if (value === undefined) return '<undefined>';
  return value;
}

/**
 * Error and DOMException carry `name`/`message` as prototype getters, not own
 * enumerable properties, so passing one straight through serializes to `{}`
 * the moment anything downstream (JSON.stringify, a devtools capture, a log
 * shipper) inspects it instead of live-printing it — exactly the case that
 * strips the real failure reason out of a getUserMedia rejection. Lift those
 * fields onto a plain object so they survive serialization.
 */
function normalize(payload: LogPayload): LogPayload {
  if (!payload) return payload;
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    result[key] = normalizeValue(value);
  }
  return result;
}

export const logger = {
  info(scope: string, message: string, payload?: LogPayload): void {
    if (!isDev) return;
    console.info(format(scope, message), normalize(payload) ?? '');
  },
  warn(scope: string, message: string, payload?: LogPayload): void {
    console.warn(format(scope, message), normalize(payload) ?? '');
  },
  error(scope: string, message: string, payload?: LogPayload): void {
    console.error(format(scope, message), normalize(payload) ?? '');
  },
};
