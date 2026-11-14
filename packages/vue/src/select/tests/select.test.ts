// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen, waitFor } from '@testing-library/vue';
import { h, ref } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { selectAnatomy } from '@cocokits/machines/select';
import { SelectItem } from '../index';
import { active, gone, mountView, option, record, selectView, settle, stubOverlayBrowser, trigger } from './fixtures';

const { classes } = selectAnatomy;

beforeEach(() => {
  stubOverlayBrowser();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('Select rendered contract', () => {
  it('renders the root, trigger, placeholder and icon with the anatomy classes and no list while closed', () => {
    mountView(selectView());
    const root = trigger().closest(`.${classes.root}`);
    expect(root?.tagName).toBe('DIV');
    expect(root?.getAttribute('data-state')).toBe('closed');
    expect(root?.hasAttribute('data-placeholder-shown')).toBe(true);
    expect(root?.hasAttribute('aria-label')).toBe(false);
    expect(trigger().tagName).toBe('BUTTON');
    expect(trigger().classList.contains(classes.trigger)).toBe(true);
    expect(trigger().getAttribute('type')).toBe('button');
    expect(trigger().getAttribute('aria-haspopup')).toBe('listbox');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(trigger().hasAttribute('aria-controls')).toBe(false);
    expect(trigger().getAttribute('aria-label')).toBe('Dish');
    expect(trigger().querySelector(`.${classes.placeholder}`)?.textContent).toBe('Choose a dish');
    expect(trigger().querySelector(`.${classes.dropdownIcon}`)?.getAttribute('aria-hidden')).toBe('true');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('renders the listbox and options in the overlay container, not next to the trigger', async () => {
    const user = userEvent.setup();
    mountView(selectView());
    await user.click(trigger());
    const list = await screen.findByRole('listbox');
    expect(list.classList.contains(classes.content)).toBe(true);
    expect(list.closest(`.${classes.root}`)).toBeNull();
    expect(list.getAttribute('data-state')).toBe('open');
    expect(list.getAttribute('data-side')).toBe('bottom');
    expect(list.getAttribute('data-align')).toBe('start');
    expect(list.getAttribute('aria-label')).toBe('Dish');
    expect(trigger().getAttribute('aria-controls')).toBe(list.id);
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(screen.getAllByRole('option').map((node) => node.textContent.trim())).toEqual([
      'Cake',
      'Pizza',
      'Burger',
      'Steak',
    ]);
    expect(option('Cake').classList.contains(classes.option)).toBe(true);
    expect(option('Cake').querySelector(`.${classes.optionIndicator}`)?.getAttribute('aria-hidden')).toBe('true');
    expect(option('Cake').querySelector(`.${classes.optionContent}`)?.textContent).toBe('Cake');
    expect(option('Pizza').getAttribute('aria-disabled')).toBe('true');
    expect(option('Pizza').hasAttribute('data-disabled')).toBe(true);
  });

  it('marks multiple on the root and the list', async () => {
    const user = userEvent.setup();
    mountView(selectView({ multiple: true }));
    await user.click(trigger());
    const list = await screen.findByRole('listbox');
    expect(list.getAttribute('aria-multiselectable')).toBe('true');
    expect(list.hasAttribute('data-multiple')).toBe(true);
    expect(trigger().closest(`.${classes.root}`)?.hasAttribute('data-multiple')).toBe(true);
  });

  it('keeps DOM focus on the trigger when it opens', async () => {
    const user = userEvent.setup();
    mountView(selectView());
    await user.tab();
    expect(document.activeElement).toBe(trigger());
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    expect(document.activeElement).toBe(trigger());
  });

  it('focuses the trigger on a press that did not (Safari, Firefox in a frame), then keeps it through Escape', async () => {
    const user = userEvent.setup();
    mountView(selectView());
    expect(document.activeElement).not.toBe(trigger());
    trigger().click(); // a click without the focus a mouse press gives a button in Safari
    await screen.findByRole('listbox');
    expect(document.activeElement).toBe(trigger());
    await user.keyboard('{Escape}');
    await gone();
    expect(document.activeElement).toBe(trigger());
  });

  it('moves no focus on a press of a disabled or read-only trigger', async () => {
    mountView(selectView({ readonly: true }));
    trigger().click();
    await settle();
    expect(document.activeElement).not.toBe(trigger());
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('passes native attributes to the root and keeps the machine attributes', () => {
    mountView(selectView({ 'data-testid': 'root', class: 'mine', id: 'custom', 'data-state': 'x' }));
    const root = screen.getByTestId('root');
    expect(root.classList.contains('cck-select')).toBe(true);
    expect(root.classList.contains('mine')).toBe(true);
    expect(root.getAttribute('data-state')).toBe('closed');
  });

  it('throws a clear error for a part outside a SelectRoot', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(() => mountView(() => h(SelectItem, { value: 'x' }))).toThrow(
      'CocoKits: <SelectItem> must be used inside <SelectRoot>.',
    );
  });
});

describe('Select opening', () => {
  it('opens on click with the first enabled option highlighted and reports the trigger reason', async () => {
    const user = userEvent.setup();
    const recorded = record();
    mountView(selectView(recorded.props));
    await user.click(trigger());
    await screen.findByRole('listbox');
    expect(trigger().getAttribute('aria-activedescendant')).toBe(option('Cake').id);
    expect(option('Cake').hasAttribute('data-highlighted')).toBe(true);
    expect(recorded.opens).toEqual([true]);
  });

  it.each([['{ArrowDown}'], ['{Alt>}{ArrowDown}{/Alt}'], ['{Enter}'], [' ']])('opens with %s', async (keys) => {
    const user = userEvent.setup();
    mountView(selectView());
    await user.tab();
    await user.keyboard(keys);
    expect(await screen.findByRole('listbox')).toBeTruthy();
    await waitFor(() => {
      expect(active()).toBe('Cake');
    });
  });

  it('opens on the selected option', async () => {
    const user = userEvent.setup();
    mountView(selectView({ modelValue: 'Steak' }));
    await user.click(trigger());
    await screen.findByRole('listbox');
    await waitFor(() => {
      expect(active()).toBe('Steak');
    });
  });

  it('ArrowUp opens on the first option, End on the last, Home on the first', async () => {
    const user = userEvent.setup();
    mountView(selectView());
    await user.tab();
    await user.keyboard('{End}');
    await screen.findByRole('listbox');
    await waitFor(() => {
      expect(active()).toBe('Steak');
    });
    await user.keyboard('{Escape}');
    await gone();
    await user.keyboard('{ArrowUp}');
    await screen.findByRole('listbox');
    await waitFor(() => {
      expect(active()).toBe('Cake');
    });
    await user.keyboard('{Escape}');
    await gone();
    await user.keyboard('{Home}');
    await screen.findByRole('listbox');
    await waitFor(() => {
      expect(active()).toBe('Cake');
    });
  });

  it('opens by typing a character, on the option it finds', async () => {
    const user = userEvent.setup();
    mountView(selectView());
    await user.tab();
    await user.keyboard('s');
    await screen.findByRole('listbox');
    await waitFor(() => {
      expect(active()).toBe('Steak');
    });
  });

  it('never opens while disabled or read-only; read-only stays focusable and says so', async () => {
    const user = userEvent.setup();
    const readonlyView = mountView(selectView({ readonly: true }));
    await user.tab();
    expect(document.activeElement).toBe(trigger());
    expect(trigger().getAttribute('aria-readonly')).toBe('true');
    await user.keyboard('{ArrowDown}');
    await user.click(trigger());
    expect(screen.queryByRole('listbox')).toBeNull();
    readonlyView.unmount();
    mountView(selectView({ disabled: true }));
    expect(trigger().disabled).toBe(true);
    expect(trigger().closest(`.${classes.root}`)?.hasAttribute('data-disabled')).toBe(true);
    await user.click(trigger());
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('opens from v-model:open and closes from it, and reports nothing for a parent write', async () => {
    const open = ref(false);
    const recorded = record();
    mountView(() =>
      selectView({ open: open.value, 'onUpdate:open': (value: boolean) => (open.value = value), ...recorded.props })(),
    );
    open.value = true;
    expect(await screen.findByRole('listbox')).toBeTruthy();
    await waitFor(() => {
      expect(active()).toBe('Cake');
    });
    open.value = false;
    await gone();
    expect(recorded.opens).toEqual([]);
  });

  it('keeps a controlled open state when the parent refuses the change', async () => {
    const user = userEvent.setup();
    const recorded = record();
    mountView(selectView({ open: false, 'onUpdate:open': () => undefined, ...recorded.props }));
    await user.click(trigger());
    await settle();
    expect(recorded.opens).toHaveLength(1);
    expect(screen.queryByRole('listbox')).toBeNull();
  });
});
