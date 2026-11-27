// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SvgIcon } from '../../svg-icon';
import { themed } from '../../internal/tests/icon-fixtures';
import { IconButton } from '../index';

describe('IconButton on the server', () => {
  it('has no window or document, so the import and render prove no DOM access', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('renders the class, type, disabled markers and the icon', () => {
    const html = renderToString(
      themed(
        <>
          <IconButton aria-label="Add">
            <SvgIcon iconName="heart" />
          </IconButton>
          <IconButton aria-label="Off" disabled />
        </>,
      ),
    );
    const on = /<button[^>]*aria-label="Add"[^>]*>/.exec(html)?.[0] ?? '';
    expect(on).toContain('class="cck-icon-button"');
    expect(on).toContain('type="button"');
    expect(on).not.toContain('disabled');
    expect(html).toContain('data-icon="heart"');
    const off = /<button[^>]*aria-label="Off"[^>]*>/.exec(html)?.[0] ?? '';
    expect(off).toContain('disabled=""');
    expect(off).toContain('data-disabled=""');
  });

  it('renders a disabled link with its markers and no type', () => {
    const html = renderToString(<IconButton aria-label="Go" nativeButton={false} disabled render={<a href="#go" />} />);
    expect(html).toContain('class="cck-icon-button"');
    expect(html).toContain('aria-disabled="true"');
    expect(html).toContain('tabindex="-1"');
    expect(html).not.toContain('type=');
  });
});
