// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { Accordion } from '../src/index';
import { html } from './helpers';

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
