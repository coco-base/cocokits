// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode, type ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Tooltip } from '../index';
import { accessibleDescription, stubTopLayer, tooltipContent, tooltipDescription } from './fixtures';

beforeEach(stubTopLayer);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('Tooltip description', () => {
  it('describes the trigger by text children while the tooltip is closed', async () => {
    render(
      <StrictMode>
        <Tooltip.Root>
          <Tooltip.Trigger aria-label="Copy link">Copy</Tooltip.Trigger>
          <Tooltip.Content>Copy the link to the clipboard</Tooltip.Content>
        </Tooltip.Root>
      </StrictMode>,
    );
    const trigger = screen.getByRole('button', { name: 'Copy link' });
    await waitFor(() => {
      expect(tooltipDescription()).not.toBeNull();
    });
    expect(tooltipContent()).toBeNull();
    expect(accessibleDescription(trigger)).toBe('Copy the link to the clipboard');
    const description = tooltipDescription();
    expect(description?.getAttribute('role')).toBe('tooltip');
    expect(description?.hasAttribute('hidden')).toBe(true);
    expect(description?.id).toBe(trigger.getAttribute('aria-describedby'));
    expect(description?.className).toBe('');
  });

  it('describes by aria-label, which the visible content does not carry', async () => {
    render(
      <Tooltip.Root defaultOpen>
        <Tooltip.Trigger>Icon</Tooltip.Trigger>
        <Tooltip.Content aria-label="Copy the link">
          <b>Copy</b> link
        </Tooltip.Content>
      </Tooltip.Root>,
    );
    await waitFor(() => {
      expect(tooltipContent()).not.toBeNull();
    });
    expect(accessibleDescription(screen.getByRole('button'))).toBe('Copy the link');
    expect(tooltipContent()?.hasAttribute('aria-label')).toBe(false);
    expect(tooltipContent()?.getAttribute('aria-hidden')).toBe('true');
  });

  it('describes number children', async () => {
    render(
      <Tooltip.Root>
        <Tooltip.Trigger>Count</Tooltip.Trigger>
        <Tooltip.Content>{42}</Tooltip.Content>
      </Tooltip.Root>,
    );
    await waitFor(() => {
      expect(tooltipDescription()?.textContent).toBe('42');
    });
  });

  it('describes element children without a label only while the content is mounted', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip.Root>
        <Tooltip.Trigger>Icon</Tooltip.Trigger>
        <Tooltip.Content>
          <b>Rich</b> tip
        </Tooltip.Content>
      </Tooltip.Root>,
    );
    const trigger = screen.getByRole('button');
    expect(tooltipDescription()).toBeNull();
    expect(trigger.hasAttribute('aria-describedby')).toBe(false);
    await user.tab();
    await waitFor(() => {
      expect(tooltipContent()).not.toBeNull();
    });
    expect(trigger.getAttribute('aria-describedby')).toBe(tooltipContent()?.id);
    expect(tooltipContent()?.hasAttribute('aria-hidden')).toBe(false);
  });

  it('adds nothing when the text equals the trigger aria-label', async () => {
    render(
      <Tooltip.Root defaultOpen>
        <Tooltip.Trigger aria-label="Copy link">x</Tooltip.Trigger>
        <Tooltip.Content>Copy link</Tooltip.Content>
      </Tooltip.Root>,
    );
    await waitFor(() => {
      expect(tooltipContent()).not.toBeNull();
    });
    expect(tooltipDescription()).toBeNull();
    expect(screen.getByRole('button').hasAttribute('aria-describedby')).toBe(false);
    expect(tooltipContent()?.getAttribute('aria-hidden')).toBe('true');
  });

  it('follows a change of the text and of the trigger label, and goes when the text empties', async () => {
    const view = (label: string, text: string | null): ReactElement => (
      <Tooltip.Root>
        <Tooltip.Trigger aria-label={label}>x</Tooltip.Trigger>
        <Tooltip.Content>{text}</Tooltip.Content>
      </Tooltip.Root>
    );
    const { rerender } = render(view('Copy', 'Copy the link'));
    await waitFor(() => {
      expect(tooltipDescription()?.textContent).toBe('Copy the link');
    });
    rerender(view('Copy', 'Paste the link'));
    await waitFor(() => {
      expect(tooltipDescription()?.textContent).toBe('Paste the link');
    });
    rerender(view('Paste the link', 'Paste the link'));
    await waitFor(() => {
      expect(tooltipDescription()).toBeNull();
    });
    rerender(view('Copy', 'Paste the link'));
    await waitFor(() => {
      expect(tooltipDescription()).not.toBeNull();
    });
    rerender(view('Copy', null));
    await waitFor(() => {
      expect(tooltipDescription()).toBeNull();
    });
  });

  it('removes the description when disabled and when the tooltip unmounts', async () => {
    const view = (disabled: boolean): ReactElement => (
      <Tooltip.Root disabled={disabled}>
        <Tooltip.Trigger aria-label="Copy">x</Tooltip.Trigger>
        <Tooltip.Content>Copy the link</Tooltip.Content>
      </Tooltip.Root>
    );
    const { rerender, unmount } = render(view(false));
    await waitFor(() => {
      expect(tooltipDescription()).not.toBeNull();
    });
    rerender(view(true));
    await waitFor(() => {
      expect(tooltipDescription()).toBeNull();
    });
    expect(screen.getByRole('button').hasAttribute('aria-describedby')).toBe(false);
    rerender(view(false));
    await waitFor(() => {
      expect(tooltipDescription()).not.toBeNull();
    });
    unmount();
    expect(tooltipDescription()).toBeNull();
  });

  it('keeps the author ids next to the description id', async () => {
    render(
      <Tooltip.Root>
        <Tooltip.Trigger aria-label="Copy" aria-describedby="mine">
          x
        </Tooltip.Trigger>
        <Tooltip.Content>Copy the link</Tooltip.Content>
      </Tooltip.Root>,
    );
    await waitFor(() => {
      expect(tooltipDescription()).not.toBeNull();
    });
    expect(screen.getByRole('button').getAttribute('aria-describedby')).toBe(`mine ${tooltipDescription()?.id ?? ''}`);
  });
});
