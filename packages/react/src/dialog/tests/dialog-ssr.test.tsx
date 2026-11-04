// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Example } from './fixtures';

describe('Dialog on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('renders the closed trigger with its class and ARIA, and no content', () => {
    const html = renderToString(<Example />);
    expect(html).toContain('class="cck-dialog__trigger"');
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('data-state="closed"');
    expect(html).not.toContain('aria-controls');
    expect(html).not.toContain('role="dialog"');
    expect(html).not.toContain('cck-dialog__content');
    expect(html).not.toContain('popover=');
    expect(html).not.toContain('<dialog');
  });

  it('renders an open-by-default dialog closed: the trigger says expanded, but nothing points at missing content', () => {
    const html = renderToString(<Example defaultOpen />);
    expect(html).toContain('aria-expanded="true"');
    expect(html).not.toContain('aria-controls');
    expect(html).not.toContain('role="dialog"');
    expect(html).not.toContain('cck-dialog__close');
  });
});
