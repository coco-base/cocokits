// @vitest-environment node
import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '@cocokits/react-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { Accordion } from '../src/index';

const html = (ui: ReactElement): string =>
  renderToString(<ThemeProvider themeConfig={cocokitsThemeConfig}>{ui}</ThemeProvider>);

describe('theme accordion on the server', () => {
  it('has no window or document, so the import and render prove no DOM access', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('renders the options on the root and the open item open, with no size variable', () => {
    const markup = html(
      <Accordion.Root
        type="single"
        defaultValue="shipping"
        variant="group"
        size="sm"
        togglePosition="before"
        hideToggle
      >
        <Accordion.Item value="shipping">
          <Accordion.Header>
            <Accordion.Trigger>Shipping</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>Orders leave in two days.</Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>,
    );
    const root = /<div[^>]*cck-accordion"[^>]*>/.exec(markup)?.[0] ?? '';
    for (const part of [
      'data-variant="group"',
      'data-size="sm"',
      'data-toggle-position="before"',
      'data-hide-toggle=""',
    ]) {
      expect(root).toContain(part);
    }
    expect(markup).toContain('aria-expanded="true"');
    expect(markup).not.toContain('--accordion-content');
    expect(markup).not.toMatch(/cck-accordion__item"[^>]*data-variant/);
  });
});
