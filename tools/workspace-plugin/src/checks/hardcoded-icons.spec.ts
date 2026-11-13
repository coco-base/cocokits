import { readdirSync, readFileSync } from 'node:fs';
import { basename, join, relative, resolve, sep } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * No hardcoded icon in the sources of the framework packages and the themes (job 054, AC 19). A component, a TSDoc
 * example or a theme file does not draw an inline `<svg>`, `<path>` or `<polygon>`, does not use a `<…Icon>`
 * component that the package does not export, and shows no icon glyph. Icons come from `SvgIcon` and the icon pack.
 *
 * Allowed: the svg-icon sources, the overlay arrow files and their TSDoc (the arrow draws its own triangle), a
 * mention of `<svg>` in inline code of a comment (prose), and the `*Icon` names that the packages export. The allowed
 * names are read from the export lists of the entry `index.ts` files, so a later `*Icon` part is allowed by its
 * export and nothing is listed by hand here.
 */
const REPO = resolve(import.meta.dirname, '..', '..', '..', '..');
const ROOTS = ['packages/angular', 'packages/react/src', 'packages/vue/src', 'packages/themes'];
const SKIPPED_DIRS = new Set(['node_modules', 'dist', 'tests', 'tmp', 'generated']);
const SOURCE_FILE = /\.(?:ts|tsx|vue|html)$/;
const TEST_FILE = /\.(?:test|spec)\.[a-z]+$/;

const MARKUP = /<(?:svg|path|polygon)\b/g;
const COMPONENT = /<([A-Z][\w.]*)/g;
const GLYPH = /[✓✕×✔▾▼›‹→←★−]|&times;/g;
const COMMENT = /\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->/g;
const INLINE_CODE = /`[^`]*`/g;

function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) return SKIPPED_DIRS.has(entry.name) ? [] : files(join(dir, entry.name));
    return SOURCE_FILE.test(entry.name) && !TEST_FILE.test(entry.name) ? [join(dir, entry.name)] : [];
  });
}

/** The names ending in `Icon` that an entry `index.ts` exports: `export { A }`, `export { default as A }`. */
function exportedIconNames(sources: readonly string[]): Set<string> {
  const names = new Set<string>();
  for (const text of sources) {
    for (const [, list = ''] of text.matchAll(/export\s*(?:type\s*)?\{([^}]*)\}/g)) {
      for (const item of list.split(',')) {
        const name =
          item
            .trim()
            .split(/\s+as\s+/)
            .pop() ?? '';
        if (name.endsWith('Icon') || name.endsWith('IconImports')) names.add(name);
      }
    }
  }
  return names;
}

/** `SvgIcon` is allowed by its export, `Select.Icon` by the export `SelectIcon`. */
function isExported(name: string, exported: ReadonlySet<string>): boolean {
  return exported.has(name) || exported.has(name.replaceAll('.', ''));
}

/** A hit: what was found and the text of it. */
type Hit = string;

/**
 * The hardcoded icons in one source file. `path` is the file's path relative to the repo, `exported` the allowed
 * `*Icon` names. Comments are checked one by one (a comment about the arrow may show the arrow's `<svg>`), the code
 * outside the comments as a whole.
 */
function hardcodedIcons(path: string, text: string, exported: ReadonlySet<string>): Hit[] {
  const file = basename(path);
  const isSvgIconSource = /svg-?icon/i.test(file);
  const isArrowFile = /arrow/i.test(file);
  if (isSvgIconSource) return [];

  const comments = text.match(COMMENT) ?? [];
  const code = text.replaceAll(COMMENT, '');
  const hits: Hit[] = [];

  const check = (unit: string, allowMarkup: boolean): void => {
    if (!allowMarkup) hits.push(...(unit.match(MARKUP) ?? []));
    for (const [, name = ''] of unit.matchAll(COMPONENT)) {
      if (name.endsWith('Icon') && !isExported(name, exported)) hits.push(`<${name}`);
    }
    hits.push(...(unit.match(GLYPH) ?? []));
  };

  check(code, isArrowFile);
  for (const comment of comments) {
    // Inline code in prose names an element ("give your own `<svg>` aria-hidden"); it is not an example.
    const unit = comment.replaceAll(INLINE_CODE, '');
    check(unit, isArrowFile || unit.includes('Arrow'));
  }
  return hits;
}

describe('hardcoded icons (AC 19)', () => {
  const exported = exportedIconNames(
    ROOTS.flatMap((root) => files(join(REPO, root)))
      .filter((file) => basename(file) === 'index.ts')
      .map((file) => readFileSync(file, 'utf8')),
  );

  it('reads the allowed *Icon names from the package exports', () => {
    expect([...exported]).toEqual(expect.arrayContaining(['SvgIcon', 'CckSvgIcon', 'SelectIcon']));
  });

  it('finds no inline svg, unexported icon component or glyph in a source outside the tests', () => {
    const found = ROOTS.flatMap((root) => files(join(REPO, root))).flatMap((file) => {
      const path = relative(REPO, file).split(sep).join('/');
      return hardcodedIcons(path, readFileSync(file, 'utf8'), exported).map((hit) => `${path}: ${hit}`);
    });
    expect(found).toEqual([]);
  });

  describe('the check itself', () => {
    const names = new Set(['SvgIcon', 'SelectIcon', 'CckSvgIcon']);
    const arrowExample =
      '/**\n * The arrow of the popover.\n * @example\n * <Popover.Arrow><svg viewBox="0 0 1 1" /></Popover.Arrow>\n */';

    const rows: readonly [string, string, string, readonly Hit[]][] = [
      [
        'an inline svg in code',
        'x/button.tsx',
        'const a = <svg viewBox="0 0 1 1"><path d="M0 0" /></svg>;',
        ['<svg', '<path'],
      ],
      ['an svg in a TSDoc example', 'x/button.tsx', '/**\n * @example\n * <Button><svg /></Button>\n */', ['<svg']],
      ['a polygon', 'x/button.tsx', 'const a = "<polygon points=\'0,0\' />";', ['<polygon']],
      [
        'a made-up icon component',
        'x/Button.vue',
        '/**\n * <Button><TrashIcon /> Delete</Button>\n */',
        ['<TrashIcon'],
      ],
      ['a glyph in TSDoc', 'x/select.tsx', '/**\n * <Select.Item>✓</Select.Item>\n */', ['✓']],
      ['a glyph in code', 'x/select.tsx', 'const mark = "×";', ['×']],
      ['an exported icon part', 'x/select.tsx', '/**\n * <Select.Icon />\n */', []],
      ['an exported icon component', 'x/Button.vue', '/**\n * <Button><SvgIcon icon-name="plus" /></Button>\n */', []],
      [
        'prose that names `<svg>` in inline code',
        'x/prefix.ts',
        '/** Give your own `<svg aria-hidden="true">` a name. */',
        [],
      ],
      ['the svg-icon sources', 'x/svg-icon/svg-icon.tsx', 'const a = <svg><path d="M0 0" /></svg>;', []],
      ['the overlay arrow file', 'x/popover-arrow.tsx', 'const a = <svg><polygon points="0,0" /></svg>;', []],
      ['the TSDoc of the arrow', 'x/popover.types.ts', arrowExample, []],
    ];

    it.each(rows)('%s', (_name, path, text, expected) => {
      expect(hardcodedIcons(path, text, names)).toEqual(expected);
    });
  });
});
