import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import astro from 'eslint-plugin-astro';
import prettier from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default tseslint.config(
  // 1. Base JavaScript rules
  js.configs.recommended,

  // 2. TypeScript rules (recommended - stable)
  ...tseslint.configs.recommended,

  // 3. Svelte rules
  ...svelte.configs['flat/recommended'],

  // 4. Astro rules
  ...astro.configs.recommended,

  // 5. Global settings
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        __APP_VERSION__: 'readonly'
      }
    }
  },

  // 6. TypeScript-specific settings for Svelte files
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.svelte']
      }
    }
  },

  // 7. Custom rule overrides
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/no-explicit-any': 'warn'
    }
  },

  // 8. Global ignores
  {
    ignores: ['dist/', 'node_modules/', '.astro/', 'coverage/', '*.min.js']
  },

  // 9. Prettier (MUST BE LAST to override conflicting rules)
  prettier
);
