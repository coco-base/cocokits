// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/vue';
import { h, ref, type VNode } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PopoverContent, PopoverDescription, PopoverRoot, PopoverTitle, PopoverTrigger } from '../index';
import { mountView, settle, stubOverlayBrowser } from './fixtures';

beforeEach(stubOverlayBrowser);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

function view(inner: () => VNode | VNode[] | string): () => VNode[] {
  return () => [
    h(PopoverRoot, { open: true }, () => [h(PopoverTrigger, null, () => 'Share'), h(PopoverContent, null, inner)]),
  ];
}

describe('PopoverTitle and PopoverDescription', () => {
  it('render an h2 and a p with their classes and ids, and name and describe the content', async () => {
    mountView(view(() => [h(PopoverTitle, null, () => 'Share'), h(PopoverDescription, null, () => 'Anyone can view')]));
    await settle();
    const dialog = screen.getByRole('dialog');
    const title = screen.getByText('Share', { selector: 'h2' });
    const description = screen.getByText('Anyone can view');
    expect(description.tagName).toBe('P');
    expect(title.classList.contains('cck-popover__title')).toBe(true);
    expect(description.classList.contains('cck-popover__description')).toBe(true);
    expect(dialog.getAttribute('aria-labelledby')).toBe(title.id);
    expect(dialog.getAttribute('aria-describedby')).toBe(description.id);
  });

  it('take another element with as', async () => {
    mountView(view(() => h(PopoverTitle, { as: 'h3' }, () => 'Share')));
    await settle();
    expect(screen.getByText('Share', { selector: 'h3' })).not.toBeNull();
  });

  it('remove the attributes when they unmount', async () => {
    const shown = ref(true);
    mountView(
      view(() =>
        shown.value ? [h(PopoverTitle, null, () => 'Share'), h(PopoverDescription, null, () => 'text')] : 'x',
      ),
    );
    await settle();
    expect(screen.getByRole('dialog').hasAttribute('aria-labelledby')).toBe(true);
    shown.value = false;
    await settle();
    const dialog = screen.getByRole('dialog');
    expect(dialog.hasAttribute('aria-labelledby')).toBe(false);
    expect(dialog.hasAttribute('aria-describedby')).toBe(false);
  });
});

describe('Popover name warning', () => {
  it('does not warn for a content named by a title', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mountView(view(() => h(PopoverTitle, null, () => 'Share')));
    await settle();
    expect(warn).not.toHaveBeenCalled();
  });

  it('warns with the text that names the title for an unnamed content', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mountView(view(() => 'text'));
    await settle();
    expect(warn).toHaveBeenCalledWith(
      'CocoKits: <PopoverContent> has no accessible name. Add a <PopoverTitle>, or an aria-label or aria-labelledby.',
    );
  });
});
