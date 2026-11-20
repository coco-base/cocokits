// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen, waitFor } from '@testing-library/vue';
import { h, type VNode } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  SelectEmpty,
  SelectFooter,
  SelectHeader,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectOptionDescription,
  SelectOptionLeading,
  SelectSearch,
  type SelectSearchProps,
} from '../index';
import {
  gone,
  item,
  mountView,
  ObjectItem,
  record,
  selectView,
  settle,
  stubOverlayBrowser,
  trigger,
  valueText,
} from './fixtures';

beforeEach(() => {
  stubOverlayBrowser();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const onAdd = vi.fn();

/** Header with the search, three dishes, the empty text and a footer with one action (select-07, -08). */
const searchItems = (): VNode[] => [
  h(SelectHeader, null, () => h(SelectSearch)),
  item('Cake'),
  item('Burger'),
  item('Steak'),
  h(SelectEmpty, null, () => 'No dish found'),
  h(SelectFooter, null, () => h('button', { type: 'button', onClick: onAdd }, 'Add a dish')),
];

const search = (): HTMLInputElement => screen.getByRole<HTMLInputElement>('combobox', { name: 'Search' });
const content = (): HTMLElement => screen.getByRole('listbox');
/** The texts of the options the query shows. */
const shown = (): string[] =>
  screen
    .getAllByRole('option', { hidden: true })
    .filter((element) => !element.hasAttribute('hidden'))
    .map((element) => element.textContent.trim());

async function openWithFilter(rootProps: Record<string, unknown> = {}): Promise<ReturnType<typeof userEvent.setup>> {
  const user = userEvent.setup();
  mountView(selectView({ filter: true, ...rootProps }, { items: searchItems }));
  await user.click(trigger());
  await screen.findByRole('listbox');
  await settle();
  return user;
}

describe('Select filter (select-07)', () => {
  it('renders the search as a combobox input that controls the list, and puts the focus in it', async () => {
    await openWithFilter();
    expect(search().type).toBe('search');
    expect(search().getAttribute('aria-expanded')).toBe('true');
    expect(search().getAttribute('aria-controls')).toBe(content().id);
    expect(search().getAttribute('aria-autocomplete')).toBe('list');
    expect(document.activeElement).toBe(search());
    expect(document.querySelector('.cck-select__header')?.contains(search())).toBe(true);
    // The trigger gives up the highlighted option while the search keeps the focus.
    expect(screen.getByRole('combobox', { name: 'Dish' }).hasAttribute('aria-activedescendant')).toBe(false);
  });

  it.each([
    { filter: false, hidden: true, children: 0, search: 0 },
    { filter: true, hidden: false, children: 1, search: 1 },
  ])('renders the header hidden and empty without filter ($filter)', async ({ filter, hidden, children, search }) => {
    const user = userEvent.setup();
    mountView(selectView({ filter }, { items: searchItems }));
    await user.click(trigger());
    await screen.findByRole('listbox');
    const header = document.querySelector('.cck-select__header');
    expect(header?.hasAttribute('hidden')).toBe(hidden);
    expect(header?.childElementCount).toBe(children);
    expect(header?.className).toBe('cck-select__header');
    expect(document.querySelectorAll('.cck-select__search')).toHaveLength(search);
  });

  it('keeps the options whose text contains the query, ignoring case, and highlights the first', async () => {
    const user = await openWithFilter();
    await user.type(search(), 'UR');
    expect(shown()).toEqual(['Burger']);
    expect(document.getElementById(search().getAttribute('aria-activedescendant') ?? '')?.textContent.trim()).toBe(
      'Burger',
    );
    await user.clear(search());
    expect(shown()).toEqual(['Cake', 'Burger', 'Steak']);
  });

  it('shows the empty status while nothing matches, and the footer all the time', async () => {
    const user = await openWithFilter();
    const status = screen.getByRole('status');
    expect(status.textContent).toBe('');
    expect(content().hasAttribute('data-empty')).toBe(false);
    await user.type(search(), 'zzz');
    expect(content().hasAttribute('data-empty')).toBe(true);
    expect(screen.getByRole('status')).toBe(status);
    expect(status.textContent).toBe('No dish found');
    expect(document.querySelector('.cck-select__footer')).not.toBeNull();
  });

  it('moves the highlight with the arrows and chooses with Enter, then returns the focus to the trigger', async () => {
    const recorded = record();
    const user = await openWithFilter(recorded.props);
    await user.type(search(), 'e');
    await user.keyboard('{ArrowDown}');
    expect(document.getElementById(search().getAttribute('aria-activedescendant') ?? '')?.textContent.trim()).toBe(
      'Burger',
    );
    await user.keyboard('{Enter}');
    expect(recorded.values.at(-1)).toBe('Burger');
    await gone();
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger());
    });
    expect(valueText()).toBe('Burger');
  });

  it('closes on Escape, returns the focus to the trigger and clears the query for the next open', async () => {
    const user = await openWithFilter();
    await user.type(search(), 'bur');
    await user.keyboard('{Escape}');
    await gone();
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger());
    });
    await user.click(trigger());
    await screen.findByRole('listbox');
    expect(search().value).toBe('');
    expect(shown()).toEqual(['Cake', 'Burger', 'Steak']);
  });

  it('closes on Tab, and a press on the footer keeps the list open', async () => {
    const user = await openWithFilter();
    await user.click(screen.getByRole('button', { name: 'Add a dish' }));
    expect(onAdd).toHaveBeenCalledOnce();
    expect(screen.getByRole('listbox')).toBeTruthy();
    search().focus();
    await user.tab();
    await gone();
  });

  it('chooses nothing when a press outside closes the list', async () => {
    const recorded = record();
    const user = await openWithFilter(recorded.props);
    await user.type(search(), 'e');
    await user.click(document.body);
    await gone();
    expect(recorded.values).toEqual([]);
  });
});

describe('Select search element', () => {
  it('is a native search input and accepts no as or asChild', async () => {
    const user = await openWithFilter();
    expect(search().tagName).toBe('INPUT');
    expect(search().type).toBe('search');
    await user.keyboard('{Escape}');
    // @ts-expect-error The search always renders an input.
    const props: SelectSearchProps = { as: 'div' };
    expect(props).toBeDefined();
  });
});

describe('Select count (select-06)', () => {
  it.each([
    { name: 'one value shows no count', value: ['Cake'], text: 'Cake', count: null },
    { name: 'two values show +1', value: ['Cake', 'Steak'], text: 'Cake', count: '+1' },
    { name: 'three values show +2', value: ['Cake', 'Burger', 'Steak'], text: 'Cake', count: '+2' },
    { name: 'no value shows the placeholder only', value: [], text: undefined, count: null },
  ])('$name', ({ value, text, count }) => {
    mountView(selectView({ multiple: true, modelValue: value }));
    expect(valueText()).toBe(text);
    expect(trigger().querySelector('.cck-select__count')?.textContent ?? null).toBe(count);
  });

  it('renders no count for a single Select', () => {
    mountView(selectView({ modelValue: 'Cake' }));
    expect(document.querySelector('.cck-select__count')).toBeNull();
  });

  it('renders the count right after the value, without author markup', () => {
    mountView(selectView({ multiple: true, modelValue: ['Cake', 'Steak'] }));
    const value = trigger().querySelector('.cck-select__value');
    expect(value).not.toBeNull();
    expect(value?.nextElementSibling?.className).toContain('cck-select__count');
    expect(value?.nextElementSibling?.textContent).toBe('+1');
  });

  it('is part of the trigger text for assistive technology', () => {
    mountView(selectView({ multiple: true, modelValue: ['Cake', 'Steak'] }));
    expect(trigger().textContent).toContain('Cake');
    expect(trigger().textContent).toContain('+1');
  });
});

describe('Select option parts (select-09)', () => {
  it('renders the leading part hidden from assistive technology and describes the option by its description', async () => {
    const user = userEvent.setup();
    mountView(
      selectView(
        {},
        {
          items: () => [
            h(ObjectItem, { value: 'Cake' }, () => [
              h(SelectItemIndicator),
              h(SelectOptionLeading, null, () => 'icon'),
              h(SelectItemText, null, () => 'Cake'),
              h(SelectOptionDescription, null, () => 'Sweet'),
            ]),
            h(SelectItem as never, { value: 'Soup' }, () => [h(SelectItemText, null, () => 'Soup')]),
          ],
        },
      ),
    );
    await user.click(trigger());
    await screen.findByRole('listbox');
    const leading = document.querySelector('.cck-select__option-leading');
    expect(leading?.getAttribute('aria-hidden')).toBe('true');
    const description = document.querySelector('.cck-select__option-description');
    expect(description?.id).toBeTruthy();
    const cake = screen.getAllByRole('option').find((element) => element.textContent.includes('Cake'));
    expect(cake?.getAttribute('aria-describedby')).toBe(description?.id);
    const soup = screen.getAllByRole('option').find((element) => element.textContent.includes('Soup'));
    expect(soup?.hasAttribute('aria-describedby')).toBe(false);
  });
});
