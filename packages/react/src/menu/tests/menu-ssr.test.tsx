// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Example } from './fixtures';

describe('Menu on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('renders the closed trigger with its class and ARIA, and no content', () => {
    const html = renderToString(<Example />);
    expect(html).toContain('class="cck-menu__trigger"');
    expect(html).toContain('aria-haspopup="menu"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('data-state="closed"');
    expect(html).toContain('type="button"');
    expect(html).not.toContain('aria-controls');
    expect(html).not.toContain('role="menu"');
    expect(html).not.toContain('cck-menu__content');
    expect(html).not.toContain('cck-menu__item');
  });

  it('renders an open-by-default menu closed: the trigger says expanded, but nothing points at missing content', () => {
    const html = renderToString(<Example root={{ defaultOpen: true }} />);
    expect(html).toContain('aria-expanded="true"');
    expect(html).not.toContain('aria-controls');
    expect(html).not.toContain('role="menu"');
    expect(html).not.toContain('menuitem');
  });

  it('renders a controlled open menu closed as well', () => {
    const html = renderToString(<Example root={{ open: true }} />);
    expect(html).not.toContain('role="menu"');
  });
});
