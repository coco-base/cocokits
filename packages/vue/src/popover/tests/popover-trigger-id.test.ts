// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/vue';
import { h } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PopoverContent, PopoverRoot, PopoverTrigger } from '../index';
import { mountView, settle, stubOverlayBrowser } from './fixtures';

beforeEach(stubOverlayBrowser);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('Popover trigger id', () => {
  it('keeps the id the author wrote and still links the trigger to the content', async () => {
    mountView(() => [
      h(PopoverRoot, { open: true }, () => [
        h(PopoverTrigger, { id: 'mine' }, () => 'Share'),
        h(PopoverContent, { 'aria-label': 'Share link' }, () => 'Text'),
      ]),
    ]);
    await settle();
    const trigger = screen.getByRole('button', { name: 'Share' });
    const content = screen.getByRole('dialog');
    expect(trigger.id).toBe('mine');
    expect(trigger.getAttribute('aria-controls')).toBe(content.id);
    expect(content.id).not.toBe('');
  });
});
