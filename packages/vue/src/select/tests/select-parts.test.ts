// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen, waitFor } from '@testing-library/vue';
import { h } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { selectAnatomy } from '@cocokits/machines/select';
import {
  SelectContent,
  SelectGroup,
  SelectIcon,
  SelectItemIndicator,
  SelectItemText,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../index';
import { item, mountView, ObjectItem, ObjectRoot, record, selectRoot, settle, stubOverlayBrowser } from './fixtures';

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

const trigger = (): HTMLElement => screen.getByRole('combobox');
const option = (name: string): HTMLElement => screen.getByRole('option', { name });
const active = (): string =>
  document.getElementById(trigger().getAttribute('aria-activedescendant') ?? '')?.textContent.trim() ?? '';
const gone = (): Promise<void> =>
  waitFor(() => {
    expect(screen.queryByRole('listbox')).toBeNull();
  });

describe('Select part elements', () => {
  it('renders a div for the Root, Content, Item and Group, a button for the Trigger and spans for the rest', async () => {
    mountView(() =>
      selectRoot(
        { open: true },
        {
          items: () => h(SelectGroup, null, () => [h(SelectLabel, null, () => 'Desserts'), item('Cake')]),
        },
      ),
    );
    await settle();
    expect(trigger().closest(`.${classes.root}`)?.localName).toBe('div');
    expect(trigger().localName).toBe('button');
    expect(screen.getByRole('listbox').localName).toBe('div');
    expect(option('Cake').localName).toBe('div');
    expect(screen.getByRole('group').localName).toBe('div');
    expect(option('Cake').querySelector(`.${classes.optionIndicator}`)?.localName).toBe('span');
    expect(option('Cake').querySelector(`.${classes.optionContent}`)?.localName).toBe('span');
    expect(trigger().querySelector(`.${classes.dropdownIcon}`)?.localName).toBe('span');
  });

  it('keeps the role, classes and data-* on parts given with asChild or as', async () => {
    const user = userEvent.setup();
    const recorded = record();
    mountView(() =>
      h(ObjectRoot, { asChild: true, ...recorded.props }, () =>
        h('section', { class: 'mine', 'data-x': '1' }, [
          h(SelectTrigger, { 'aria-label': 'Dish', as: 'div' }, () => [
            h(SelectValue, { placeholder: 'Choose', as: 'p' }),
            h(SelectIcon),
          ]),
          h(SelectContent, null, () => [
            h(SelectGroup, { asChild: true }, () =>
              h('ul', { class: 'group-mine' }, [
                h(SelectLabel, { asChild: true }, () => h('li', 'Desserts')),
                h(ObjectItem, { asChild: true, value: 'Cake' }, () =>
                  h('li', { class: 'opt-mine' }, [
                    h(SelectItemIndicator),
                    h(SelectItemText, { as: 'b' }, () => 'Cake'),
                  ]),
                ),
                h(ObjectItem, { asChild: true, value: 'Pie', disabled: true }, () => h('li', 'Pie')),
              ]),
            ),
          ]),
        ]),
      ),
    );
    const root = trigger().closest('section');
    expect(root?.classList.contains(classes.root)).toBe(true);
    expect(root?.classList.contains('mine')).toBe(true);
    expect(root?.getAttribute('data-state')).toBe('closed');
    expect(root?.getAttribute('data-x')).toBe('1');
    expect(trigger().localName).toBe('div');
    expect(trigger().getAttribute('tabindex')).toBe('0');
    expect(trigger().hasAttribute('type')).toBe(false);
    expect(trigger().querySelector(`.${classes.placeholder}`)?.localName).toBe('p');
    await user.click(trigger());
    const cake = await screen.findByRole('option', { name: 'Cake' });
    expect(cake.localName).toBe('li');
    expect(cake.classList.contains(classes.option)).toBe(true);
    expect(cake.classList.contains('opt-mine')).toBe(true);
    expect(cake.querySelector(`.${classes.optionIndicator}`)).not.toBeNull();
    expect(cake.querySelector(`.${classes.optionContent}`)?.localName).toBe('b');
    expect(option('Pie').getAttribute('data-disabled')).not.toBeNull();
    const group = screen.getByRole('group');
    expect(group.localName).toBe('ul');
    expect(group.classList.contains(classes.optionGroup)).toBe(true);
    expect(group.getAttribute('aria-labelledby')).toBe(group.querySelector(`.${classes.optionGroupLabel}`)?.id);
    await user.click(cake);
    await gone();
    expect(recorded.values).toEqual(['Cake']);
  });
});

describe('Select keyboard', () => {
  it('cycles through the options that share a first letter on a repeated character', async () => {
    const user = userEvent.setup();
    mountView(() => selectRoot({}, { items: () => ['Cake', 'Salad', 'Soup', 'Steak'].map((dish) => item(dish)) }));
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await user.keyboard('s');
    expect(active()).toBe('Salad');
    await user.keyboard('s');
    expect(active()).toBe('Soup');
    await user.keyboard('s');
    expect(active()).toBe('Steak');
  });

  it('toggles values with Enter and Space in a multiple Select and keeps the list open', async () => {
    const user = userEvent.setup();
    const recorded = record();
    mountView(() => selectRoot({ multiple: true, ...recorded.props }, { items: () => [item('Cake'), item('Burger')] }));
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await user.keyboard('{Enter}');
    expect(recorded.values.at(-1)).toEqual(['Cake']);
    expect(screen.getByRole('listbox')).toBeTruthy();
    await user.keyboard('{ArrowDown}{ }');
    expect(recorded.values.at(-1)).toEqual(['Cake', 'Burger']);
    expect(screen.getByRole('listbox')).toBeTruthy();
    await user.keyboard('{Enter}');
    expect(recorded.values.at(-1)).toEqual(['Cake']);
    expect(screen.getByRole('listbox')).toBeTruthy();
  });

  it('closes a multiple Select on Tab without a change and lets the focus move on', async () => {
    const user = userEvent.setup();
    const recorded = record();
    mountView(() => [
      selectRoot({ multiple: true, ...recorded.props }, { items: () => [item('Cake'), item('Burger')] }),
      h('button', { id: 'after' }, 'after'),
    ]);
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await user.tab();
    await gone();
    expect(recorded.values).toEqual([]);
    expect(document.activeElement).toBe(document.getElementById('after'));
  });
});
