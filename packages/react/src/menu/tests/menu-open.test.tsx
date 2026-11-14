// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type MenuChangeDetails } from '../index';
import { Example, expectFocus, item, menu, stubTopLayer, trigger } from './fixtures';

beforeEach(stubTopLayer);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

type OpenChange = (open: boolean, details: MenuChangeDetails) => void;

const reasons = (fn: ReturnType<typeof vi.fn<OpenChange>>): unknown[] =>
  fn.mock.calls.map((call) => [call[0], call[1].reason]);

const gone = (): Promise<void> =>
  waitFor(() => {
    expect(menu()).toBeNull();
  });

describe('Menu open state', () => {
  it('toggles on the trigger and reports each change once with its reason', async () => {
    const onOpenChange = vi.fn<OpenChange>();
    render(<Example root={{ onOpenChange }} />);
    await userEvent.click(trigger());
    expect(menu()).not.toBeNull();
    await userEvent.click(trigger());
    await gone();
    expect(reasons(onOpenChange)).toEqual([
      [true, 'trigger'],
      [false, 'trigger'],
    ]);
  });

  it.each([
    ['an item', async () => userEvent.click(item('Edit')), 'item'],
    ['Escape', async () => userEvent.keyboard('{Escape}'), 'escape'],
    ['a press outside', async () => userEvent.click(document.body), 'outside-press'],
    ['Tab', async () => userEvent.tab(), 'focus-out'],
    ['Shift+Tab', async () => userEvent.tab({ shift: true }), 'focus-out'],
  ])('reports %s as %s', async (_name, act, reason) => {
    const onOpenChange = vi.fn<OpenChange>();
    render(<Example root={{ onOpenChange }} />);
    await userEvent.click(trigger());
    await expectFocus(item('Edit'));
    await act();
    await gone();
    expect(reasons(onOpenChange).at(-1)).toEqual([false, reason]);
    expect(reasons(onOpenChange)).toHaveLength(2);
  });

  it('gives the details the event behind the change and cancel()', async () => {
    const onOpenChange = vi.fn<OpenChange>();
    render(<Example root={{ onOpenChange }} />);
    await userEvent.click(trigger());
    const details = onOpenChange.mock.calls[0][1];
    expect(details.event?.type).toBe('click');
    expect(typeof details.cancel).toBe('function');
  });

  it('opens by default after the first render and reports nothing', async () => {
    const onOpenChange = vi.fn<OpenChange>();
    render(<Example root={{ defaultOpen: true, onOpenChange }} />);
    await waitFor(() => {
      expect(menu()).not.toBeNull();
    });
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('keeps a controlled open when the parent ignores the request, and follows the prop', async () => {
    const onOpenChange = vi.fn<OpenChange>();
    const { rerender } = render(<Example root={{ open: false, onOpenChange }} />);
    await userEvent.click(trigger());
    expect(onOpenChange).toHaveBeenCalledWith(true, expect.objectContaining({ reason: 'trigger' }));
    expect(menu()).toBeNull();
    rerender(<Example root={{ open: true, onOpenChange }} />);
    await waitFor(() => {
      expect(menu()).not.toBeNull();
    });
    expect(onOpenChange).toHaveBeenCalledOnce();
  });

  it('opens from a parent write without a change report, and reports the close the user asks for', async () => {
    const onOpenChange = vi.fn<OpenChange>();
    function Controlled(): ReactElement {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button
            onClick={() => {
              setOpen(true);
            }}
          >
            parent
          </button>
          <Example
            root={{
              open,
              onOpenChange: (next, details) => {
                onOpenChange(next, details);
                setOpen(next);
              },
            }}
          />
        </>
      );
    }
    render(<Controlled />);
    await userEvent.click(screen.getByRole('button', { name: 'parent' }));
    await waitFor(() => {
      expect(menu()).not.toBeNull();
    });
    expect(onOpenChange).not.toHaveBeenCalled();
    await userEvent.click(trigger());
    await gone();
    expect(reasons(onOpenChange)).toEqual([[false, 'trigger']]);
  });

  it('lets the author preventDefault on the trigger click veto the toggle', async () => {
    const onOpenChange = vi.fn<OpenChange>();
    render(<Example root={{ onOpenChange }} />);
    trigger().addEventListener('click', (event) => {
      event.preventDefault();
    });
    await userEvent.click(trigger());
    expect(menu()).toBeNull();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('warns when the open prop switches between controlled and uncontrolled', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { rerender } = render(<Example root={{}} />);
    rerender(<Example root={{ open: false }} />);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('uncontrolled to controlled'));
  });
});
