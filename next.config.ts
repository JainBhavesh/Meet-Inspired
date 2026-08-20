import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Pins the workspace root to this project explicitly — without it, Turbopack
  // walks upward looking for a lockfile and can land on an unrelated one
  // higher up the filesystem (e.g. a stray lockfile in the home directory).
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },
};

export default nextConfig;
