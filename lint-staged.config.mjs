/** @type {import('lint-staged').Configuration} */
export default {
  '*.{ts,tsx,mts,cts,js,mjs,cjs,jsx,vue}': ['eslint --fix --max-warnings 0 --no-warn-ignored', 'prettier --write'],
  // The file-size rule (max 500 lines, every line counts) is the only rule that applies to these files.
  '*.{md,html,css,scss}': ['eslint --max-warnings 0 --no-warn-ignored', 'prettier --write'],
  '!(*.{ts,tsx,mts,cts,js,mjs,cjs,jsx,vue,md,html,css,scss})': 'prettier --write --ignore-unknown',
};
