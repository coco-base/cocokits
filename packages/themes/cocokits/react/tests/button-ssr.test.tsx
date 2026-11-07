// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '@cocokits/react-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { Button } from '../src/index';

describe('theme Button on the server', () => {
  it('has no window or document, so the import and render prove no DOM access', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('renders the class, type, disabled markers and theme data-*', () => {
    const html = renderToString(
      <ThemeProvider themeConfig={cocokitsThemeConfig}>
        <Button variant="outline" color="danger" size="lg">
          Save
        </Button>
        <Button disabled>Off</Button>
      </ThemeProvider>,
    );
    const on = /<button[^>]*>Save<\/button>/.exec(html)?.[0] ?? '';
    expect(on).toContain('class="cck-button"');
    expect(on).toContain('type="button"');
    expect(on).toContain('data-variant="outline"');
    expect(on).toContain('data-cck-color="danger"');
    expect(on).toContain('data-size="lg"');
    const off = /<button[^>]*>Off<\/button>/.exec(html)?.[0] ?? '';
    expect(off).toContain('disabled=""');
    expect(off).toContain('data-disabled=""');
    expect(off).toContain('data-variant="primary"');
  });
});
