// @ts-check

import tseslint from 'typescript-eslint';
import rootConfig from '../../eslint.config.js';

export default tseslint.config(
  ...rootConfig,
  {
    files: ['src/**/*.ts'],
    rules: {
  'indent': ['error', 2, { SwitchCase: 1 }],
    },
  }
);
