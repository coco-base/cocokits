import { describe, expect, it } from 'vitest';
import { declarationsOf, read } from './css-test-helpers';

const popover = read('dist', 'components', 'popover.css');
const tooltip = read('dist', 'components', 'tooltip.css');
const select = read('dist', 'components', 'select.css');
const dialog = read('dist', 'components', 'dialog.css');
const tokensCss = read('dist', 'tokens.css');

describe.each([
  ['popover', popover],
  ['tooltip', tooltip],
])('%s arrow', (name, css) => {
  it('sizes and fills the triangle from tokens', () => {
    const rule = declarationsOf(css, `.cck-${name}__arrow svg`) ?? '';
    for (const line of [
      'display: block',
      `inline-size: var(--cck-${name}-arrow-width)`,
      `block-size: var(--cck-${name}-arrow-height)`,
      `fill: var(--cck-${name}-arrow-bg)`,
    ]) {
      expect(rule).toContain(line);
    }
  });

  it('restates [hidden] and leaves the placement to the positioning module', () => {
    expect(css).toMatch(new RegExp(String.raw`\.cck-${name}__arrow\[hidden\]\s*\{\s*display: none`));
    const rule = declarationsOf(css, `.cck-${name}__arrow`) ?? '';
    expect(rule).not.toMatch(/(^|[\s;])(position|inset|top|left|right|bottom|transform|display|visibility)\s*:/);
  });

  it('is CanvasText in forced colors', () => {
    const forced = css.split('@media (forced-colors: active)')[1] ?? '';
    expect(forced).toMatch(new RegExp(String.raw`\.cck-${name}__arrow svg\s*\{\s*fill: CanvasText`));
  });

  it('emits its tokens on the content class', () => {
    for (const token of ['arrow-bg', 'arrow-width', 'arrow-height']) {
      expect(tokensCss).toContain(`--cck-${name}-${token}:`);
    }
  });
});

describe('arrow fill', () => {
  it('is the content surface: the popover surface and the tooltip inverse surface', () => {
    expect(tokensCss).toMatch(/--cck-popover-arrow-bg: var\(--cck-surface-1\)/);
    expect(tokensCss).toMatch(/--cck-tooltip-arrow-bg: var\(--cck-text-1\)/);
  });
});

describe('popover content holding an arrow', () => {
  it('does not clip it', () => {
    const rule = declarationsOf(popover, '.cck-popover__content:has(> .cck-popover__arrow)') ?? '';
    expect(rule).toContain('overflow: visible');
  });
});

describe('transform origin', () => {
  it.each([
    ['popover', popover],
    ['tooltip', tooltip],
    ['select', select],
  ])('%s content grows from the anchor', (name, css) => {
    expect(declarationsOf(css, `.cck-${name}__content`) ?? '').toContain('transform-origin: var(--transform-origin)');
  });

  it('keeps motion inside the reduced-motion query', () => {
    for (const css of [popover, tooltip, select]) {
      expect(css.split('@media (prefers-reduced-motion: no-preference)')[0]).not.toMatch(/animation:/);
    }
  });
});

describe('non-modal dialog', () => {
  it('is centred in the viewport without a backdrop', () => {
    const rule = declarationsOf(dialog, '.cck-dialog__content[open]:not(:modal)') ?? '';
    for (const line of ['position: fixed', 'inset: 0', 'margin: auto', 'block-size: fit-content']) {
      expect(rule).toContain(line);
    }
  });

  it('leaves the modal dialog to the user agent', () => {
    expect(declarationsOf(dialog, '.cck-dialog__content') ?? '').not.toMatch(/(^|[\s;])(position|inset|margin)\s*:/);
  });
});
