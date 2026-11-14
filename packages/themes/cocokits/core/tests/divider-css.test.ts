import { describe, expect, it } from 'vitest';
import { declarationsOf, read, selectorsOf, tokensCss } from './css-test-helpers';

const stylesCss = read('dist', 'styles.css');
const entryCss = read('dist', 'components', 'divider.css');
const scss = read('src', 'styles', 'components', '_divider.scss');
const rule = (selector: string): string => declarationsOf(entryCss, selector) ?? '';

describe('divider output', () => {
  it.each(['styles.css', 'components/divider.css'])('puts the rules of dist/%s inside @layer cocokits', (name) => {
    const css = read('dist', name);
    expect(css.startsWith('@layer cocokits {')).toBe(true);
    expect(css).toContain('.cck-divider');
  });

  it('names only the root class and its own attributes', () => {
    const selectors = selectorsOf(entryCss).flatMap((list) => list.split(/,\s*/));
    expect(selectors.length).toBeGreaterThan(0);
    for (const selector of selectors)
      expect(selector).toMatch(/^\.cck-divider(\[data-(orientation|color)(='?\w+'?)?\]|\[hidden\])?$/);
  });

  it('emits the tokens on the component class and never on :root', () => {
    expect(tokensCss).toMatch(
      /\.cck-divider, \.cck-divider\[data-size=md\] \{[^}]*--cck-divider-thickness: var\(--cck-border-width-1\)/,
    );
    expect(tokensCss).toMatch(
      /\.cck-divider\[data-size=lg\] \{[^}]*--cck-divider-thickness: var\(--cck-border-width-2\)/,
    );
    const blocks = tokensCss.split('  }').filter((block) => block.includes(':root'));
    expect(blocks.join('')).not.toContain('--cck-divider');
  });

  it.each([
    ['light', 'border-1'],
    ['default', 'border-2'],
    ['dark', 'border-3'],
  ])('maps the %s colour to the %s token', (name, token) => {
    expect(tokensCss).toContain(`--cck-divider-color-${name}: var(--cck-${token})`);
    if (name !== 'default') {
      expect(rule(`.cck-divider[data-color=${name}]`)).toContain(`border-color: var(--cck-divider-color-${name})`);
    }
  });
});

describe('divider line', () => {
  it('sets every border property itself, with no margin and no currentColor', () => {
    const root = rule('.cck-divider');
    expect(root).toContain('margin: 0');
    expect(root).toContain('border: 0 solid var(--cck-divider-color-default)');
    expect(root).toContain('flex-shrink: 0');
    expect(root).toContain('box-sizing: border-box');
    expect(scss).not.toMatch(/currentColor/i);
    expect(stylesCss).not.toMatch(/\.cck-divider[^}]*currentColor/i);
  });

  it('draws the horizontal line on the block-start side', () => {
    expect(rule('.cck-divider[data-orientation=horizontal]')).toContain(
      'border-block-start-width: var(--cck-divider-thickness)',
    );
  });

  it('draws the vertical line on the inline-start side and stretches it in a row', () => {
    const vertical = rule('.cck-divider[data-orientation=vertical]');
    expect(vertical).toContain('border-inline-start-width: var(--cck-divider-thickness)');
    expect(vertical).toContain('align-self: stretch');
    expect(vertical).toContain('min-block-size: 1em');
  });

  it('uses logical properties only', () => {
    expect(entryCss).not.toMatch(
      /\b(left|right|top|bottom)\b|border-(left|right|top|bottom)|(?<![-\w])(width|height)\s*:/,
    );
  });

  it('restates the native hidden with display none, in the layer', () => {
    expect(rule('.cck-divider[hidden]')).toContain('display: none');
  });

  it('keeps a CanvasText border in forced colors', () => {
    const forced = entryCss.split('@media (forced-colors: active)')[1] ?? '';
    expect(forced).toContain('.cck-divider');
    expect(forced).toContain('border-color: CanvasText');
  });
});
