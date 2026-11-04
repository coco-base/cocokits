// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '@cocokits/react-core';
import { Button } from '../index';
import { testThemeConfig } from './fixtures';

function tagOf(html: string, tag: string, text: string): string {
  return new RegExp(`<${tag}[^>]*>${text}</${tag}>`).exec(html)?.[0] ?? '';
}

describe('Button on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('renders the class, type and theme data-* in the markup', () => {
    const html = renderToString(
      <ThemeProvider themeConfig={testThemeConfig}>
        <Button>Save</Button>
        <Button disabled>Off</Button>
      </ThemeProvider>,
    );
    const on = tagOf(html, 'button', 'Save');
    expect(on).toContain('class="cck-button"');
    expect(on).toContain('type="button"');
    expect(on).toContain('data-variant="primary"');
    expect(on).toContain('data-cck-color="brand"');
    expect(on).toContain('data-size="md"');
    expect(on).not.toContain('disabled');

    const off = tagOf(html, 'button', 'Off');
    expect(off).toContain('disabled=""');
    expect(off).toContain('data-disabled=""');
  });

  it('renders the links without type, and the disabled one with its markers', () => {
    const html = renderToString(
      <>
        <Button nativeButton={false} render={<a href="#go" />}>
          Go
        </Button>
        <Button nativeButton={false} disabled render={<a href="#go" />}>
          Off
        </Button>
      </>,
    );
    const link = tagOf(html, 'a', 'Go');
    expect(link).toContain('class="cck-button"');
    expect(link).not.toContain('type=');
    expect(link).not.toContain('aria-disabled');

    const off = tagOf(html, 'a', 'Off');
    expect(off).toContain('aria-disabled="true"');
    expect(off).toContain('tabindex="-1"');
    expect(off).toContain('data-disabled=""');
    expect(off).toContain('href="#go"');
    expect(off).not.toContain('type=');
    expect(off).not.toContain('data-variant');
  });

  it('imports the entry points in plain Node without touching window or document', () => {
    // The static imports above ran in this Node environment: they would have thrown on `window`.
    expect(typeof Button).toBe('function');
    expect(typeof ThemeProvider).toBe('function');
  });
});
