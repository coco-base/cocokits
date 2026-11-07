// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { Tabs } from '../src/index';
import { html } from './helpers';

describe('theme tabs on the server', () => {
  it('has no window or document, so the import and render prove no DOM access', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('renders the options on the root and the indicator without geometry', () => {
    const markup = html(
      <Tabs.Root defaultValue="account" variant="line" color="brand" size="lg" headerAlign="stretch">
        <Tabs.List aria-label="Account settings">
          <Tabs.Trigger value="account">Account</Tabs.Trigger>
          <Tabs.Indicator />
        </Tabs.List>
        <Tabs.Content value="account">Change your name.</Tabs.Content>
      </Tabs.Root>,
    );
    const root = /<div[^>]*cck-tabs"[^>]*>/.exec(markup)?.[0] ?? '';
    for (const part of [
      'data-variant="line"',
      'data-cck-color="brand"',
      'data-size="lg"',
      'data-header-align="stretch"',
    ]) {
      expect(root).toContain(part);
    }
    const indicator = /<span[^>]*cck-tabs__indicator[^>]*>/.exec(markup)?.[0] ?? '';
    expect(indicator).not.toBe('');
    expect(indicator).not.toContain('--active-tab');
    expect(indicator).not.toContain('data-variant');
    expect(markup).toContain('aria-selected="true"');
  });
});
