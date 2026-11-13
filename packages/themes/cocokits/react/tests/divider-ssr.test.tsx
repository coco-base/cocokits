// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '@cocokits/react-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { Divider } from '../src/index';

describe('theme Divider on the server', () => {
  it('renders the class and the theme data-* with no window or document', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
    const html = renderToString(
      <ThemeProvider themeConfig={cocokitsThemeConfig}>
        <Divider size="lg" color="dark" orientation="vertical" />
        <Divider />
      </ThemeProvider>,
    );
    const [first = '', second = ''] = html.match(/<hr[^>]*>/g) ?? [];
    expect(first).toContain('class="cck-divider"');
    expect(first).toContain('data-orientation="vertical"');
    expect(first).toContain('data-size="lg"');
    expect(first).toContain('data-color="dark"');
    expect(second).toContain('data-size="md"');
    expect(second).toContain('data-color="default"');
  });
});
