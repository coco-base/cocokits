import { describe, expect, it } from 'vitest';
import { declarationsOf, read, selectorsOf, tokensCss } from './css-test-helpers';

const css = read('dist', 'components', 'menu.css');
const rule = (selector: string): string => declarationsOf(css, selector) ?? '';

describe('menu output', () => {
  it('puts the rules inside @layer cocokits and into the whole theme', () => {
    expect(css.replace(/^@property --side-offset \{[^}]*\}\n/, '').startsWith('@layer cocokits {')).toBe(true);
    expect(read('dist', 'styles.css')).toContain('.cck-menu__content {');
    expect(read('dist', 'styles.css')).toContain('.cck-menu__item {');
  });

  it('names only the content, the item, the divider and the icon, never a tag or the nth-child', () => {
    const selectors = selectorsOf(css).flatMap((list) => list.split(/,\s*/));
    expect(selectors.length).toBeGreaterThan(0);
    for (const selector of selectors) {
      expect(selector).toMatch(/^\.cck-menu__(content|item)/);
      expect(selector).not.toContain('nth-child');
      expect(selector).not.toMatch(/(^|[\s>])[a-z][\w-]*(\s|$|\[|:)/);
    }
  });

  it('emits the size modes and the structure tokens on the content class and nothing on :root', () => {
    expect(tokensCss).toContain('.cck-menu__content[data-size=sm] {');
    expect(tokensCss).toContain('.cck-menu__content, .cck-menu__content[data-size=md] {');
    expect(tokensCss).toContain('.cck-menu__content[data-size=lg] {');
    const blocks = tokensCss.split('  }').filter((block) => block.includes(':root'));
    expect(blocks.join('')).not.toContain('--cck-menu-');
  });

  it.each([
    ['sm', '32px'],
    ['md', '40px'],
    ['lg', '48px'],
  ])('gives the %s size an item height of %s through the size tokens', (_size, _height) => {
    // The height is an alias of Core / Size, so the block names the variable; the generated modes index lists the values.
    expect(tokensCss).toMatch(
      new RegExp(
        `\\.cck-menu__content[^{]*\\[data-size=${_size}\\][^{]*\\{\\s*--cck-menu-item-height: var\\(--cck-size-${_height.slice(0, 2)}\\)`,
      ),
    );
  });

  it('draws the panel from tokens and leaves the placement to the positioning module', () => {
    const content = rule('.cck-menu__content');
    for (const line of [
      '--side-offset: var(--cck-menu-side-offset)',
      'display: flex',
      'flex-direction: column',
      'background-color: var(--cck-menu-bg)',
      'border: var(--cck-menu-border-width) solid var(--cck-menu-border-color)',
      'border-radius: var(--cck-menu-radius)',
      'box-shadow: var(--cck-menu-shadow)',
      'padding-block: var(--cck-menu-padding-block)',
      'max-block-size: var(--available-height, none)',
    ]) {
      expect(content).toContain(line);
    }
    expect(content).not.toMatch(/(^|[\s;])(position|inset|top|left|right|bottom|transform)\s*:/);
  });

  it('sizes every item from the height token of the content and takes no motion', () => {
    const item = rule('.cck-menu__item');
    for (const line of [
      'min-block-size: var(--cck-menu-item-height)',
      'padding-inline: var(--cck-menu-item-padding-inline)',
      'margin-inline: var(--cck-menu-item-margin-inline)',
      'gap: var(--cck-menu-item-gap)',
      'border-radius: var(--cck-menu-item-radius)',
      'cursor: pointer',
    ]) {
      expect(item).toContain(line);
    }
    expect(css).not.toMatch(/animation|transition/);
  });

  it('highlights a hovered enabled item and a focused one, and rings the focused one', () => {
    expect(css).toMatch(
      /\.cck-menu__item:hover:not\(\[data-disabled\]\),\s*\.cck-menu__item:focus-visible\s*\{\s*background-color: var\(--cck-menu-item-highlight-bg\)/,
    );
    expect(rule('.cck-menu__item:focus-visible')).toContain('outline: var(--cck-menu-item-focus-width) solid');
  });

  it('greys a disabled item and drops the pointer cursor', () => {
    const disabled = rule('.cck-menu__item[data-disabled]');
    expect(disabled).toContain('color: var(--cck-menu-item-disabled-text-color)');
    expect(disabled).toContain('cursor: default');
  });

  it('sizes an icon in an item and spaces a divider in the content', () => {
    const icon = rule('.cck-menu__item > .cck-svg-icon');
    expect(icon).toContain('font-size: var(--cck-menu-item-icon-size)');
    expect(icon).toContain('color: currentColor');
    expect(rule('.cck-menu__content > .cck-divider')).toContain('margin-block: var(--cck-menu-separator-margin-block)');
  });

  it.each(['.cck-menu__content', '.cck-menu__item'])('restates [hidden] because %s sets display', (selector) => {
    expect(rule(`${selector}[hidden]`)).toContain('display: none');
  });

  it('is CanvasText, Highlight and GrayText in forced colors', () => {
    const forced = css.split('@media (forced-colors: active)')[1] ?? '';
    expect(forced).toContain('border-color: CanvasText');
    expect(forced).toContain('outline-color: Highlight');
    expect(forced).toContain('color: GrayText');
  });
});
