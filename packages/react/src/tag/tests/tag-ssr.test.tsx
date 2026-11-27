// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '@cocokits/react-core';
import { Tag } from '../index';
import { testThemeConfig } from './fixtures';

describe('Tag on the server', () => {
  it('imports in plain Node without window or document', () => {
    // The static imports above ran in this Node environment: they would have thrown on `window`.
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
    expect(typeof Tag).toBe('function');
  });

  it('renders the span with the class and its children', () => {
    expect(renderToString(<Tag>Paid</Tag>)).toBe('<span class="cck-tag">Paid</span>');
  });

  it('renders the theme options into the markup, with no inline style', () => {
    const html = renderToString(
      <ThemeProvider themeConfig={testThemeConfig}>
        <Tag>Paid</Tag>
      </ThemeProvider>,
    );
    expect(html).toContain('class="cck-tag"');
    expect(html).toContain('data-variant="soft"');
    expect(html).toContain('data-cck-color="neutral"');
    expect(html).toContain('data-size="md"');
    expect(html).not.toContain('data-dot');
    expect(html).not.toContain('style=');
  });
});
