// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Tooltip } from '../index';

describe('Tooltip forceMount and arrow on the server', () => {
  it('renders a force-mounted closed tooltip without the content, as for every overlay', () => {
    const html = renderToString(
      <Tooltip.Root>
        <Tooltip.Trigger aria-label="Copy link">Copy</Tooltip.Trigger>
        <Tooltip.Content forceMount>
          Copy the link
          <Tooltip.Arrow />
        </Tooltip.Content>
      </Tooltip.Root>,
    );
    expect(html).toContain('class="cck-tooltip__trigger"');
    expect(html).not.toContain('cck-tooltip__content');
    expect(html).not.toContain('cck-tooltip__arrow');
    expect(html).not.toContain('role="tooltip"');
  });
});
