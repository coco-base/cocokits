// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '@cocokits/react-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { Badge } from '../src/index';

describe('theme Badge on the server', () => {
  it('renders the class, the content and the theme data-* with no window or document', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
    const html = renderToString(
      <ThemeProvider themeConfig={cocokitsThemeConfig}>
        <Badge content={5} variant="rectangle" color="danger" size="lg" />
        <Badge />
      </ThemeProvider>,
    );
    const first = /<span[^>]*>/.exec(html)?.[0] ?? '';
    expect(first).toContain('class="cck-badge"');
    expect(first).toContain('data-variant="rectangle"');
    expect(first).toContain('data-cck-color="danger"');
    expect(first).toContain('data-size="lg"');
    expect(html).toContain('>5</span>');
    const dot = /<span[^>]*data-empty=""[^>]*>/.exec(html)?.[0] ?? '';
    expect(dot).toContain('data-cck-color="contrast"');
  });
});
