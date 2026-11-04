// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/vue';
import { h } from 'vue';
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

describe('Tooltip trigger id', () => {
  it('keeps the id the author wrote and still links the trigger to the content', async () => {
    mountView(() => [
      h(TooltipRoot, { open: true }, () => [
        h(TooltipTrigger, { id: 'mine', 'aria-label': 'Copy link' }, () => 'Copy'),
        h(TooltipContent, () => 'Text'),
      ]),
    ]);
    await settle();
    const trigger = screen.getByRole('button', { name: 'Copy link' });
    const content = shownContent();
    expect(trigger.id).toBe('mine');
    expect(trigger.getAttribute('aria-describedby')).toBe(tooltipDescription()?.id);
    expect(content.id).not.toBe(tooltipDescription()?.id);
    expect(content.id).not.toBe('');
  });
});
