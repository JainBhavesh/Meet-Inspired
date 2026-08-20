import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';

export default defineConfig([
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'coverage/**']),

  ...nextVitals,
  ...nextTs,

  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // Forces logging through src/lib/logger.ts (the one file exempted below) instead of scattering console.* calls.
      'no-console': 'error',
    },
  },

  {
    files: ['src/lib/logger.ts'],
    rules: { 'no-console': 'off' },
  },

  // Promise-safety is worth the cost of type-aware linting specifically for
  // this — "never allow an unhandled promise rejection" is a hard project
  // requirement.
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
    },
  },

  prettierConfig,
]);
