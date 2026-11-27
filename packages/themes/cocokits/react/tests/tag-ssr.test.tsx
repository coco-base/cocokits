// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '@cocokits/react-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { Tag } from '../src/index';

describe('theme Tag on the server', () => {
  it('renders the class, the text and the theme data-* with no window or document', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
    const html = renderToString(
      <ThemeProvider themeConfig={cocokitsThemeConfig}>
        <Tag variant="solid" color="success" size="lg" dot>
          Paid
        </Tag>
        <Tag>Beta</Tag>
      </ThemeProvider>,
    );
    const [first = '', second = ''] = html.match(/<span[^>]*>/g) ?? [];
    expect(first).toContain('class="cck-tag"');
    expect(first).toContain('data-variant="solid"');
    expect(first).toContain('data-cck-color="success"');
    expect(first).toContain('data-size="lg"');
    expect(first).toContain('data-dot=""');
    expect(html).toContain('>Paid</span>');
    expect(second).toContain('data-variant="soft"');
    expect(second).not.toContain('data-dot');
  });
});
