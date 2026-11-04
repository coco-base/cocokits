import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import vueParser from 'vue-eslint-parser';
import { createFileSizeConfig } from './file-size.mjs';

const SOURCE_FILES = ['**/*.{ts,tsx,mts,cts,js,mjs,cjs,jsx,vue}'];

/**
 * Shared flat config: typescript-eslint strictTypeChecked + stylisticTypeChecked, no-explicit-any and a complexity limit.
 * Root files (config files, tooling) are linted through the default project of the project service.
 *
 * @param {{ tsconfigRootDir: string }} options
 */
export function createBaseConfig({ tsconfigRootDir }) {
  return tseslint.config(
    {
      ignores: [
        '**/dist/**',
        '**/src/styles/generated/**',
        '**/src/generated/**',
        '**/coverage/**',
        '**/.nx/**',
        '**/.tmp/**',
        '**/tmp/**',
        '**/node_modules/**',
        '**/.angular/**',
        '**/.astro/**',
        '**/.lighthouseci/**',
        '**/.vite/**',
        '**/test-results/**',
        '**/playwright-report/**',
      ],
    },
    {
      linterOptions: { reportUnusedDisableDirectives: 'error' },
    },
    // JS rules apply to source files only; HTML, CSS, SCSS and Markdown get the file-size rule alone.
    {
      files: SOURCE_FILES,
      extends: [eslint.configs.recommended, tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
    },
    {
      files: SOURCE_FILES,
      languageOptions: {
        parserOptions: {
          projectService: {
            allowDefaultProject: ['*.config.{ts,mts,cts,mjs,js}', 'tools/eslint/*.mjs', 'tools/scripts/*.mjs'],
          },
          tsconfigRootDir,
          extraFileExtensions: ['.vue'],
        },
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
        complexity: ['error', 15],
      },
    },
    {
      // Plain JavaScript (config files, scripts) has no declared types to check against.
      files: ['**/*.{js,mjs,cjs,jsx}'],
      ...tseslint.configs.disableTypeChecked,
    },
    {
      // Vue single-file components: vue-eslint-parser reads the SFC, typescript-eslint parses the script block.
      files: ['**/*.vue'],
      languageOptions: { parser: vueParser, parserOptions: { parser: tseslint.parser } },
    },
    ...createFileSizeConfig(),
  );
}
