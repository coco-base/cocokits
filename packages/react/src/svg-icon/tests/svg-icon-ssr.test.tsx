// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SvgIcon } from '../index';
import { themed } from '../../internal/tests/icon-fixtures';

describe('SvgIcon on the server', () => {
  it('has no window or document, so the import and render prove no DOM access', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('has the whole icon in the server HTML', () => {
    const html = renderToString(themed(<SvgIcon iconName="star" />));
    expect(html).toContain('class="cck-svg-icon"');
    expect(html).toContain('data-icon-name="star"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('viewBox="0 0 24 24"');
    expect(html).toMatch(/<path d="M12 2l3 7h7l-5 5 2 8-7-4-7 4 2-8-5-5h7z" fill-rule="evenodd" clip-rule="nonzero">/);
  });

  it('has the label as role and name', () => {
    const html = renderToString(themed(<SvgIcon iconName="star" label="Favourite" />));
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Favourite"');
    expect(html).not.toContain('aria-hidden');
  });

  it('has no element from path data that holds markup', () => {
    const html = renderToString(themed(<SvgIcon iconName="evil" />));
    expect(html).not.toContain('<script');
  });

  it('renders an empty svg for a name the theme lacks', () => {
    const html = renderToString(themed(<SvgIcon iconName="nope" />));
    expect(html).toContain('data-icon-name="nope"');
    expect(html).not.toContain('<path');
    expect(html).not.toContain('viewBox');
  });
});
