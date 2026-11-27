// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Popover } from '../index';

describe('Popover forceMount, arrow and modal on the server', () => {
  it('renders a force-mounted closed popover without the content, as for every overlay', () => {
    const html = renderToString(
      <Popover.Root>
        <Popover.Trigger>Share</Popover.Trigger>
        <Popover.Content aria-label="x" forceMount>
          <Popover.Arrow />
          text
        </Popover.Content>
      </Popover.Root>,
    );
    expect(html).toContain('class="cck-popover__trigger"');
    expect(html).not.toContain('aria-controls');
    expect(html).not.toContain('cck-popover__content');
    expect(html).not.toContain('cck-popover__arrow');
  });

  it('renders a modal popover closed, with no inert, no aria-modal and no content', () => {
    const html = renderToString(
      <Popover.Root modal defaultOpen>
        <Popover.Trigger>Share</Popover.Trigger>
        <Popover.Content aria-label="x">text</Popover.Content>
      </Popover.Root>,
    );
    expect(html).not.toContain('inert');
    expect(html).not.toContain('aria-modal');
    expect(html).not.toContain('role="dialog"');
  });
});
