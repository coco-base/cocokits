import { describe, expect, it } from 'vitest';
import { declarationsOf, outsideReducedMotion, read, reducedMotionBlocks, tokensCss } from './css-test-helpers';

const css = read('dist', 'components', 'dialog.css');
/** The plain Close: a Button or an IconButton used as Close keeps its own look. */
const CLOSE = '.cck-dialog__close:not(.cck-button, .cck-icon-button)';

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
    // `state.transition` emits a reduced-motion block per include, so the motion is in one of many blocks.
    const motion = reducedMotionBlocks(css).join('\n');
    expect(motion).toContain('.cck-dialog__content[data-state=open]');
    expect(motion).toContain('.cck-dialog__content[data-state=closed]');
    expect(motion).toContain('.cck-dialog__content[data-state=open]::backdrop');
    expect(motion).toContain('.cck-dialog__content[data-state=closed]::backdrop');
    expect(outsideReducedMotion(css)).not.toMatch(/animation:|transition/);
  });

  it('is CanvasText with a Highlight ring in forced colors', () => {
    const forced = css.split('@media (forced-colors: active)')[1] ?? '';
    expect(forced).toContain('border-color: CanvasText');
    expect(forced).toContain('outline-color: Highlight');
  });

  it('leaves the trigger and its focus ring to the author', () => {
    expect(css).not.toContain('.cck-dialog__trigger');
  });

  it('styles only a plain Close, so a Button or an IconButton used as Close keeps its own padding, border and font', () => {
    const rule = declarationsOf(css, CLOSE) ?? '';
    expect(rule).toContain('padding:');
    expect(rule).toContain('border:');
    expect(rule).toContain('font: inherit');
    expect(css).not.toMatch(/__close(?!:not\(\.cck-button, \.cck-icon-button\))/);
  });

  it('restates [hidden] on the content, after its open layout, and on the parts that set a display', () => {
    expect(css).toMatch(/\.cck-dialog__content\[hidden\]\s*\{\s*display: none/);
    expect(css.indexOf('.cck-dialog__content[hidden]')).toBeGreaterThan(css.indexOf('.cck-dialog__content[open]'));
    expect(css).toMatch(
      /\.cck-dialog__header\[hidden\],\s*\.cck-dialog__body\[hidden\],\s*\.cck-dialog__footer\[hidden\]\s*\{\s*display: none/,
    );
    expect(css).toMatch(/\.cck-dialog__description\[hidden\]\s*\{\s*display: none/);
  });

  it('lays the plain Close out as an inline flex box and restates [hidden] after it', () => {
    expect(declarationsOf(css, CLOSE)).toContain('display: inline-flex');
    expect(css).toMatch(/\.cck-dialog__close:not\(\.cck-button, \.cck-icon-button\)\[hidden\]\s*\{\s*display: none/);
    expect(css.indexOf(`${CLOSE}[hidden]`)).toBeGreaterThan(css.indexOf(`${CLOSE} {`));
  });
});
