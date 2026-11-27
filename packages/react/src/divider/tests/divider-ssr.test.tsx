// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Divider } from '../index';

describe('Divider on the server', () => {
  it('imports in plain Node without window or document', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
    expect(typeof Divider).toBe('function');
  });

  it('renders the hr with the class and data-orientation', () => {
    expect(renderToString(<Divider />)).toBe('<hr class="cck-divider" data-orientation="horizontal"/>');
  });

  it('renders vertical and decorative markup', () => {
    const vertical = renderToString(<Divider orientation="vertical" />);
    expect(vertical).toContain('data-orientation="vertical"');
    expect(vertical).toContain('aria-orientation="vertical"');
    const decorative = renderToString(<Divider orientation="vertical" decorative />);
    expect(decorative).toContain('role="none"');
    expect(decorative).not.toContain('aria-orientation');
  });
});
