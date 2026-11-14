// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { checkIcon, heartIcon } from '@cocokits/icons';
import { IconProvider, useIconRegistry } from '../src/index';

function Draw({ name }: { readonly name: string }): React.ReactElement {
  return <i data-body={useIconRegistry().get(name)?.body ?? ''} />;
}

const page = (icon: typeof heartIcon): string =>
  renderToString(
    <IconProvider icons={{ mine: icon }}>
      <Draw name="mine" />
    </IconProvider>,
  );

describe('icon registry on the server', () => {
  it('has no window or document', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('keeps the icons of two renders in one process apart', () => {
    const first = page(heartIcon);
    const second = page(checkIcon);
    const escaped = (body: string): string =>
      body.replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
    expect(first).toContain(escaped(heartIcon.body).slice(0, 40));
    expect(second).toContain(escaped(checkIcon.body).slice(0, 40));
    expect(first).not.toBe(second);
    // The next render without a provider sees no icon of either request.
    expect(renderToString(<Draw name="mine" />)).toContain('data-body=""');
  });

  it('shows only the base icons without a provider, and a register call writes nothing', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    function Register(): null {
      useIconRegistry().registerIcons({ leak: heartIcon });
      return null;
    }
    renderToString(<Register />);
    expect(error).toHaveBeenCalledTimes(1);
    expect(renderToString(<Draw name="leak" />)).toContain('data-body=""');
    expect(renderToString(<Draw name="check" />)).not.toContain('data-body=""');
    error.mockRestore();
  });
});
