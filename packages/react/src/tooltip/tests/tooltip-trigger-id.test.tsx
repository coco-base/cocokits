// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Tooltip } from '../index';
import { stubTopLayer, tooltipDescription } from './fixtures';

beforeEach(stubTopLayer);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('Tooltip trigger id', () => {
  it('keeps the id the author wrote and still links the trigger to its description', async () => {
    render(
      <Tooltip.Root defaultOpen>
        <Tooltip.Trigger id="mine" aria-label="Copy link">
          Copy
        </Tooltip.Trigger>
        <Tooltip.Content>Copy the link</Tooltip.Content>
      </Tooltip.Root>,
    );
    const trigger = screen.getByRole('button', { name: 'Copy link' });
    await waitFor(() => {
      expect(tooltipDescription()).not.toBeNull();
    });
    const description = tooltipDescription();
    expect(trigger.id).toBe('mine');
    expect(trigger.getAttribute('aria-describedby')).toBe(description?.id);
    expect(description?.id).not.toBe('');
  });
});
