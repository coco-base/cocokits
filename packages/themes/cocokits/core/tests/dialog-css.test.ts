import { describe, expect, it } from 'vitest';
import { declarationsOf, read, tokensCss } from './css-test-helpers';

const css = read('dist', 'components', 'dialog.css');

describe('dialog output', () => {
  it('puts the rules inside @layer cocokits and into the whole theme', () => {
    expect(css.startsWith('@layer cocokits {')).toBe(true);
    expect(read('dist', 'styles.css')).toContain('.cck-dialog__content {');
  });

  it('emits the tokens on the content class and never on :root', () => {
    expect(tokensCss).toContain('.cck-dialog__content {');
    const blocks = tokensCss.split('  }').filter((block) => block.includes(':root'));
    expect(blocks.join('')).not.toContain('--cck-dialog-');
  });

  it('reads the surface from tokens', () => {
    const rule = declarationsOf(css, '.cck-dialog__content') ?? '';
    for (const line of [
      'background-color: var(--cck-dialog-bg)',
      'border-radius: var(--cck-dialog-radius)',
      'box-shadow: var(--cck-dialog-shadow)',
      'max-inline-size: var(--cck-dialog-max-inline-size)',
    ]) {
      expect(rule).toContain(line);
    }
  });

  it('draws the backdrop from a token, on the pseudo-element of the content', () => {
    const rule = declarationsOf(css, '.cck-dialog__content::backdrop') ?? '';
    expect(rule).toContain('background-color: var(--cck-dialog-backdrop-bg)');
  });

  it('leaves the centring to the user agent', () => {
    const rule = declarationsOf(css, '.cck-dialog__content') ?? '';
    expect(rule).not.toMatch(/(^|[\s;])(position|inset|top|left|right|bottom|transform|margin)\s*:/);
  });

  it('shows the flex layout only while the dialog is open, so a closed one stays hidden', () => {
    expect(declarationsOf(css, '.cck-dialog__content') ?? '').not.toContain('display:');
    expect(declarationsOf(css, '.cck-dialog__content[open]') ?? '').toContain('display: flex');
  });

  it('runs its motion, backdrop included, only without a reduced-motion preference, keyed on data-state', () => {
    const motion = css.split('@media (prefers-reduced-motion: no-preference)')[1] ?? '';
    expect(motion).toContain('.cck-dialog__content[data-state=open]');
    expect(motion).toContain('.cck-dialog__content[data-state=closed]');
    expect(motion).toContain('.cck-dialog__content[data-state=open]::backdrop');
    expect(motion).toContain('.cck-dialog__content[data-state=closed]::backdrop');
    const outside = css.split('@media (prefers-reduced-motion: no-preference)')[0] ?? '';
    expect(outside).not.toMatch(/animation:/);
  });

  it('is CanvasText with a Highlight ring in forced colors', () => {
    const forced = css.split('@media (forced-colors: active)')[1] ?? '';
    expect(forced).toContain('border-color: CanvasText');
    expect(forced).toContain('outline-color: Highlight');
  });

  it('leaves the trigger and its focus ring to the author', () => {
    expect(css).not.toContain('.cck-dialog__trigger');
  });

  it('styles only a plain Close, so a Button used as Close keeps its own padding, border and font', () => {
    const rule = declarationsOf(css, '.cck-dialog__close:not(.cck-button)') ?? '';
    expect(rule).toContain('padding:');
    expect(rule).toContain('border:');
    expect(rule).toContain('font: inherit');
    expect(css).not.toMatch(/__close(?!:not\(\.cck-button\))/);
  });
});
