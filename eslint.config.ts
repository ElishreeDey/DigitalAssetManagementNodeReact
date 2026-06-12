import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

// Separation of concerns:
//   npm run lint             → root config  → syntax + style rules, no tsconfig needed
//   npm run lint -w backend  → backend/eslint.config.mjs  → full recommendedTypeChecked
//   npm run lint -w frontend → frontend/eslint.config.js  → full recommendedTypeChecked
//   pre-commit (lint-staged) → runs from root using this config  → fast per-file checks

export default defineConfig([
  globalIgnores(['**/dist/**', '**/node_modules/**']),

  // ─── Backend — Node.js TypeScript ────────────────────────────────────────
  {
    files: ['backend/src/**/*.ts'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      globals: globals.node,
      // project:false disables the TypeScript project service so the parser does not
      // try to discover tsconfig files — required when linting multiple workspaces
      // from the monorepo root (multiple tsconfigs would otherwise cause a conflict).
      parserOptions: { project: false },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // ─── Backend test files ───────────────────────────────────────────────────
  {
    files: ['backend/src/test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // ─── Frontend — React TypeScript ──────────────────────────────────────────
  {
    files: ['frontend/src/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { project: false },
    },
    rules: {
      'react-hooks/set-state-in-effect': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // ─── Frontend test files ──────────────────────────────────────────────────
  {
    files: ['frontend/src/test/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
])
