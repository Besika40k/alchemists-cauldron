import js from '@eslint/js';
import unicorn from 'eslint-plugin-unicorn';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist', 'coverage']),
  {
    // a rule can only be turned off in this file, never with a comment in the code
    linterOptions: {
      noInlineConfig: true,
    },
  },
  {
    files: ['**/*.ts'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      unicorn.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'no-console': 'error',
      // the game uses its own dialogs, never alert(), confirm() or prompt()
      'no-alert': 'error',
      // the timer reads timestamps and visual effects are CSS animations
      'no-restricted-globals': [
        'error',
        { name: 'setInterval', message: 'Use timestamps or CSS animations instead.' },
        { name: 'setTimeout', message: 'Use timestamps or CSS animations instead.' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      // explicit types are welcome even where TypeScript could infer them
      '@typescript-eslint/no-inferrable-types': 'off',
    },
  },
]);
