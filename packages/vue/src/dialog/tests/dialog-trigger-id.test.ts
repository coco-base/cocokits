// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/vue';
import { h } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DialogContent, DialogRoot, DialogTrigger } from '../index';
import { mountView, settle, stubOverlayBrowser } from './fixtures';

beforeEach(stubOverlayBrowser);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('Dialog trigger id', () => {
  it('keeps the id the author wrote and still links the trigger to the content', async () => {
    mountView(() => [
      h(DialogRoot, { open: true }, () => [
        h(DialogTrigger, { id: 'mine' }, () => 'Delete'),
        h(DialogContent, { 'aria-label': 'Delete project' }, () => 'Text'),
      ]),
    ]);
    await settle();
    const trigger = screen.getByRole('button', { name: 'Delete' });
    const content = screen.getByRole('dialog');
    expect(trigger.id).toBe('mine');
    expect(trigger.getAttribute('aria-controls')).toBe(content.id);
    expect(content.id).not.toBe('');
  });
});
