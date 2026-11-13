import { readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { read as readThemeFile, tokensCss } from './css-test-helpers';

const root = join(import.meta.dirname, '..');
const componentsDir = join(root, 'src', 'styles', 'components');

/** `_button.scss` is the rules of the `button` block. Entries without rules have no `var()`. */
const sources = readdirSync(componentsDir)
  .filter((file) => file.endsWith('.scss'))
  .map((file) => ({ file, block: basename(file, '.scss').replace(/^_/, '') }));
/** Documented custom properties the author sets: the theme reads them and defines no token. */
const INLINE_PROPERTIES = [
  '--cck-badge-container-radius',
  '--cck-badge-offset-x',
  '--cck-badge-offset-y',
  '--cck-textarea-min-rows',
  '--cck-textarea-max-rows',
  // Written by the base on the Tabs indicator: measured geometry, not a token.
  '--active-tab-left',
  '--active-tab-top',
  '--active-tab-width',
  '--active-tab-height',
  // Set on the Popover content by the positioning module, and by the partial itself for its slide keyframes.
  '--available-height',
  '--cck-popover-slide-x',
  '--cck-popover-slide-y',
  // The Tooltip partial sets its slide offsets for its keyframes.
  '--cck-tooltip-slide-x',
  '--cck-tooltip-slide-y',
  // Set on the Select content by the positioning module (the width of the anchor), and by the partial itself for its
  // slide keyframes.
  '--anchor-width',
  // Written by the positioning module on the Popover, Tooltip and Select contents: the point where they meet the anchor.
  '--transform-origin',
  '--cck-select-slide-x',
  '--cck-select-slide-y',
  // Documented custom property: the author sets it, the theme reads it with a 220px fallback.
  '--cck-select-content-max-height',
  // Written by the base on the Accordion content: measured geometry, not a token (architecture §4).
  '--accordion-content-height',
];
/** The blocks with a hover look (a text box shows it on its border; a Switch, Checkbox and Radio on the halo and the border; the Popover and Dialog Close on their fill; choice-css.test.ts asserts those rules and bans :active in the shared partial; Tabs and TabNav (the same partial, `_tabs.scss`) only let the pointer switch the slide of its indicator on, and tabs-css.test.ts asserts that no color rule reads :hover); every other block has none. */
const HOVER_BLOCKS = [
  'form-field',
  'input',
  'textarea',
  'switch',
  'checkbox',
  'radio',
  'tabs',
  'popover',
  'dialog',
  'select',
];
const defined = (name: string): boolean => INLINE_PROPERTIES.includes(name) || tokensCss.includes(`${name}:`);

describe.each(sources)('component styles $file', ({ file, block }) => {
  const source = readFileSync(join(componentsDir, file), 'utf8');
  const names = [...source.matchAll(/var\((--[\w-]+)/g)].map((match) => match[1]);

  it('reads only its own --cck-<block>-* tokens', () => {
    const foreign = names.filter((name) => !name.startsWith(`--cck-${block}-`) && !INLINE_PROPERTIES.includes(name));
    expect(foreign).toEqual([]);
  });

  it.each([...new Set(names)])('reads %s, which exists in dist/tokens.css', (name) => {
    expect(defined(name)).toBe(true);
  });

  it.runIf(!HOVER_BLOCKS.includes(block))('has no hover or active rule', () => {
    expect(source).not.toMatch(/:hover|:active/);
  });

  it('has no active rule', () => {
    expect(source).not.toMatch(/:active/);
  });
});

describe('button output', () => {
  it('has rules for the button in the scss partial', () => {
    expect(sources.some(({ block }) => block === 'button')).toBe(true);
  });

  it.each(['styles.css', 'components/button.css'])(
    'puts the button rules of dist/%s inside @layer cocokits',
    (name) => {
      const css = readThemeFile('dist', name);
      expect(css.startsWith('@layer cocokits {')).toBe(true);
      expect(css).toContain('.cck-button');
      expect(css.trimEnd().endsWith('}')).toBe(true);
      expect(css).not.toMatch(name === 'styles.css' ? /:active/ : /:hover|:active/);
    },
  );

  it('emits the button tokens on the component class and never on :root', () => {
    expect(tokensCss).toContain('.cck-button[data-size=sm] {');
    expect(tokensCss).toContain('.cck-button, .cck-button[data-size=md] {');
    const blocks = tokensCss.split('  }').filter((block) => block.includes(':root'));
    expect(blocks.join('')).not.toContain('--cck-button');
  });

  it.each(['styles.css', 'components/button.css'])(
    'gives :disabled (fieldset) the same disabled styling as [data-disabled] in dist/%s',
    (name) => {
      const css = readThemeFile('dist', name);
      const rule = /\.cck-button\[data-disabled\],\s*\.cck-button:disabled\s*\{([^}]*)\}/.exec(css)?.[1] ?? '';
      expect(rule).toContain('background-color: var(--cck-button-disabled-bg)');
      expect(rule).toContain('color: var(--cck-button-disabled-label-color)');
    },
  );

  it('sizes the height with min-block-size and sets no fixed block-size or height', () => {
    const source = readThemeFile('src', 'styles', 'components', '_button.scss');
    expect(source).toContain('min-block-size: var(--cck-button-height);');
    expect(source).not.toMatch(/(^|[\s{;])(block-size|height)\s*:/);
  });

  it('restates [hidden] on the box it sets to display', () => {
    expect(readThemeFile('dist', 'components', 'button.css')).toMatch(/\.cck-button\[hidden\]\s*\{\s*display: none/);
  });
});
