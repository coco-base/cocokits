// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { useState, type ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Popover } from '../index';
import { nextFrame, stubTopLayer } from './fixtures';

beforeEach(stubTopLayer);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('Popover.Title and Popover.Description', () => {
  it('names and describes the content with their ids', () => {
    render(
      <Popover.Root defaultOpen>
        <Popover.Trigger>Share</Popover.Trigger>
        <Popover.Content>
          <Popover.Title>Share this page</Popover.Title>
          <Popover.Description>Anyone with the link can view.</Popover.Description>
        </Popover.Content>
      </Popover.Root>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Share this page' });
    const title = screen.getByText('Share this page');
    const description = screen.getByText('Anyone with the link can view.');
    expect(title.tagName).toBe('H2');
    expect(title.className).toBe('cck-popover__title');
    expect(description.tagName).toBe('P');
    expect(description.className).toBe('cck-popover__description');
    expect(dialog.getAttribute('aria-labelledby')).toBe(title.id);
    expect(dialog.getAttribute('aria-describedby')).toBe(description.id);
    expect(dialog.getAttribute('aria-modal')).toBeNull();
  });

  it('removes the attributes when the parts unmount, and renders the element given to render', () => {
    function Example(): ReactElement {
      const [shown, setShown] = useState(true);
      return (
        <Popover.Root defaultOpen>
          <Popover.Trigger>Share</Popover.Trigger>
          <Popover.Content aria-label="x">
            {shown ? (
              <>
                <Popover.Title render={<h3 />}>Title</Popover.Title>
                <Popover.Description>Text</Popover.Description>
              </>
            ) : null}
            <button
              onClick={() => {
                setShown(false);
              }}
            >
              hide
            </button>
          </Popover.Content>
        </Popover.Root>
      );
    }
    render(<Example />);
    const dialog = screen.getByRole('dialog');
    expect(screen.getByText('Title').tagName).toBe('H3');
    expect(dialog.hasAttribute('aria-labelledby')).toBe(true);
    screen.getByText('hide').click();
    return waitFor(() => {
      expect(dialog.hasAttribute('aria-labelledby')).toBe(false);
      expect(dialog.hasAttribute('aria-describedby')).toBe(false);
    });
  });

  it('warns when the content has no accessible name, naming the Title, and not when a Title names it', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      <Popover.Root defaultOpen>
        <Popover.Trigger>Share</Popover.Trigger>
        <Popover.Content>text</Popover.Content>
      </Popover.Root>,
    );
    await waitFor(() => {
      expect(warn).toHaveBeenCalledWith(
        'CocoKits: <Popover.Content> has no accessible name. Add a <Popover.Title> with text, or an aria-label, or an aria-labelledby that points to an element with text.',
      );
    });
    cleanup();
    warn.mockClear();
    render(
      <Popover.Root defaultOpen>
        <Popover.Trigger>Share</Popover.Trigger>
        <Popover.Content>
          <Popover.Title>Share</Popover.Title>
        </Popover.Content>
      </Popover.Root>,
    );
    await nextFrame();
    await nextFrame();
    expect(warn).not.toHaveBeenCalled();
  });

  it('throws the documented error outside the root', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Popover.Title>x</Popover.Title>)).toThrow(
      'CocoKits: <Popover.Title> must be placed within <Popover.Root>.',
    );
    expect(() => render(<Popover.Anchor />)).toThrow(
      'CocoKits: <Popover.Anchor> must be placed within <Popover.Root>.',
    );
  });
});
