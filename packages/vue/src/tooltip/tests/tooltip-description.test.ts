// @vitest-environment jsdom
import { cleanup } from '@testing-library/vue';
import { h, nextTick, ref } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TooltipContent, TooltipRoot, TooltipTrigger } from '../index';
import {
  accessibleDescription,
  elementById,
  mountView,
  settle,
  stubOverlayBrowser,
  tooltipContent,
  tooltipDescription,
} from './fixtures';

beforeEach(() => {
  stubOverlayBrowser();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const trigger = (): HTMLElement => elementById('trigger');

function view(options: {
  label?: () => string | undefined;
  rootProps?: () => Record<string, unknown>;
  contentProps?: () => Record<string, unknown>;
  content?: () => unknown;
}) {
  return () =>
    h(TooltipRoot, options.rootProps?.() ?? {}, () => [
      h(TooltipTrigger, { id: 'trigger', 'aria-label': options.label?.() }, () => 'Copy'),
      h(TooltipContent, options.contentProps?.() ?? {}, options.content ?? (() => 'Copy the link')),
    ]);
}

describe('Tooltip description', () => {
  it('describes the trigger by a text slot while the tooltip is closed', async () => {
    mountView(view({ label: () => 'Copy link' }));
    await settle();
    expect(tooltipContent()).toBeNull();
    expect(tooltipDescription()?.getAttribute('role')).toBe('tooltip');
    expect(accessibleDescription(trigger())).toBe('Copy the link');
  });

  it('prefers ariaLabel over the slot and does not put it on the visible content', async () => {
    mountView(
      view({
        label: () => 'Copy link',
        rootProps: () => ({ open: true }),
        contentProps: () => ({ ariaLabel: 'Copies the link to the clipboard' }),
      }),
    );
    await settle();
    expect(accessibleDescription(trigger())).toBe('Copies the link to the clipboard');
    expect(tooltipContent()?.hasAttribute('aria-label')).toBe(false);
    expect(tooltipContent()?.getAttribute('aria-hidden')).toBe('true');
  });

  it('takes an interpolated number as text', async () => {
    mountView(view({ label: () => 'Count', content: () => [3, ' items'] }));
    await settle();
    expect(accessibleDescription(trigger())).toBe('3 items');
  });

  it('has no description for rich content, which describes the trigger while mounted', async () => {
    mountView(
      view({
        label: () => 'Copy link',
        rootProps: () => ({ open: true }),
        content: () => h('strong', 'Copy'),
      }),
    );
    await settle();
    expect(tooltipDescription()).toBeNull();
    expect(trigger().getAttribute('aria-describedby')).toBe(tooltipContent()?.id);
    expect(tooltipContent()?.hasAttribute('aria-hidden')).toBe(false);
  });

  it('is suppressed when the text equals the trigger label', async () => {
    mountView(view({ label: () => 'Copy the link', rootProps: () => ({ open: true }) }));
    await settle();
    expect(tooltipDescription()).toBeNull();
    expect(trigger().hasAttribute('aria-describedby')).toBe(false);
    expect(tooltipContent()?.getAttribute('aria-hidden')).toBe('true');
  });

  it('follows the text and the label', async () => {
    const text = ref('One');
    const label = ref<string | undefined>('Label');
    mountView(view({ label: () => label.value, content: () => text.value }));
    await settle();
    expect(tooltipDescription()?.textContent).toBe('One');
    text.value = 'Two';
    await settle();
    expect(tooltipDescription()?.textContent).toBe('Two');
    label.value = 'Two';
    await settle();
    expect(tooltipDescription()).toBeNull();
    label.value = 'Other';
    await settle();
    expect(tooltipDescription()?.textContent).toBe('Two');
    text.value = '';
    await settle();
    expect(tooltipDescription()).toBeNull();
    expect(trigger().hasAttribute('aria-describedby')).toBe(false);
  });

  it('removes the description while disabled and when it unmounts', async () => {
    const disabled = ref(false);
    const shown = ref(true);
    mountView(() =>
      shown.value ? [view({ label: () => 'Label', rootProps: () => ({ disabled: disabled.value }) })()] : [],
    );
    await settle();
    expect(tooltipDescription()).not.toBeNull();
    disabled.value = true;
    await settle();
    expect(tooltipDescription()).toBeNull();
    disabled.value = false;
    await settle();
    expect(tooltipDescription()).not.toBeNull();
    shown.value = false;
    await nextTick();
    await settle();
    expect(tooltipDescription()).toBeNull();
  });

  it('keeps the author descriptions in front of the tooltip description', async () => {
    mountView(() =>
      h(TooltipRoot, null, () => [
        h(TooltipTrigger, { id: 'trigger', 'aria-label': 'Label', 'aria-describedby': 'mine' }, () => 'Copy'),
        h(TooltipContent, null, () => 'Text'),
      ]),
    );
    await settle();
    expect(trigger().getAttribute('aria-describedby')).toBe(`mine ${tooltipDescription()?.id ?? ''}`);
  });
});
