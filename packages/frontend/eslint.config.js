// @ts-check

import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import rootConfig from '../../eslint.config.js';

export default tseslint.config(...rootConfig, {
  ignores: [
    'dist/**',
    'jest.config.cjs',
    'babel.config.cjs',
  ],
  files: ['**/*.{ts,tsx}'],
  plugins: {
    'react-hooks': reactHooks,
    'react-refresh': reactRefresh,
  },
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
    globals: {
      ...globals.browser,
    },
  },
  rules: {
    ...reactHooks.configs.recommended.rules,
    'react-refresh/only-export-components': 'warn',
  'indent': ['error', 2, { SwitchCase: 1 }],
  },
});
