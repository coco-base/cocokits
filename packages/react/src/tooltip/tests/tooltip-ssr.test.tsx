// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Example } from './fixtures';

describe('Tooltip on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('renders the closed trigger with its class, and no content and no aria-describedby', () => {
    const html = renderToString(<Example />);
    expect(html).toContain('class="cck-tooltip__trigger"');
    expect(html).toContain('data-state="closed"');
    expect(html).toContain('aria-label="Copy link"');
    expect(html).not.toContain('aria-describedby');
    expect(html).not.toContain('role="tooltip"');
    expect(html).not.toContain('cck-tooltip__content');
    expect(html).not.toContain('popover=');
  });

  it('renders an open-by-default tooltip closed: nothing points at missing content', () => {
    const html = renderToString(<Example defaultOpen />);
    expect(html).toContain('data-state="open"');
    expect(html).not.toContain('aria-describedby');
    expect(html).not.toContain('role="tooltip"');
    expect(html).not.toContain('Copy the link');
  });
});

describe('Tooltip.Provider and the description on the server', () => {
  it('renders the Provider without an element and the tooltip without a description', async () => {
    const { Tooltip } = await import('../index');
    const html = renderToString(
      <Tooltip.Provider>
        <Tooltip.Root>
          <Tooltip.Trigger aria-label="Copy link">Copy</Tooltip.Trigger>
          <Tooltip.Content>Copy the link</Tooltip.Content>
        </Tooltip.Root>
      </Tooltip.Provider>,
    );
    expect(html.startsWith('<button')).toBe(true);
    expect(html).not.toContain('-description');
    expect(html).not.toContain('aria-describedby');
    expect(html).not.toContain('role="tooltip"');
  });
});
