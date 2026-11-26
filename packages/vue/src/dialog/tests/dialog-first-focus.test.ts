// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/vue';
import { h } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Radio } from '../../radio';
import { RadioGroup } from '../../radio-group';
import { DialogClose, DialogTitle } from '../index';
import { dialogView, mountView, open, settle, stubOverlayBrowser } from './fixtures';

beforeEach(stubOverlayBrowser);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('style');
});

/** A title, a RadioGroup with the second radio checked as the first control, and a Close. */
const planContent = () => [
  h(DialogTitle, null, () => 'Plan'),
  h(RadioGroup, { 'aria-label': 'Plan', defaultValue: 'pro' }, () => [
    h(Radio, { value: 'free' }, () => 'Free'),
    h(Radio, { value: 'pro' }, () => 'Pro'),
  ]),
  h(DialogClose, null, () => 'Cancel'),
];

describe('Dialog first focus', () => {
  it('focuses the checked radio of a group, not the first radio', async () => {
    mountView(dialogView({ inner: planContent }));
    await open();
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Pro' }));
  });

  it('does not scroll the page when a dialog starts open', async () => {
    const focus = vi.spyOn(HTMLElement.prototype, 'focus');
    mountView(dialogView({ inner: planContent, rootProps: { defaultOpen: true } }));
    await settle();
    const pro = screen.getByRole('radio', { name: 'Pro' });
    expect(document.activeElement).toBe(pro);
    expect(focus.mock.contexts.at(-1)).toBe(pro);
    expect(focus.mock.lastCall).toEqual([{ preventScroll: true }]);
  });
});
