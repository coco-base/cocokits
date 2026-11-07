// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Popover } from '../index';
import { Example } from './fixtures';

describe('Popover on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('renders the closed trigger with its class and ARIA, and no content', () => {
    const html = renderToString(<Example />);
    expect(html).toContain('class="cck-popover__trigger"');
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('data-state="closed"');
    expect(html).not.toContain('aria-controls');
    expect(html).not.toContain('role="dialog"');
    expect(html).not.toContain('cck-popover__content');
    expect(html).not.toContain('popover=');
  });

  it('renders an open-by-default popover closed: the trigger says expanded, but nothing points at missing content', () => {
    const html = renderToString(<Example defaultOpen />);
    expect(html).toContain('aria-expanded="true"');
    expect(html).not.toContain('aria-controls');
    expect(html).not.toContain('role="dialog"');
    expect(html).not.toContain('cck-popover__close');
  });

  it('renders the anchor on the server with its class and no ARIA, around a closed trigger', () => {
    const html = renderToString(
      <Popover.Root>
        <Popover.Anchor>
          <Popover.Trigger>Share</Popover.Trigger>
        </Popover.Anchor>
        <Popover.Content>
          <Popover.Title>Share</Popover.Title>
        </Popover.Content>
      </Popover.Root>,
    );
    expect(html).toContain('<div class="cck-popover__anchor">');
    expect(html).toContain('class="cck-popover__trigger"');
    expect(html).not.toContain('cck-popover__title');
    expect(html).not.toContain('role="dialog"');
  });

  it('renders a virtual anchor as nothing', () => {
    const html = renderToString(
      <Popover.Root>
        <Popover.Anchor virtualRef={{ current: null }} />
        <Popover.Trigger>Share</Popover.Trigger>
      </Popover.Root>,
    );
    expect(html).not.toContain('cck-popover__anchor');
  });
});
