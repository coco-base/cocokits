import { describe, expect, it } from 'vitest';
import { declarationsOf, read, tokensCss } from './css-test-helpers';

const css = read('dist', 'components', 'popover.css');

describe('popover output', () => {
  it('puts the rules inside @layer cocokits and into the whole theme', () => {
    expect(css.replace(/^@property --side-offset \{[^}]*\}\n/, '').startsWith('@layer cocokits {')).toBe(true);
    expect(read('dist', 'styles.css')).toContain('.cck-popover__content {');
  });

  it('emits the tokens on the content class and never on :root', () => {
    expect(tokensCss).toContain('.cck-popover__content {');
    const blocks = tokensCss.split('  }').filter((block) => block.includes(':root'));
    expect(blocks.join('')).not.toContain('--cck-popover-');
  });

  it('reads the surface, the offset and the available height from tokens and the positioning module', () => {
    const rule = declarationsOf(css, '.cck-popover__content') ?? '';
    for (const line of [
      '--side-offset: var(--cck-popover-side-offset)',
      'background-color: var(--cck-popover-bg)',
      'border-radius: var(--cck-popover-radius)',
      'box-shadow: var(--cck-popover-shadow)',
      'max-block-size: var(--available-height, none)',
    ]) {
      expect(rule).toContain(line);
    }
  });

  it('leaves the placement to the positioning module', () => {
    const rule = declarationsOf(css, '.cck-popover__content') ?? '';
    expect(rule).not.toMatch(/(^|[\s;])(position|inset|top|left|right|bottom|transform)\s*:/);
  });

  it('restates [hidden] because the content sets display', () => {
    expect(css).toMatch(/\.cck-popover__content\[hidden\]\s*\{\s*display: none/);
  });

  it('runs its motion only without a reduced-motion preference, keyed on data-state', () => {
    const motion = css.split('@media (prefers-reduced-motion: no-preference)')[1] ?? '';
    expect(motion).toContain('.cck-popover__content[data-state=open]');
    expect(motion).toContain('.cck-popover__content[data-state=closed]');
    const outside = css.split('@media (prefers-reduced-motion: no-preference)')[0] ?? '';
    expect(outside).not.toMatch(/animation:/);
  });

  it('mirrors the inline slide in right-to-left on the part itself', () => {
    expect(css).toContain('[data-side=start]:dir(rtl)');
    expect(css).toContain('[data-side=end]:dir(rtl)');
  });

  it('is CanvasText with a Highlight ring in forced colors', () => {
    const forced = css.split('@media (forced-colors: active)')[1] ?? '';
    expect(forced).toContain('border-color: CanvasText');
    expect(forced).toContain('outline-color: Highlight');
  });

  it('styles the Title and Description from their tokens with no margin', () => {
    const title = declarationsOf(css, '.cck-popover__title') ?? '';
    for (const line of [
      'margin: 0',
      'color: var(--cck-popover-title-color)',
      'font-family: var(--cck-popover-title-font-family)',
      'font-size: var(--cck-popover-title-font-size)',
      'font-weight: var(--cck-popover-title-font-weight)',
      'line-height: var(--cck-popover-title-line-height)',
      'letter-spacing: var(--cck-popover-title-letter-spacing)',
    ]) {
      expect(title).toContain(line);
    }
    const description = declarationsOf(css, '.cck-popover__description') ?? '';
    expect(description).toContain('margin: 0');
    expect(description).toContain('color: var(--cck-popover-description-color)');
  });

  it('emits the Title and Description tokens on the content class', () => {
    expect(tokensCss).toContain('--cck-popover-title-color');
    expect(tokensCss).toContain('--cck-popover-description-color');
  });

  it('gives the Title and Description CanvasText in forced colors and styles no Anchor', () => {
    const forced = css.split('@media (forced-colors: active)')[1] ?? '';
    expect(forced).toMatch(/\.cck-popover__title,\s*\.cck-popover__description\s*\{\s*color: CanvasText/);
    expect(css).not.toContain('.cck-popover__anchor');
  });

  it('leaves the trigger and its focus ring to the author', () => {
    expect(css).not.toContain('.cck-popover__trigger');
  });

  it('styles only a plain Close, so a Button used as Close keeps its own padding, border and font', () => {
    const rule = declarationsOf(css, '.cck-popover__close:not(.cck-button)') ?? '';
    expect(rule).toContain('padding:');
    expect(rule).toContain('border:');
    expect(rule).toContain('font: inherit');
    expect(css).not.toMatch(/__close(?!:not\(\.cck-button\))/);
  });
});
