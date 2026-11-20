import { describe, expect, it } from 'vitest';
import { declarationsInList, declarationsOf, read, selectorsOf, tokensCss } from './css-test-helpers';

const css = read('dist', 'components', 'menu.css');
const rule = (selector: string): string => declarationsInList(css, selector) ?? '';
const forced = css.split('@media (forced-colors: active)')[1] ?? '';
const motion = css.split('@media (prefers-reduced-motion: no-preference)')[1]?.split('@media')[0] ?? '';
const PANEL = ':is(.cck-menu__content, .cck-menu__sub-content)';

/** Splits a selector list at the commas outside parentheses. */
function splitList(list: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const char of list) {
    if (char === '(') depth += 1;
    if (char === ')') depth -= 1;
    if (char === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  return [...parts, current.trim()];
}

describe('menu output', () => {
  it('puts the rules inside @layer cocokits and into the whole theme', () => {
    expect(css.replace(/^@property --side-offset \{[^}]*\}\n/, '').startsWith('@layer cocokits {')).toBe(true);
    expect(read('dist', 'styles.css')).toMatch(/\.cck-menu__content,\s*\.cck-menu__sub-content \{/);
    expect(read('dist', 'styles.css')).toContain('.cck-menu__item,');
  });

  it('names only the Menu parts, the divider and the icon, never a tag or the nth-child', () => {
    const selectors = selectorsOf(css).flatMap(splitList);
    expect(selectors.length).toBeGreaterThan(0);
    for (const selector of selectors) {
      expect(selector).toMatch(/^(:is\()?\.cck-menu__[a-z-]+/);
      expect(selector).not.toContain('nth-child');
      expect(selector).not.toMatch(/(^|[\s>])[a-z][\w-]*(\s|$|\[|:)/);
    }
  });

  it('emits the size modes and the structure tokens on the content class and nothing on :root', () => {
    expect(tokensCss).toContain('.cck-menu__content[data-size=sm], .cck-menu__sub-content[data-size=sm] {');
    expect(tokensCss).toContain(
      '.cck-menu__content, .cck-menu__content[data-size=md], .cck-menu__sub-content, .cck-menu__sub-content[data-size=md] {',
    );
    expect(tokensCss).toContain('.cck-menu__content[data-size=lg], .cck-menu__sub-content[data-size=lg] {');
    const blocks = tokensCss.split('  }').filter((block) => block.includes(':root'));
    expect(blocks.join('')).not.toContain('--cck-menu-');
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
      'padding: var(--cck-menu-padding)',
      'max-block-size: var(--available-height, none)',
    ]) {
      expect(content).toContain(line);
    }
    expect(content).not.toMatch(/(^|[\s;])(position|inset|top|left|right|bottom|transform)\s*:/);
  });

  it('sizes every item from the height token of the content and gives the rows no motion', () => {
    const item = rule('.cck-menu__item');
    for (const line of [
      'min-block-size: var(--cck-menu-item-height)',
      'padding-block: var(--cck-menu-item-padding-block)',
      'padding-inline: var(--cck-menu-item-padding-inline)',
      'gap: 0 var(--cck-menu-item-gap)',
      'border-radius: var(--cck-menu-item-radius)',
      'cursor: pointer',
    ]) {
      expect(item).toContain(line);
    }
    expect(item).not.toContain('margin-inline');
    expect(css).not.toContain('transition');
    expect(css).not.toMatch(/\.cck-menu__(item|checkbox-item|radio-item|sub-trigger)[^{]*\{[^}]*animation/);
  });

  it('highlights a hovered enabled item, a focused one and an open sub-trigger, and rings it in forced colors', () => {
    for (const selector of [
      '.cck-menu__item:hover:not([data-disabled])',
      '.cck-menu__item:focus-visible',
      '.cck-menu__sub-trigger[data-state=open]',
    ]) {
      expect(rule(selector)).toContain('background-color: var(--cck-menu-item-highlight-bg)');
    }
    expect(rule('.cck-menu__item')).toContain('outline: none');
    expect(declarationsInList(forced, '.cck-menu__item:focus-visible')).toContain(
      'outline: var(--cck-menu-item-focus-width) solid Highlight',
    );
  });

  it('fades a disabled item and shows the not-allowed cursor', () => {
    const disabled = rule('.cck-menu__item[data-disabled]');
    expect(disabled).toContain('opacity: var(--cck-menu-item-disabled-opacity)');
    expect(disabled).toContain('cursor: not-allowed');
    expect(disabled).not.toMatch(/(^|[\s;])color:/);
  });

  it('sizes an icon in an item and spaces a divider in the content', () => {
    const icon = rule('.cck-menu__item > .cck-svg-icon:not([data-cck-color])');
    expect(rule('.cck-menu__item > .cck-svg-icon:not([data-size])')).toContain(
      'font-size: var(--cck-menu-item-icon-size)',
    );
    expect(icon).toContain('color: var(--cck-menu-item-icon-color)');
    const divider = rule('.cck-menu__content > .cck-divider');
    expect(divider).toContain('margin-block: var(--cck-menu-separator-margin-block)');
    expect(divider).toContain('margin-inline: calc(-1 * var(--cck-menu-padding))');
  });

  it.each([
    '.cck-menu__content',
    '.cck-menu__sub-content',
    '.cck-menu__item',
    '.cck-menu__checkbox-item',
    '.cck-menu__radio-item',
    '.cck-menu__sub-trigger',
    '.cck-menu__item-leading',
    '.cck-menu__item-trailing',
    '.cck-menu__item-indicator',
    '.cck-menu__item-supporting-text',
    '.cck-menu__item-shortcut',
    '.cck-menu__group',
    '.cck-menu__radio-group',
    '.cck-menu__group-label',
  ])('restates [hidden] because %s sets display', (selector) => {
    expect(rule(`${selector}[hidden]`)).toContain('display: none');
  });

  it('is CanvasText, Highlight and GrayText in forced colors', () => {
    expect(declarationsInList(forced, '.cck-menu__content')).toContain('border-color: CanvasText');
    expect(forced).toContain('solid Highlight');
    expect(declarationsInList(forced, '.cck-menu__item[data-disabled]')).toContain('color: GrayText');
  });
});

describe('menu sub-trigger chevron', () => {
  it('exists only while the sub-trigger holds no trailing part of the author', () => {
    expect(declarationsOf(css, '.cck-menu__sub-trigger:not(:has(> .cck-menu__item-trailing))::after')).toContain(
      'content: ""',
    );
    expect(declarationsOf(css, '.cck-menu__sub-trigger::after')).not.toContain('content');
  });

  it('is a square with two borders turned by 45deg, at the end of the row', () => {
    const chevron = declarationsOf(css, '.cck-menu__sub-trigger::after') ?? '';
    for (const line of [
      'inline-size: var(--cck-menu-item-chevron-size)',
      'block-size: var(--cck-menu-item-chevron-size)',
      'margin-inline-start: auto',
      'border: 0 solid var(--cck-menu-item-secondary-color)',
      'border-block-start-width: var(--cck-menu-item-chevron-border-width)',
      'border-inline-end-width: var(--cck-menu-item-chevron-border-width)',
      'rotate: 45deg',
    ]) {
      expect(chevron).toContain(line);
    }
  });

  it('turns the other way in RTL and drops its auto margin next to a shortcut', () => {
    expect(declarationsOf(css, '.cck-menu__sub-trigger:dir(rtl)::after')).toContain('rotate: -45deg');
    expect(declarationsOf(css, '.cck-menu__sub-trigger:has(> .cck-menu__item-shortcut)::after')).toContain(
      'margin-inline-start: 0',
    );
  });

  it('is CanvasText in forced colors, GrayText when disabled', () => {
    expect(declarationsOf(forced, '.cck-menu__sub-trigger::after')).toContain('border-color: CanvasText');
    expect(declarationsOf(forced, '.cck-menu__sub-trigger[data-disabled]::after')).toContain('border-color: GrayText');
  });
});

describe('menu motion', () => {
  it('runs only without a reduced-motion preference', () => {
    const outside = css.replace(/@media \(prefers-reduced-motion: no-preference\) \{[\s\S]*?\n {2}\}\n/, '');
    expect(outside).not.toMatch(/(^|[\s;])animation:/);
    expect(motion).toContain('cck-menu-in');
  });

  it('fades and slides the content and the sub-content in and out, keyed on data-state', () => {
    expect(declarationsOf(motion, `${PANEL}[data-state=open]`)).toContain(
      'animation: cck-menu-in var(--cck-menu-motion-duration) ease-out',
    );
    expect(declarationsOf(motion, `${PANEL}[data-state=closed]`)).toContain(
      'animation: cck-menu-out var(--cck-menu-motion-duration) ease-in forwards',
    );
    for (const name of ['cck-menu-in', 'cck-menu-out']) {
      const frames = css.split(`@keyframes ${name} {`)[1]?.split('\n  }')[0] ?? '';
      expect(frames).toContain('opacity: 0');
      expect(frames).toContain('translate: var(--_slide-x, 0px) var(--_slide-y, 0px)');
    }
  });

  it('slides away from the anchor on each side, with RTL counterparts for start and end', () => {
    const distance = 'var(--cck-menu-motion-distance)';
    const away = `calc(-1 * ${distance})`;
    expect(declarationsOf(motion, `${PANEL}[data-side=top]`)).toContain(`--_slide-y: ${distance}`);
    expect(declarationsOf(motion, `${PANEL}[data-side=bottom]`)).toContain(`--_slide-y: ${away}`);
    expect(declarationsOf(motion, `${PANEL}[data-side=start]`)).toContain(`--_slide-x: ${distance}`);
    expect(declarationsOf(motion, `${PANEL}[data-side=start]:dir(rtl)`)).toContain(`--_slide-x: ${away}`);
    expect(declarationsOf(motion, `${PANEL}[data-side=end]`)).toContain(`--_slide-x: ${away}`);
    expect(declarationsOf(motion, `${PANEL}[data-side=end]:dir(rtl)`)).toContain(`--_slide-x: ${distance}`);
  });

  it('slides a sub-content on top or bottom in from the inline end of its sub-trigger', () => {
    const selector = '.cck-menu__sub-content:is([data-side=top], [data-side=bottom])';
    expect(declarationsOf(motion, selector)).toContain('--_slide-x: calc(-1 * var(--cck-menu-motion-distance))');
    expect(declarationsOf(motion, `${selector}:dir(rtl)`)).toContain('--_slide-x: var(--cck-menu-motion-distance)');
  });
});
