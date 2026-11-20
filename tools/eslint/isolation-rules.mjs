/**
 * Framework isolation: a framework's files never name another framework or its terms, and the framework-free layers
 * name no framework at all. The check reads the raw text of the file, so it also covers comments, test titles,
 * strings, `.vue` templates, `.html`, `.scss` and `.md` files.
 *
 * Reference-library names (the libraries a framework's API follows) are not listed here: a list of them would break
 * the rule it enforces. They are checked by a script in the factory repo.
 *
 * Words are case-sensitive and word-bounded. A false positive is reworded first; a justified exception is an entry in
 * `tools/eslint/exceptions.mjs`, never a disable comment.
 */

const SOURCE_AND_TEXT_FILES = '**/*.{ts,tsx,mts,cts,js,mjs,cjs,jsx,vue,html,css,scss,md}';

/** Matches `word` when it is not part of a longer identifier or kebab-case name. */
const bounded = (word) => new RegExp(String.raw`(?<![\w$-])${word}(?![\w$-])`, 'gu');

/** Terms that only one framework's reader types. */
const ANGULAR_TERMS = [
  ...[
    'Angular',
    'ng-template',
    'ngTemplate',
    'Signal Forms',
    'ControlValueAccessor',
    'Directionality',
    'ngModel',
    'NgZone',
    'TemplateRef',
  ].map(bounded),
  /@angular\//gu,
];

const REACT_WORDS = [
  'React',
  'Next\\.js',
  'JSX',
  'ReactNode',
  'useState',
  'useEffect',
  'useLayoutEffect',
  'useRef',
  'useMemo',
  'useCallback',
  'useContext',
  'onValueChange',
  'onOpenChange',
  'onCheckedChange',
  'RSC',
];
// Angular has a `forwardRef` of its own, so the Angular files do not forbid it.
const REACT_TERMS = REACT_WORDS.map(bounded);
const FORWARD_REF = bounded('forwardRef');

const VUE_TERMS = [
  ...[
    'Vue',
    'Nuxt',
    'v-model',
    'modelValue',
    'asChild',
    'defineProps',
    'defineEmits',
    'defineSlots',
    'defineModel',
    'v-if',
    'v-for',
    'v-bind',
    'v-slot',
  ].map(bounded),
  // An event name only: `update:open`. A TypeScript parameter such as `update: () => void` does not match.
  /(?<![\w$-])update:(?=[A-Za-z])/gu,
  /<script setup/gu,
];

/** Package names of one framework: `@cocokits/react`, `@cocokits/theme-cocokits-react`. */
const packageTerm = (framework) => new RegExp(String.raw`@cocokits/(?:theme-[\w-]+-)?${framework}(?![\w-])`, 'gu');

const ANGULAR_PACKAGES = [packageTerm('angular')];
const REACT_PACKAGES = [packageTerm('react')];
const VUE_PACKAGES = [packageTerm('vue')];

const GROUPS = [
  {
    owner: 'Angular',
    article: 'an',
    files: ['packages/angular/**', 'packages/themes/*/angular/**'],
    forbidden: [...REACT_TERMS, ...VUE_TERMS, ...REACT_PACKAGES, ...VUE_PACKAGES],
  },
  {
    owner: 'React',
    article: 'a',
    files: ['packages/react/**', 'packages/themes/*/react/**'],
    forbidden: [...ANGULAR_TERMS, ...VUE_TERMS, ...ANGULAR_PACKAGES, ...VUE_PACKAGES],
  },
  {
    owner: 'Vue',
    article: 'a',
    files: ['packages/vue/**', 'packages/themes/*/vue/**'],
    forbidden: [...ANGULAR_TERMS, ...REACT_TERMS, FORWARD_REF, ...ANGULAR_PACKAGES, ...REACT_PACKAGES],
  },
  {
    owner: 'framework-free',
    article: 'a',
    files: ['packages/{utils,shared,cdk,machines}/**', 'packages/themes/*/core/**'],
    forbidden: [
      ...ANGULAR_TERMS,
      ...REACT_TERMS,
      FORWARD_REF,
      ...VUE_TERMS,
      ...ANGULAR_PACKAGES,
      ...REACT_PACKAGES,
      ...VUE_PACKAGES,
    ],
  },
];

/** @type {import('eslint').Rule.RuleModule} */
export const frameworkIsolationRule = {
  meta: {
    type: 'problem',
    schema: [
      {
        type: 'object',
        properties: { owner: { type: 'string' } },
        required: ['owner'],
        additionalProperties: false,
      },
    ],
    messages: {
      foreign:
        "{{ word }} in {{ article }} {{ owner }} file: describe the behaviour in this framework's own terms; comparisons between frameworks live in the factory repo.",
    },
  },
  create(context) {
    const [{ owner: ownerName }] = context.options;
    const { owner, article, forbidden } = GROUPS.find((group) => group.owner === ownerName);
    return {
      Program() {
        const lines = context.sourceCode.text.split(/\r\n|[\r\n]/u);
        lines.forEach((text, index) => {
          for (const pattern of forbidden) {
            for (const match of text.matchAll(pattern)) {
              context.report({
                loc: {
                  start: { line: index + 1, column: match.index },
                  end: { line: index + 1, column: match.index + match[0].length },
                },
                messageId: 'foreign',
                data: { word: match[0], owner, article },
              });
            }
          }
        });
      },
    };
  },
};

const PLUGIN = { cocokits: { rules: { 'framework-isolation': frameworkIsolationRule } } };

/**
 * Flat config blocks, one per file group. Patterns are relative to `rootDir`, so they match from any project's own
 * config. The plain-text parser of the file-size config lets the rule read `.html`, `.css`, `.scss` and `.md` files.
 *
 * @param {{ rootDir: string }} options
 */
export function createIsolationConfig({ rootDir }) {
  return GROUPS.map(({ owner, files }) => ({
    name: `cocokits/isolation: ${owner} files`,
    basePath: rootDir,
    files: files.map((glob) => `${glob}/${SOURCE_AND_TEXT_FILES}`),
    // A file a tool writes (changesets) is never edited by hand.
    ignores: ['**/CHANGELOG.md'],
    plugins: PLUGIN,
    rules: { 'cocokits/framework-isolation': ['error', { owner }] },
  }));
}
