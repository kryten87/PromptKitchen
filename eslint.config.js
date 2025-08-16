// @ts-check

import eslint from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    ignores: [
      '**/dist/',
      '**/node_modules/',
      '**/*.config.js*',
      '**/*.config.cjs',
    ],
    rules: {
  'indent': ['error', 2, { SwitchCase: 1 }],
    },
  }
);
