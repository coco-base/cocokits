// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Dishes, gone, lastReason, must, nextTask, Opt, reasonsOf, stubTopLayer, trigger, valueText } from './fixtures';

beforeEach(() => {
  stubTopLayer();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

function Menu(props: Parameters<typeof Dishes<string, false>>[0]): React.ReactElement {
  return (
    <>
      <Dishes {...props}>
        <Opt value="Cake">Cake</Opt>
        <Opt value="Pizza">Pizza</Opt>
        <Opt value="Burger">Burger</Opt>
      </Dishes>
      <button id="after">After</button>
      <p id="empty">Empty</p>
    </>
  );
}

describe('Select refusal with the Content handlers', () => {
  it('keeps the list open and the highlight when onEscapeKeyDown prevents the default', async () => {
    const user = userEvent.setup();
    const onEscapeKeyDown = vi.fn((event: KeyboardEvent) => {
      event.preventDefault();
    });
    const onOpenChange = vi.fn();
    render(<Menu contentProps={{ onEscapeKeyDown }} onOpenChange={onOpenChange} />);
    await user.tab();
    await user.keyboard('{ArrowDown}{ArrowDown}{Escape}');
    expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('listbox')).toBeTruthy();
    expect(trigger().getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Pizza' }).id);
    expect(reasonsOf(onOpenChange)).toEqual([[true, 'trigger']]);
  });

  it('closes on Escape when onEscapeKeyDown does not prevent the default, once', async () => {
    const user = userEvent.setup();
    const onEscapeKeyDown = vi.fn();
    const onOpenChange = vi.fn();
    render(<Menu contentProps={{ onEscapeKeyDown }} onOpenChange={onOpenChange} />);
    await user.tab();
    await user.keyboard('{ArrowDown}{Escape}');
    await gone();
    expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
    expect(reasonsOf(onOpenChange)).toEqual([
      [true, 'trigger'],
      [false, 'escape'],
    ]);
  });

  it('keeps the list open and the focus on the trigger when onPointerDownOutside prevents the default', async () => {
    const user = userEvent.setup();
    const onPointerDownOutside = vi.fn((event: Event) => {
      event.preventDefault();
    });
    const onOpenChange = vi.fn();
    render(<Menu contentProps={{ onPointerDownOutside }} onOpenChange={onOpenChange} />);
    await user.tab();
    await user.keyboard('{ArrowDown}{ArrowDown}');
    await user.click(must(document.getElementById('after')));
    await nextTask();
    expect(onPointerDownOutside).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('listbox')).toBeTruthy();
    expect(document.activeElement).toBe(trigger());
    expect(reasonsOf(onOpenChange)).toEqual([[true, 'trigger']]);
  });
});

describe('Select refusal with cancel()', () => {
  it('keeps the list closed when onOpenChange cancels the open', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn((_open: boolean, details: { cancel(): void }) => {
      details.cancel();
    });
    render(<Menu onOpenChange={onOpenChange} />);
    await user.click(trigger());
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('keeps the list open when onOpenChange cancels the close from Escape and from the trigger', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn((open: boolean, details: { cancel(): void }) => {
      if (!open) details.cancel();
    });
    render(<Menu onOpenChange={onOpenChange} />);
    await user.tab();
    await user.keyboard('{ArrowDown}{Escape}');
    expect(screen.getByRole('listbox')).toBeTruthy();
    await user.click(trigger());
    expect(screen.getByRole('listbox')).toBeTruthy();
    expect(onOpenChange).toHaveBeenCalledTimes(3);
  });

  it('keeps the value and the list when onValueChange cancels a click choice', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn((_value: string | null, details: { cancel(): void }) => {
      details.cancel();
    });
    render(<Menu onValueChange={onValueChange} />);
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Pizza' }));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('listbox')).toBeTruthy();
    expect(trigger().querySelector('.cck-select__value')).toBeNull();
  });

  it('ignores cancel() in onOpenChange for a close caused by focus leaving the trigger', async () => {
    const user = userEvent.setup();
    const seen: boolean[] = [];
    const onOpenChange = vi.fn((open: boolean, details: { cancel(): void; isCanceled: boolean }) => {
      if (open) return;
      details.cancel();
      seen.push(details.isCanceled);
    });
    render(<Menu onOpenChange={onOpenChange} />);
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await user.tab();
    await gone();
    expect(lastReason(onOpenChange)).toBe('blur');
    expect(seen).toEqual([false]);
  });
});

describe('Select focus leaving the trigger', () => {
  const refusing = {
    contentProps: {
      onEscapeKeyDown: (event: KeyboardEvent) => {
        event.preventDefault();
      },
      onPointerDownOutside: (event: Event) => {
        event.preventDefault();
      },
    },
  };

  it('chooses the highlighted item on Tab and on a script focus move, despite refusing handlers', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onOpenChange = vi.fn();
    render(<Menu {...refusing} onValueChange={onValueChange} onOpenChange={onOpenChange} />);
    await user.tab();
    await user.keyboard('{ArrowDown}{ArrowDown}');
    await user.tab();
    await gone();
    expect(valueText()).toBe('Pizza');
    expect(reasonsOf(onValueChange)).toEqual([['Pizza', 'user']]);
    expect(lastReason(onOpenChange)).toBe('blur');

    trigger().focus();
    await user.keyboard('{ArrowDown}{ArrowDown}');
    must(document.getElementById('after')).focus();
    await gone();
    expect(valueText()).toBe('Burger');
    expect(lastReason(onOpenChange)).toBe('blur');
  });

  it('still closes when a canceled onValueChange keeps the old value', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn((_value: string | null, details: { cancel(): void }) => {
      details.cancel();
    });
    render(<Menu onValueChange={onValueChange} defaultValue="Cake" />);
    await user.tab();
    await user.keyboard('{ArrowDown}{ArrowDown}');
    await user.tab();
    await gone();
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(valueText()).toBe('Cake');
  });

  it('closes a multiple Select without a change', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Dishes multiple onValueChange={onValueChange}>
        <Opt value="Cake">Cake</Opt>
      </Dishes>,
    );
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await user.tab();
    await gone();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('chooses the highlighted item when an accepted outside press moves the focus', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onOpenChange = vi.fn();
    render(<Menu onValueChange={onValueChange} onOpenChange={onOpenChange} />);
    await user.tab();
    await user.keyboard('{ArrowDown}{ArrowDown}');
    await user.click(must(document.getElementById('after')));
    await gone();
    expect(reasonsOf(onValueChange)).toEqual([['Pizza', 'user']]);
    expect(lastReason(onOpenChange)).toBe('outside-press');
  });

  it('chooses the highlighted item when the press is on a page area that moves the focus to the body', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Menu onValueChange={onValueChange} />);
    await user.tab();
    await user.keyboard('{ArrowDown}{ArrowDown}');
    await user.click(must(document.getElementById('empty')));
    await gone();
    expect(document.activeElement).toBe(document.body);
    expect(reasonsOf(onValueChange)).toEqual([['Pizza', 'user']]);
  });

  it('changes nothing when the window loses focus', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Menu onOpenChange={onOpenChange} />);
    await user.tab();
    await user.keyboard('{ArrowDown}');
    trigger().dispatchEvent(new FocusEvent('blur'));
    await nextTask();
    expect(screen.getByRole('listbox')).toBeTruthy();
    expect(onOpenChange).toHaveBeenCalledTimes(1);
  });
});
