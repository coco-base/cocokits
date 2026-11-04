// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen, waitFor } from '@testing-library/vue';
import { defineComponent, h, ref } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { selectAnatomy } from '@cocokits/machines/select';
import { SelectItem } from '../index';
import { item, mountView, must, record, selectRoot, selectView, settle, stubOverlayBrowser } from './fixtures';

const { classes } = selectAnatomy;
let scrollIntoView: ReturnType<typeof stubOverlayBrowser>;

beforeEach(() => {
  scrollIntoView = stubOverlayBrowser();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const trigger = (): HTMLElement => screen.getByRole('combobox');
const option = (name: string): HTMLElement => screen.getByRole('option', { name });
const gone = (): Promise<void> =>
  waitFor(() => {
    expect(screen.queryByRole('listbox')).toBeNull();
  });
const active = (): string =>
  document.getElementById(trigger().getAttribute('aria-activedescendant') ?? '')?.textContent.trim() ?? '';
const valueText = (): string | undefined => trigger().querySelector(`.${classes.value}`)?.textContent.trim();

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
    expect((trigger() as HTMLButtonElement).disabled).toBe(true);
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

describe('Select keyboard', () => {
  it('moves with the arrows, stops at the ends, skips the disabled option, and Home/End/PageUp/PageDown jump', async () => {
    const user = userEvent.setup();
    mountView(selectView());
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await waitFor(() => {
      expect(active()).toBe('Cake');
    });
    await user.keyboard('{ArrowDown}');
    expect(active()).toBe('Burger');
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    expect(active()).toBe('Steak');
    await user.keyboard('{ArrowUp}');
    expect(active()).toBe('Burger');
    await user.keyboard('{Home}');
    expect(active()).toBe('Cake');
    await user.keyboard('{End}');
    expect(active()).toBe('Steak');
    await user.keyboard('{PageUp}');
    expect(active()).toBe('Cake');
    await user.keyboard('{PageDown}');
    expect(active()).toBe('Steak');
  });

  it('finds an option by typing, and a pause empties the buffer', async () => {
    const user = userEvent.setup();
    mountView(selectView());
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await user.keyboard('s');
    expect(active()).toBe('Steak');
    await new Promise((resolve) => setTimeout(resolve, 600));
    await user.keyboard('b');
    expect(active()).toBe('Burger');
  });

  it('chooses with Enter and Space, closes a single Select and keeps the focus on the trigger', async () => {
    const user = userEvent.setup();
    const recorded = record();
    mountView(selectView(recorded.props));
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await user.keyboard('{ArrowDown}{Enter}');
    await gone();
    expect(valueText()).toBe('Burger');
    expect(document.activeElement).toBe(trigger());
    expect(recorded.values).toEqual(['Burger']);
    expect(recorded.opens.at(-1)).toEqual(false);
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await user.keyboard('{ArrowDown} ');
    await gone();
    expect(valueText()).toBe('Steak');
  });

  it('chooses and closes with Alt+ArrowUp', async () => {
    const user = userEvent.setup();
    mountView(selectView());
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await user.keyboard('{ArrowDown}{Alt>}{ArrowUp}{/Alt}');
    await gone();
    expect(valueText()).toBe('Burger');
  });

  it('closes with Escape and changes nothing', async () => {
    const user = userEvent.setup();
    const recorded = record();
    mountView(selectView(recorded.props));
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await user.keyboard('{ArrowDown}{Escape}');
    await gone();
    expect(recorded.values).toEqual([]);
    expect(recorded.opens.at(-1)).toEqual(false);
    expect(document.activeElement).toBe(trigger());
  });

  it('chooses the highlighted option on Tab and lets the focus move on', async () => {
    const user = userEvent.setup();
    mountView(selectView());
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await user.keyboard('{ArrowDown}');
    await user.tab();
    await gone();
    expect(valueText()).toBe('Burger');
    expect(document.activeElement).toBe(document.getElementById('after'));
  });

  it('scrolls the highlighted option into view at the nearest edge on a keyboard move, not on a pointer move', async () => {
    const user = userEvent.setup();
    mountView(selectView());
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await settle();
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' });
    scrollIntoView.mockClear();
    await user.keyboard('{ArrowDown}');
    await settle();
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    scrollIntoView.mockClear();
    await user.hover(option('Steak'));
    await settle();
    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});

describe('Select pointer', () => {
  it('highlights under the pointer, skips a disabled option, and a press in the list keeps the focus on the trigger', async () => {
    const user = userEvent.setup();
    mountView(selectView());
    await user.click(trigger());
    await screen.findByRole('listbox');
    await user.hover(option('Steak'));
    expect(active()).toBe('Steak');
    await user.hover(option('Pizza'));
    expect(active()).toBe('Steak');
    await user.pointer({ keys: '[MouseLeft>]', target: option('Steak') });
    expect(document.activeElement).toBe(trigger());
  });

  it('chooses on click, marks it selected and closes', async () => {
    const user = userEvent.setup();
    const recorded = record();
    mountView(selectView(recorded.props));
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Burger' }));
    await gone();
    expect(valueText()).toBe('Burger');
    expect(recorded.values).toEqual(['Burger']);
    await user.click(trigger());
    await screen.findByRole('listbox');
    expect(option('Burger').getAttribute('aria-selected')).toBe('true');
    expect(option('Burger').hasAttribute('data-selected')).toBe(true);
    expect(option('Cake').getAttribute('aria-selected')).toBe('false');
  });

  it('does not choose a disabled option', async () => {
    const user = userEvent.setup();
    const recorded = record();
    mountView(selectView(recorded.props));
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Pizza' }));
    expect(recorded.values).toEqual([]);
    expect(screen.getByRole('listbox')).toBeTruthy();
  });

  it('lets a preventDefault in the item listener veto the choice', async () => {
    const user = userEvent.setup();
    const recorded = record();
    mountView(
      selectView(recorded.props, {
        items: () => [
          item('Cake', 'Cake', {
            onClick: (event: Event) => {
              event.preventDefault();
            },
          }),
          item('Pizza'),
        ],
      }),
    );
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Cake' }));
    expect(recorded.values).toEqual([]);
    await user.click(option('Pizza'));
    expect(recorded.values).toHaveLength(1);
  });

  it('refuses a choice with a prevented select event and keeps the list open', async () => {
    const user = userEvent.setup();
    const recorded = record();
    mountView(
      selectView(recorded.props, {
        items: () => [
          item('Cake', 'Cake', {
            onSelect: (event: Event) => {
              event.preventDefault();
            },
          }),
          item('Pizza'),
        ],
      }),
    );
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Cake' }));
    expect(recorded.values).toEqual([]);
    expect(screen.getByRole('listbox')).toBeTruthy();
    await user.click(option('Pizza'));
    expect(recorded.values).toEqual(['Pizza']);
  });

  it('closes on an outside press with the outside-press reason', async () => {
    const user = userEvent.setup();
    const recorded = record();
    mountView(selectView(recorded.props));
    await user.click(trigger());
    await screen.findByRole('listbox');
    await user.click(must(document.getElementById('empty')));
    await gone();
    expect(recorded.opens.at(-1)).toEqual(false);
    // The press moved the focus off the trigger: the highlighted item is chosen first.
    expect(recorded.values).toEqual(['Cake']);
  });

  it('closes when the trigger is clicked again', async () => {
    const user = userEvent.setup();
    const recorded = record();
    mountView(selectView(recorded.props));
    await user.click(trigger());
    await screen.findByRole('listbox');
    await user.click(trigger());
    await gone();
    expect(recorded.opens.at(-1)).toEqual(false);
  });
});

describe('Select multiple', () => {
  it('toggles values, stays open, and shows the values joined with a comma', async () => {
    const user = userEvent.setup();
    const recorded = record();
    mountView(selectView({ multiple: true, ...recorded.props }));
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Cake' }));
    await user.click(option('Steak'));
    expect(recorded.values.at(-1)).toEqual(['Cake', 'Steak']);
    expect(screen.getByRole('listbox')).toBeTruthy();
    expect(option('Cake').getAttribute('aria-selected')).toBe('true');
    expect(valueText()).toBe('Cake, Steak');
    await user.click(option('Cake'));
    expect(recorded.values.at(-1)).toEqual(['Steak']);
    expect(recorded.values).toHaveLength(3);
  });
});

describe('Select value and open state', () => {
  it('is controlled with v-model', async () => {
    const user = userEvent.setup();
    const value = ref<unknown>('Cake');
    mountView(() =>
      selectView({ modelValue: value.value, 'onUpdate:modelValue': (next: unknown) => (value.value = next) })(),
    );
    expect(valueText()).toBe('Cake');
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Burger' }));
    expect(value.value).toBe('Burger');
    expect(valueText()).toBe('Burger');
  });

  it('keeps the value when the parent refuses the change', async () => {
    const user = userEvent.setup();
    mountView(selectView({ modelValue: 'Cake', 'onUpdate:modelValue': () => undefined }));
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Burger' }));
    expect(valueText()).toBe('Cake');
  });

  it('keeps its own value when it is not bound', async () => {
    const user = userEvent.setup();
    mountView(selectView());
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Steak' }));
    expect(valueText()).toBe('Steak');
  });

  it('shows a value written from outside without emitting valueChange', async () => {
    const value = ref<unknown>('Cake');
    const recorded = record();
    mountView(() => selectView({ modelValue: value.value, ...recorded.props })());
    value.value = 'Steak';
    await waitFor(() => {
      expect(valueText()).toBe('Steak');
    });
    expect(recorded.values).toEqual([]);
  });

  it('renders a component that wraps it', () => {
    const Wrapper = defineComponent({
      setup: () => () => selectRoot({ modelValue: 'Cake' }, { items: () => [item('Cake')] }),
    });
    mountView(() => h(Wrapper));
    expect(valueText()).toBe('Cake');
  });
});
