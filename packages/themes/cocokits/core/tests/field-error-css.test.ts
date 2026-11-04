import { describe, expect, it } from 'vitest';
import { declarationsOf, read } from './css-test-helpers';

const css = read('dist', 'components', 'field-error.css');
const scss = read('src', 'styles', 'components', '_field-error.scss');
const tokensCss = read('dist', 'tokens.css');

describe('field-error output', () => {
  it('puts the rules inside @layer cocokits and into the whole theme', () => {
    expect(css.startsWith('@layer cocokits {')).toBe(true);
    expect(read('dist', 'styles.css')).toContain('.cck-field-error {');
  });

  it('emits the tokens on the component class and never on :root', () => {
    expect(tokensCss).toContain('.cck-field-error {');
    const blocks = tokensCss.split('  }').filter((block) => block.includes(':root'));
    expect(blocks.join('')).not.toContain('--cck-field-error-');
  });

  it('colours the text with the danger text token and sets text-sm', () => {
    expect(tokensCss).toMatch(/--cck-field-error-text-color: var\(--cck-danger-text\)/);
    expect(tokensCss).toMatch(/--cck-field-error-font-size: var\(--cck-text-sm-font-size\)/);
    const rule = declarationsOf(css, '.cck-field-error') ?? '';
    for (const line of [
      'color: var(--cck-field-error-text-color)',
      'font-size: var(--cck-field-error-font-size)',
      'line-height: var(--cck-field-error-line-height)',
    ]) {
      expect(rule).toContain(line);
    }
  });

  it('sets no display (never none: the live region stays in the accessibility tree) and no margin', () => {
    expect(scss).not.toMatch(/(^|[\s{;])display\s*:/);
    expect(declarationsOf(css, '.cck-field-error')).not.toMatch(/margin/);
  });

  it('is CanvasText in forced colors', () => {
    const forced = css.split('@media (forced-colors: active)')[1] ?? '';
    expect(forced).toContain('color: CanvasText');
  });
});
