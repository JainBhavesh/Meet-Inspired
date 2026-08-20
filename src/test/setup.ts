import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// RTL's own auto-cleanup relies on a global `afterEach` — we run with
// test.globals: false, so it's registered explicitly here instead.
afterEach(cleanup);
