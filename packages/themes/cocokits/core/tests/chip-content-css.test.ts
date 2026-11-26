import { describe, expect, it } from 'vitest';
import { declarationsOf, read, ref, sizeTokenOf } from './css-test-helpers';

const css = read('dist', 'components', 'chip.css');
const MODES = ['sm', 'md', 'lg'] as const;
const content = '.cck-chip__content-wrapper';

describe('chip content with an Avatar, an SvgIcon or a Badge', () => {
  it('lays the content out in a row, the chip gap apart and centred, and keeps a plain label a block', () => {
    const row = declarationsOf(css, `${content}:where(:has(> .cck-avatar, > .cck-svg-icon, > .cck-badge))`) ?? '';
    for (const line of ['display: flex', 'align-items: center', 'gap: var(--cck-chip-gap)'])
      expect(row).toContain(line);
    expect(declarationsOf(css, content)).toContain('display: block');
    expect(declarationsOf(css, `${content}[hidden]`)).toContain('display: none');
  });

  it('gives an SvgIcon without its own size the icon size of the chip', () => {
    expect(declarationsOf(css, `${content} > .cck-svg-icon:not([data-size])`)).toContain(
      'font-size: var(--cck-chip-icon-size)',
    );
  });

  it.each([
    ['avatar', 'avatar', ['spacing-1', 'spacing-1', 'spacing-2']],
    ['svg-icon', 'icon', ['spacing-3', 'spacing-3', 'spacing-4']],
  ])('moves a leading %s closer to the start edge, per size', (part, token, steps) => {
    const rule = declarationsOf(css, `.cck-chip:where(:has(> ${content} > .cck-${part}))`);
    expect(rule).toContain(`padding-inline-start: var(--cck-chip-${token}-padding-inline-start)`);
    MODES.forEach((mode, index) => {
      expect(sizeTokenOf('.cck-chip', mode, `chip-${token}-padding-inline-start`), mode).toBe(ref(steps[index]));
    });
  });

  it('lets the padding of a checked check win: the leading rules are in :where(), the check rule is not', () => {
    expect(declarationsOf(css, '.cck-chip:has(> .cck-chip__check[data-state=checked])')).toContain(
      'padding-inline-start: var(--cck-chip-check-padding-inline-start)',
    );
  });
});
