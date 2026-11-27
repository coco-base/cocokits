// @vitest-environment node
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '@cocokits/vue-core';
import { Button } from '../index';
import { testThemeConfig, view } from './fixtures';

function tagOf(html: string, tag: string, text: string): string {
  // The slot is a fragment, so its content sits between the `<!--[-->` and `<!--]-->` anchors.
  return new RegExp(`<${tag}[^>]*>(?:<!--\\[-->)?${text}(?:<!--\\]-->)?</${tag}>`).exec(html)?.[0] ?? '';
}

describe('Button on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('renders the class, type and theme data-* in the markup, and no data-disabled when disabled is absent', async () => {
    const html = await renderToString(
      createSSRApp(
        view(() =>
          h(ThemeProvider, { themeConfig: testThemeConfig }, () => [
            h(Button, null, () => 'Save'),
            h(Button, { disabled: true }, () => 'Off'),
          ]),
        ),
      ),
    );
    const on = tagOf(html, 'button', 'Save');
    expect(on).toContain('class="cck-button"');
    expect(on).toContain('type="button"');
    expect(on).toContain('data-variant="primary"');
    expect(on).toContain('data-cck-color="brand"');
    expect(on).toContain('data-size="md"');
    expect(on).not.toContain('disabled');

    const off = tagOf(html, 'button', 'Off');
    expect(off).toMatch(/ disabled[ >]/);
    expect(off).toMatch(/ data-disabled[ >]/);
  });

  it('renders the links without type, and the disabled one with its markers', async () => {
    const html = await renderToString(
      createSSRApp(
        view(() =>
          h('div', [
            h(Button, { as: 'a', href: '#go' }, () => 'Go'),
            h(Button, { asChild: true, disabled: true }, () => h('a', { href: '#go' }, 'Off')),
          ]),
        ),
      ),
    );
    const link = tagOf(html, 'a', 'Go');
    expect(link).toContain('class="cck-button"');
    expect(link).not.toContain('type=');
    expect(link).not.toContain('aria-disabled');
    expect(link).not.toContain('data-disabled');

    const off = tagOf(html, 'a', 'Off');
    expect(off).toContain('aria-disabled="true"');
    expect(off).toContain('tabindex="-1"');
    expect(off).toMatch(/ data-disabled[ >]/);
    expect(off).toContain('href="#go"');
    expect(off).not.toContain('type=');
    expect(off).not.toContain('data-variant');
  });

  it('imports the entry points in plain Node without touching window or document', () => {
    // The static imports above ran in this Node environment: they would have thrown on `window`.
    expect(Button).toBeDefined();
    expect(ThemeProvider).toBeDefined();
  });
});
