import { describe, expect, it } from 'vitest';
import { declarationsOf, read } from './css-test-helpers';

const css = read('dist', 'components', 'tooltip.css');
const tokensCss = read('dist', 'tokens.css');

describe('tooltip output', () => {
  it('puts the rules inside @layer cocokits and into the whole theme', () => {
    expect(css.replace(/^@property --side-offset \{[^}]*\}\n/, '').startsWith('@layer cocokits {')).toBe(true);
    expect(read('dist', 'styles.css')).toContain('.cck-tooltip__content {');
  });

  it('emits the tokens on the content class and never on :root', () => {
    expect(tokensCss).toContain('.cck-tooltip__content {');
    const blocks = tokensCss.split('  }').filter((block) => block.includes(':root'));
    expect(blocks.join('')).not.toContain('--cck-tooltip-');
  });

  it('reads the surface and the offset from tokens', () => {
    const rule = declarationsOf(css, '.cck-tooltip__content') ?? '';
    for (const line of [
      '--side-offset: var(--cck-tooltip-side-offset)',
      'background-color: var(--cck-tooltip-bg)',
      'color: var(--cck-tooltip-text-color)',
      'border-radius: var(--cck-tooltip-radius)',
    ]) {
      expect(rule).toContain(line);
    }
  });

  it('leaves the placement to the positioning module', () => {
    const rule = declarationsOf(css, '.cck-tooltip__content') ?? '';
    expect(rule).not.toMatch(/(^|[\s;])(position|inset|top|left|right|bottom|transform)\s*:/);
  });

  it('has no focus ring and no pointer rule, the bubble is neither focusable nor a control', () => {
    expect(css).not.toContain(':focus');
    expect(css).not.toContain('cursor');
  });

  it('restates [hidden] because the theme sets the box', () => {
    expect(css).toMatch(/\.cck-tooltip__content\[hidden\]\s*\{\s*display: none/);
  });

  it('runs its motion only without a reduced-motion preference, keyed on data-state', () => {
    const motion = css.split('@media (prefers-reduced-motion: no-preference)')[1] ?? '';
    expect(motion).toContain('.cck-tooltip__content[data-state=open]');
    expect(motion).toContain('.cck-tooltip__content[data-state=closed]');
    const outside = css.split('@media (prefers-reduced-motion: no-preference)')[0] ?? '';
    expect(outside).not.toMatch(/animation:/);
  });

  it('mirrors the inline slide in right-to-left on the part itself', () => {
    expect(css).toContain('[data-side=start]:dir(rtl)');
    expect(css).toContain('[data-side=end]:dir(rtl)');
  });

  it('is Canvas and CanvasText with a border in forced colors', () => {
    const forced = css.split('@media (forced-colors: active)')[1] ?? '';
    expect(forced).toContain('border: 1px solid CanvasText');
    expect(forced).toContain('color: CanvasText');
  });
});
