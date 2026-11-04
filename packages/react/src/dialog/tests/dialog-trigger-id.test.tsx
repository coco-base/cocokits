// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Dialog } from '../index';
import { stubTopLayer } from './fixtures';

beforeEach(stubTopLayer);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('Dialog trigger id', () => {
  it('keeps the id the author wrote and still links the trigger to the content', async () => {
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Trigger id="mine">Delete</Dialog.Trigger>
        <Dialog.Content aria-label="Delete project">Text</Dialog.Content>
      </Dialog.Root>,
    );
    const trigger = screen.getByRole('button', { name: 'Delete' });
    const content = await screen.findByRole('dialog');
    expect(trigger.id).toBe('mine');
    expect(trigger.getAttribute('aria-controls')).toBe(content.id);
    expect(content.id).not.toBe('');
  });
});
