// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { renderOnServer } from './fixtures';

describe('Button on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
  });

  it('renders the class, type and theme data-* in the markup', async () => {
    const html = await renderOnServer();

    const button = /<button[^>]*>Save<\/button>/.exec(html)?.[0] ?? '';
    expect(button).toContain('class="cck-button"');
    expect(button).toContain('type="button"');
    expect(button).toContain('data-variant="primary"');
    expect(button).toContain('data-cck-color="brand"');
    expect(button).toContain('data-size="lg"');
    expect(button).not.toContain('disabled');

    const off = /<button[^>]*>Off<\/button>/.exec(html)?.[0] ?? '';
    expect(off).toContain('disabled');
    expect(off).toContain('data-disabled=""');
  });

  it('renders the links without type and the disabled one with its markers', async () => {
    const html = await renderOnServer();

    const link = /<a[^>]*>Go<\/a>/.exec(html)?.[0] ?? '';
    expect(link).toContain('class="cck-button"');
    expect(link).toContain('data-cck-color="danger"');
    expect(link).not.toContain('type=');
    expect(link).not.toContain('aria-disabled');

    const off = /<a[^>]*>Off<\/a>/.exec(html)?.[0] ?? '';
    expect(off).toContain('aria-disabled="true"');
    expect(off).toContain('tabindex="-1"');
    expect(off).toContain('data-disabled=""');
    expect(off).toContain('href="#go"');
    expect(off).not.toContain('type=');
  });
});
