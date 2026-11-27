// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen, waitFor } from '@testing-library/vue';
import { defineComponent, h } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TooltipContent, TooltipRoot, TooltipTrigger } from '../index';
import { shownContent, mountView, settle, stubOverlayBrowser, tooltipDescription } from './fixtures';

beforeEach(stubOverlayBrowser);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const Section = defineComponent({
  inheritAttrs: false,
  setup:
    (_props, { attrs, slots }) =>
    () =>
      h('section', attrs, slots.default?.()),
});

describe('Tooltip as', () => {
  it('renders a button with type="button" and a div content by default', async () => {
    mountView(() =>
      h(TooltipRoot, { open: true }, () => [
        h(TooltipTrigger, { 'data-testid': 'trigger' }, () => 'Copy'),
        h(TooltipContent, null, () => 'Tip'),
      ]),
    );
    await settle();
    expect(screen.getByTestId('trigger').localName).toBe('button');
    expect(screen.getByTestId('trigger').getAttribute('type')).toBe('button');
    expect(shownContent().localName).toBe('div');
  });

  it('gives a trigger that is not a button a tab stop and nothing else, and focus shows the tooltip', async () => {
    mountView(() => [
      h('button', 'before'),
      h(TooltipRoot, null, () => [
        h(TooltipTrigger, { as: 'span', 'data-testid': 'trigger' }, () => 'Copy'),
        h(TooltipContent, null, () => 'Tip'),
      ]),
    ]);
    const trigger = screen.getByTestId('trigger');
    expect(trigger.localName).toBe('span');
    expect(trigger.getAttribute('tabindex')).toBe('0');
    expect(trigger.hasAttribute('type')).toBe(false);
    expect(trigger.hasAttribute('role')).toBe(false);
    await userEvent.tab();
    await userEvent.tab();
    expect(document.activeElement).toBe(trigger);
    await waitFor(() => {
      expect(tooltipDescription()?.id).toBe(trigger.getAttribute('aria-describedby'));
    });
  });

  it('lets an author tabindex win over the default tab stop', () => {
    mountView(() =>
      h(TooltipRoot, null, () => [
        h(TooltipTrigger, { as: 'span', tabindex: '-1', 'data-testid': 'trigger' }, () => 'Copy'),
        h(TooltipContent, null, () => 'Tip'),
      ]),
    );
    expect(screen.getByTestId('trigger').getAttribute('tabindex')).toBe('-1');
  });

  it('renders a component given to as and another tag for the content', async () => {
    mountView(() =>
      h(TooltipRoot, { open: true }, () => [
        h(TooltipTrigger, { as: Section, 'data-testid': 'trigger' }, () => 'Copy'),
        h(TooltipContent, { as: 'p' }, () => 'Tip'),
      ]),
    );
    await settle();
    expect(screen.getByTestId('trigger').localName).toBe('section');
    expect(screen.getByTestId('trigger').hasAttribute('type')).toBe(false);
    expect(shownContent().localName).toBe('p');
  });
});
