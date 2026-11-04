/**
 * File-size guardrail: no TS, TSX, JS, JSX, HTML, CSS, SCSS or Markdown file may exceed 500 lines of code.
 *
 * "Lines of code" are the non-blank lines of the file. In TS/JS files comment-only lines are skipped as well; in HTML,
 * CSS, SCSS and Markdown every non-blank line counts, comments and code fences included.
 *
 * ESLint needs a parser per file type. The text files get a tiny parser that returns an empty program, so the core
 * `max-lines` rule runs on them unchanged (no comments in an empty program, hence only blank lines are skipped). This
 * avoids a local rule and a dependency per language; @eslint/markdown and @eslint/css would add parsing of structures
 * this rule never reads.
 */
export const MAX_FILE_LINES = 500;

const SOURCE_FILES = ['**/*.{ts,tsx,mts,cts,js,mjs,cjs,jsx,vue}'];
const TEXT_FILES = ['**/*.{html,css,scss,md}'];

/** Generated or vendored files that are not written by hand. */
const GENERATED_FILES = ['**/CHANGELOG.md', '**/api/*.api.md', '**/dom-contract/**', '**/size-limit.config.mjs'];

/** @type {import('eslint').Linter.Parser} */
const plainTextParser = {
  meta: { name: 'cocokits/plain-text-parser' },
  parseForESLint(text) {
    const lines = text.split(/\r\n|[\r\n]/u);
    const end = { line: lines.length, column: (lines.at(-1) ?? '').length };
    return {
      ast: {
        type: 'Program',
        sourceType: 'module',
        body: [],
        comments: [],
        tokens: [],
        range: [0, text.length],
        loc: { start: { line: 1, column: 0 }, end },
      },
    };
  },
};

const MAX_LINES = ['error', { max: MAX_FILE_LINES, skipBlankLines: true, skipComments: true }];

export function createFileSizeConfig() {
  return [
    { ignores: GENERATED_FILES },
    { files: SOURCE_FILES, rules: { 'max-lines': MAX_LINES } },
    {
      files: TEXT_FILES,
      languageOptions: { parser: plainTextParser },
      rules: { 'max-lines': MAX_LINES },
    },
  ];
}
