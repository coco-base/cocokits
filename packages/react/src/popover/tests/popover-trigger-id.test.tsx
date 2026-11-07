// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Popover } from '../index';
import { stubTopLayer } from './fixtures';

beforeEach(stubTopLayer);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('Popover trigger id', () => {
  it('keeps the id the author wrote and still links the trigger to the content', async () => {
    render(
      <Popover.Root defaultOpen>
        <Popover.Trigger id="mine">Share</Popover.Trigger>
        <Popover.Content aria-label="Share link">Text</Popover.Content>
      </Popover.Root>,
    );
    const trigger = screen.getByRole('button', { name: 'Share' });
    const content = await screen.findByRole('dialog');
    expect(trigger.id).toBe('mine');
    expect(trigger.getAttribute('aria-controls')).toBe(content.id);
    expect(content.id).not.toBe('');
  });
});
