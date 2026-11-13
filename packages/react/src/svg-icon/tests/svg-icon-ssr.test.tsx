// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { checkIcon, heartIcon } from '@cocokits/icons';
import { IconProvider } from '@cocokits/react-core';
import { SvgIcon } from '../index';
import { svgOf, themed } from '../../internal/tests/icon-fixtures';

describe('SvgIcon on the server', () => {
  it('has no window or document, so the import and render prove no DOM access', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('has the whole icon of an eager name in the server HTML', () => {
    const html = renderToString(themed(<SvgIcon iconName="heart" />));
    expect(html).toContain('class="cck-svg-icon"');
    expect(html).toContain('data-icon="heart"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('class="cck-svg-icon__svg"');
    expect(html).toContain(`viewBox="${heartIcon.viewBox}"`);
    expect(html).toContain('focusable="false"');
    expect(html).toContain(heartIcon.body);
  });

  it('has the label as role and name', () => {
    const html = renderToString(themed(<SvgIcon iconName="heart" label="Favourite" />));
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Favourite"');
    expect(html).not.toContain('<span class="cck-svg-icon" aria-hidden');
  });

  it('has an empty svg for a name that is not registered', () => {
    const html = renderToString(themed(<SvgIcon iconName="nope" />));
    expect(html).toContain('data-icon="nope"');
    expect(html).not.toContain('<path');
    expect(html).not.toContain('viewBox');
  });

  it('has an empty svg for a lazy icon and for an svg string', () => {
    const lazy = renderToString(
      <IconProvider lazyIcons={{ later: () => Promise.resolve(heartIcon) }}>
        <SvgIcon iconName="later" />
      </IconProvider>,
    );
    expect(lazy).not.toContain('<path');
    expect(renderToString(<SvgIcon svg={svgOf(checkIcon)} />)).not.toContain('<path');
  });

  it('keeps the icons of two renders apart', () => {
    const first = renderToString(
      <IconProvider icons={{ mine: heartIcon }}>
        <SvgIcon iconName="mine" />
      </IconProvider>,
    );
    const second = renderToString(
      <IconProvider icons={{ mine: checkIcon }}>
        <SvgIcon iconName="mine" />
      </IconProvider>,
    );
    expect(first).toContain(heartIcon.body);
    expect(first).not.toContain(checkIcon.body);
    expect(second).toContain(checkIcon.body);
    expect(second).not.toContain(heartIcon.body);
  });
});
