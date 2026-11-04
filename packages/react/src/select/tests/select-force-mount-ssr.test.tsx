// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Dishes, Opt } from './fixtures';

describe('Select forceMount on the server', () => {
  it('renders a force-mounted closed Select without the list, as for every overlay', () => {
    const html = renderToString(
      <Dishes contentProps={{ forceMount: true }}>
        <Opt value="Cake">Cake</Opt>
      </Dishes>,
    );
    expect(html).toContain('role="combobox"');
    expect(html).not.toContain('role="listbox"');
    expect(html).not.toContain('role="option"');
    expect(html).not.toContain('aria-controls');
  });
});
