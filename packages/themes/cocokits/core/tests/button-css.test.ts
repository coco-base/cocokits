// @vitest-environment jsdom
import { readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  declarationsOf,
  OVERLAY_TRIGGERS,
  outsideReducedMotion,
  read as readThemeFile,
  reducedMotionBlocks,
  ref,
  sizeTokenOf,
  structureTokenOf,
  tokensCss,
} from './css-test-helpers';

const root = join(import.meta.dirname, '..');
const componentsDir = join(root, 'src', 'styles', 'components');

/** `_button.scss` is the rules of the `button` block. Entries without rules have no `var()`. */
const sources = readdirSync(componentsDir)
  .filter((file) => file.endsWith('.scss'))
  .map((file) => ({
    file,
    block: basename(file, '.scss')
      .replace(/^_/, '')
      .replace(/-parts$/, ''),
  }));
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
/** The blocks with a hover look (a text box shows it on its border; the Menu item on its fill; a Switch, Checkbox and Radio on the halo and the border; the Popover and Dialog Close on their fill; choice-css.test.ts asserts those rules and bans :active in the shared partial; Tabs and TabNav (the same partial, `_tabs.scss`) only let the pointer switch the slide of its indicator on, and tabs-css.test.ts asserts that no color rule reads :hover); every other block has none. */
const HOVER_BLOCKS = [
  // The outline and basic variants tint on hover (button-css.test.ts and icon-button-css.test.ts assert it).
  'button',
  'icon-button',
  // The header of a default or group item fills on hover (accordion-css.test.ts asserts it).
  'accordion',
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
  // A chip's remove button tints on hover; a chip list's box shows it on its border, as a text box.
  'chip',
  'chip-list',
  'menu',
];
const defined = (name: string): boolean => INLINE_PROPERTIES.includes(name) || tokensCss.includes(`${name}:`);
/** A private custom property of one partial (`--_fill`, `--_ink`, `--_focus`): no token, set and read in the partial. */
const isPrivate = (name: string): boolean => name.startsWith('--_');
/** The selector items and the declarations of every rule of a built sheet. */
const rulesOf = (css: string): { items: string[]; body: string }[] =>
  [...css.matchAll(/(?<=^|[{}])\s*([^{}@]+?)\s*\{([^{}]*)\}/g)].map(([, selector, body]) => ({
    items: selector.split(/,(?![^(]*\))/).map((item) => item.trim()),
    body,
  }));

describe.each(sources)('component styles $file', ({ file, block }) => {
  const source = readFileSync(join(componentsDir, file), 'utf8');
  const names = [...source.matchAll(/var\((--[\w-]+)/g)].map((match) => match[1]);

  it('reads only its own --cck-<block>-* tokens and its private --_* properties', () => {
    const foreign = names.filter(
      (name) => !name.startsWith(`--cck-${block}-`) && !INLINE_PROPERTIES.includes(name) && !isPrivate(name),
    );
    expect(foreign).toEqual([]);
  });

  it.each([...new Set(names.filter((name) => !isPrivate(name)))])(
    'reads %s, which exists in dist/tokens.css',
    (name) => {
      expect(defined(name)).toBe(true);
    },
  );

  it.each([...new Set(names.filter(isPrivate))])('sets %s, which it reads, in the same partial', (name) => {
    expect(source).toMatch(new RegExp(`${name}\\s*:`));
    expect(tokensCss).not.toContain(`${name}:`);
  });

  it.runIf(!HOVER_BLOCKS.includes(block))('has no hover or active rule', () => {
    expect(source).not.toMatch(/:hover|:active/);
  });
});

/** The controls with a fill: each variant sets `--_fill` and `--_ink`, and hover and press mix the ink into the fill. */
const FILL_BLOCKS = sources
  .filter(({ file }) => /--_fill\s*:/.test(readFileSync(join(componentsDir, file), 'utf8')))
  .map(({ block }) => block);

describe('controls with a fill', () => {
  it('are the Button, the Icon button, the Chip and the Switch', () => {
    expect([...FILL_BLOCKS].sort()).toEqual(['button', 'chip', 'icon-button', 'switch']);
  });

  it.each(FILL_BLOCKS)('%s has a :hover and an :active state layer, and neither reaches a disabled one', (block) => {
    const layers = rulesOf(readThemeFile('dist', 'components', `${block}.css`))
      .filter(({ body }) => body.includes('color-mix(in srgb, var(--_fill), var(--_ink)'))
      .flatMap(({ items, body }) => items.map((item) => ({ item, body })));
    const hover = layers.filter(({ item }) => item.includes(':hover'));
    const active = layers.filter(({ item }) => item.includes(':active'));
    expect(hover.length, 'hover').toBeGreaterThan(0);
    expect(active.length, 'active').toBeGreaterThan(0);
    for (const { body } of hover) expect(body).toContain(`var(--cck-${block}-hover-mix)`);
    for (const { body } of active) expect(body).toContain(`var(--cck-${block}-active-mix)`);
    for (const { item } of [...hover, ...active]) expect(item, item).toMatch(/:not\([^)]*disabled/);
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
    },
  );

  it('emits the button tokens on the component class and never on :root', () => {
    expect(tokensCss).toContain('.cck-button[data-size=sm] {');
    expect(tokensCss).toContain('.cck-button, .cck-button[data-size=md] {');
    const blocks = tokensCss.split('  }').filter((block) => block.includes(':root'));
    expect(blocks.join('')).not.toContain('--cck-button');
  });

  it.each(['styles.css', 'components/button.css'])(
    'gives :disabled (fieldset) the same disabled styling as [data-disabled] in dist/%s: it fades and keeps its look',
    (name) => {
      const css = readThemeFile('dist', name);
      const rule = /\.cck-button\[data-disabled\],\s*\.cck-button:disabled\s*\{([^}]*)\}/.exec(css)?.[1] ?? '';
      expect(rule).toContain('opacity: var(--cck-button-disabled-opacity)');
      expect(rule).toContain('box-shadow: none');
      expect(rule).toContain('cursor: not-allowed');
      expect(rule).not.toMatch(/background-color|(^|[\s;])color:/);
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

  it('fades its colours only without a reduced-motion preference', () => {
    const css = readThemeFile('dist', 'components', 'button.css');
    expect(reducedMotionBlocks(css).join('\n')).toMatch(
      /\.cck-button \{\s*transition-property: background-color, border-color, color, box-shadow;/,
    );
    expect(outsideReducedMotion(css)).not.toContain('transition');
  });
});

describe('button design match', () => {
  const css = readThemeFile('dist', 'components', 'button.css');
  const own = css.slice(0, css.indexOf('@media (forced-colors'));
  const HOVER = '.cck-button:hover:not([data-disabled], :disabled)';
  const OPEN = `.cck-button[data-state=open]:is(${OVERLAY_TRIGGERS}):not([data-variant=primary], [data-disabled], :disabled)`;
  const ACTIVE = '.cck-button:active:not([data-disabled], :disabled)';
  const sizes = [
    ['xs', 'control-xs', 'spacing-4', 'spacing-3', 'text-xs', 'size-14'],
    ['sm', 'control-sm', 'spacing-5', 'spacing-4', 'text-sm', 'size-16'],
    ['md', 'control-md', 'spacing-6', 'spacing-4', 'text-sm', 'size-16'],
    ['lg', 'control-lg', 'spacing-7', 'spacing-4', 'text-sm', 'size-20'],
    ['xl', 'control-xl', 'spacing-8', 'spacing-4', 'text-md', 'size-20'],
  ] as const;

  it.each(sizes)('size %s: height, padding, gap, label text and icon size', (mode, height, pad, gap, text, icon) => {
    const at = (name: string): string | undefined => sizeTokenOf('.cck-button', mode, name);
    expect(at('button-height')).toBe(ref(height));
    expect(at('button-padding-inline')).toBe(ref(pad));
    expect(at('button-gap')).toBe(ref(gap));
    for (const part of ['font-family', 'font-size', 'line-height', 'letter-spacing'])
      expect(at(`button-label-${part}`), part).toBe(ref(`${text}-${part}`));
    expect(at('button-icon-size')).toBe(ref(icon));
  });

  it.each([
    ['button-solid-bg', 'color'],
    ['button-solid-label-color', 'on-color'],
    ['button-soft-bg', 'container'],
    ['button-label-color', 'on-container'],
    ['button-outline-bg', 'surface-1'],
    ['button-border-color', 'edge'],
    ['button-shadow', 'shadow-xs'],
    ['button-radius', 'radius-md'],
    ['button-label-font-weight', 'font-weight-medium'],
    ['button-hover-mix', 'opacity-10'],
    ['button-active-mix', 'opacity-20'],
    ['button-focus-color', 'focus-2'],
    ['button-focus-width', 'border-width-2'],
    ['button-focus-offset', 'spacing-2'],
    ['button-disabled-opacity', 'opacity-50'],
  ])('structure token %s is %s', (name, alias) => {
    expect(structureTokenOf('.cck-button', name)).toBe(ref(alias));
  });

  it('keeps no colour token per state and no minimum width', () => {
    for (const name of ['hover-bg', 'solid-hover-bg', 'disabled-bg', 'disabled-label-color', 'min-inline-size'])
      expect(tokensCss, name).not.toContain(`--cck-button-${name}:`);
  });

  it('gives each variant its fill and ink; basic has no rule and takes the defaults of the root', () => {
    const root = declarationsOf(css, '.cck-button') ?? '';
    expect(root).toContain('--_fill: transparent');
    expect(root).toContain('--_ink: var(--cck-button-label-color)');
    expect(root).toContain('background-color: var(--_fill)');
    expect(root).toContain('color: var(--_ink)');
    const primary = declarationsOf(css, '.cck-button[data-variant=primary]') ?? '';
    expect(primary).toContain('--_fill: var(--cck-button-solid-bg)');
    expect(primary).toContain('--_ink: var(--cck-button-solid-label-color)');
    expect(primary).toContain('box-shadow: var(--cck-button-shadow)');
    expect(declarationsOf(css, '.cck-button[data-variant=soft]')).toContain('--_fill: var(--cck-button-soft-bg)');
    const outline = declarationsOf(css, '.cck-button[data-variant=outline]') ?? '';
    expect(outline).toContain('--_fill: var(--cck-button-outline-bg)');
    expect(outline).toContain('border-color: var(--cck-button-border-color)');
    expect(outline).toContain('box-shadow: var(--cck-button-shadow)');
    expect(css).not.toContain('data-variant=basic');
    expect(css).not.toContain('data-variant=light');
  });

  it('mixes the ink into the fill on hover and on press, never on a disabled button', () => {
    expect(declarationsOf(css, `${HOVER}, ${OPEN}`)).toContain(
      'background-color: color-mix(in srgb, var(--_fill), var(--_ink) var(--cck-button-hover-mix))',
    );
    expect(declarationsOf(css, ACTIVE)).toContain(
      'background-color: color-mix(in srgb, var(--_fill), var(--_ink) var(--cck-button-active-mix))',
    );
    expect(own.match(/:hover/g)).toHaveLength(1);
    expect(own.match(/:active/g)).toHaveLength(1);
  });

  it('rests the trigger of an open overlay on the hover fill, except the primary variant', () => {
    expect(css).toContain(`${HOVER}, ${OPEN} {`);
    expect(own.match(/data-state/g)).toHaveLength(1);
  });

  it('keeps the resting look of a Tooltip trigger while its tooltip is open: only an opened overlay rests on the hover fill', () => {
    const button = (classes: string): HTMLElement => {
      const element = document.createElement('button');
      element.className = `cck-button ${classes}`;
      element.setAttribute('data-state', 'open');
      return element;
    };
    expect(button('cck-tooltip__trigger').matches(OPEN)).toBe(false);
    for (const trigger of OVERLAY_TRIGGERS.split(', '))
      expect(button(trigger.slice(1)).matches(OPEN), trigger).toBe(true);
    // A Menu trigger that also has a Tooltip shows the open Menu.
    expect(button('cck-tooltip__trigger cck-menu__trigger').matches(OPEN)).toBe(true);
  });

  it('puts the hover, open and pressed rules after the variants and before the disabled rule, with no forced-colors rule of their own', () => {
    const disabled = css.indexOf('.cck-button[data-disabled],');
    for (const selector of [HOVER, OPEN, ACTIVE]) {
      expect(css.indexOf(selector), selector).toBeGreaterThan(css.indexOf('.cck-button[data-variant=outline]'));
      expect(css.indexOf(selector), selector).toBeLessThan(disabled);
    }
    const forced = css.slice(css.indexOf('@media (forced-colors'));
    expect(forced).not.toMatch(/:hover|:active|data-state/);
  });

  it('sizes a direct SvgIcon child with the icon size', () => {
    expect(declarationsOf(css, '.cck-button > .cck-svg-icon:not([data-size])')).toContain(
      'font-size: var(--cck-button-icon-size)',
    );
  });
});
