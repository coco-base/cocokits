// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { item, must, record, selectView, settle, stubOverlayBrowser } from './fixtures';
import { mountView } from './fixtures';

beforeEach(() => {
  stubOverlayBrowser();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const trigger = (): HTMLElement => screen.getByRole('combobox');
const gone = (): Promise<void> =>
  waitFor(() => {
    expect(screen.queryByRole('listbox')).toBeNull();
  });
const after = (): HTMLElement => must(document.getElementById('after'));
const prevent = (event: Event): void => {
  event.preventDefault();
};

/** A Select that refuses every dismissal it is asked about. */
function refusing(extra: Record<string, unknown> = {}) {
  const escapes = vi.fn(prevent);
  const presses = vi.fn(prevent);
  const recorded = record();
  const view = selectView(
    { ...recorded.props, ...extra },
    { content: { onEscapeKeyDown: escapes, onPointerDownOutside: presses } },
  );
  return { escapes, presses, recorded, view };
}

describe('Select refusing a dismissal', () => {
  it('keeps the list open and the highlight when Escape is refused', async () => {
    const user = userEvent.setup();
    const { escapes, recorded, view } = refusing();
    mountView(view);
    await user.tab();
    await user.keyboard('{ArrowDown}{ArrowDown}');
    await screen.findByRole('listbox');
    await user.keyboard('{Escape}');
    expect(escapes).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('listbox')).toBeTruthy();
    expect(trigger().getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Burger' }).id);
    expect(recorded.opens).toEqual([true]);
  });

  it('asks the Escape listener once and closes when it does not refuse', async () => {
    const user = userEvent.setup();
    const escapes = vi.fn();
    const recorded = record();
    mountView(selectView(recorded.props, { content: { onEscapeKeyDown: escapes } }));
    await user.tab();
    await user.keyboard('{ArrowDown}{Escape}');
    await gone();
    expect(escapes).toHaveBeenCalledTimes(1);
    expect(recorded.values).toEqual([]);
    expect(recorded.opens.at(-1)).toBe(false);
  });

  it('keeps the list open, the focus on the trigger and the value when a press outside is refused', async () => {
    const user = userEvent.setup();
    const { presses, recorded, view } = refusing();
    mountView(view);
    await user.click(trigger());
    await screen.findByRole('listbox');
    await user.click(after());
    await settle();
    expect(presses).toHaveBeenCalledTimes(1);
    expect((presses.mock.calls[0]?.[0] as CustomEvent<{ originalEvent: Event }>).detail.originalEvent.type).toBe(
      'pointerdown',
    );
    expect(screen.getByRole('listbox')).toBeTruthy();
    expect(document.activeElement).toBe(trigger());
    expect(recorded.values).toEqual([]);
  });

  it('gives the focus back to the trigger when a refused press is a touch press', async () => {
    const user = userEvent.setup();
    const { view } = refusing();
    mountView(view);
    await user.click(trigger());
    await screen.findByRole('listbox');
    const target = after();
    // A touch press: the pointer goes down, the browser moves the focus, then the click follows.
    await fireEvent.pointerDown(target, { pointerType: 'touch' });
    target.focus();
    await fireEvent.click(target);
    await settle();
    expect(screen.getByRole('listbox')).toBeTruthy();
    expect(document.activeElement).toBe(trigger());
  });

  it.each([
    ['Tab', async (user: ReturnType<typeof userEvent.setup>) => user.tab()],
    [
      'a script focus',
      () => {
        after().focus();
        return Promise.resolve();
      },
    ],
  ])('chooses the highlighted item and closes on %s, whatever the handlers refuse', async (_name, move) => {
    const user = userEvent.setup();
    const { recorded, view } = refusing();
    mountView(view);
    await user.tab();
    await user.keyboard('{ArrowDown}{ArrowDown}');
    await screen.findByRole('listbox');
    await move(user);
    await gone();
    expect(recorded.values).toEqual(['Burger']);
    expect(recorded.opens.at(-1)).toBe(false);
  });

  it('keeps the value when the select listener refuses it, and still closes on a focus move', async () => {
    const user = userEvent.setup();
    const recorded = record();
    mountView(selectView(recorded.props, { items: () => [item('Cake', 'Cake', { onSelect: prevent })] }));
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await user.tab();
    await gone();
    expect(recorded.values).toEqual([]);
    expect(recorded.opens.at(-1)).toBe(false);
  });

  it('chooses the highlighted item and closes on a press that moves the focus', async () => {
    const user = userEvent.setup();
    const recorded = record();
    mountView(selectView(recorded.props));
    await user.click(trigger());
    await screen.findByRole('listbox');
    await user.click(after());
    await gone();
    expect(recorded.values).toEqual(['Cake']);
    expect(document.activeElement).toBe(after());
  });

  it('closes a multiple Select on a focus move without a change', async () => {
    const user = userEvent.setup();
    const recorded = record();
    mountView(selectView({ multiple: true, ...recorded.props }));
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await user.tab();
    await gone();
    expect(recorded.values).toEqual([]);
  });

  it('changes nothing when the window loses the focus', async () => {
    const user = userEvent.setup();
    const recorded = record();
    mountView(selectView(recorded.props));
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await fireEvent.blur(trigger());
    await settle();
    expect(screen.getByRole('listbox')).toBeTruthy();
    expect(recorded.values).toEqual([]);
  });
});
