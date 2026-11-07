// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen, waitFor } from '@testing-library/vue';
import { h } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { selectAnatomy, selectMeta } from '@cocokits/machines/select';
import { FormField } from '../../form-field';
import { Label } from '../../label';
import { SelectGroup, SelectLabel } from '../index';
import { undeclaredData } from '../../internal/tests/declared-data';
import { item, mountView, ObjectItem, selectRoot, selectView, settle, stubOverlayBrowser } from './fixtures';

/** The open list sits outside any landmark, because a component test has no page around it. */
const WITHOUT_REGION = { rules: { region: { enabled: false } } };

beforeEach(() => {
  stubOverlayBrowser();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('Select accessibility', () => {
  it('is a select-only combobox: a named button with the listbox popup, owning a listbox of options', async () => {
    const user = userEvent.setup();
    mountView(() =>
      selectRoot(
        { modelValue: 'Cake' },
        {
          items: () => [
            h(SelectGroup, null, () => [h(SelectLabel, null, () => 'Desserts'), item('Cake')]),
            item('Pizza', 'Pizza', { disabled: true }),
          ],
        },
      ),
    );
    const trigger = screen.getByRole('combobox', { name: 'Dish' });
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger.getAttribute('aria-haspopup')).toBe('listbox');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    await user.click(trigger);
    const list = await screen.findByRole('listbox', { name: 'Dish' });
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe(list.id);
    const cake = screen.getByRole('option', { name: 'Cake' });
    await waitFor(() => {
      expect(trigger.getAttribute('aria-activedescendant')).toBe(cake.id);
    });
    expect(cake.getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('option', { name: 'Pizza' }).getAttribute('aria-selected')).toBe('false');
    expect(screen.getByRole('option', { name: 'Pizza' }).getAttribute('aria-disabled')).toBe('true');
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(trigger.hasAttribute('aria-controls')).toBe(false);
    });
  });

  it('has no axe violations closed, open, multiple, and inside a FormField', async () => {
    const user = userEvent.setup();
    mountView(() =>
      h('main', [
        h(
          FormField,
          {},
          {
            label: () => h(Label, null, () => 'Dish'),
            default: () =>
              selectRoot(
                { multiple: true, placeholder: 'Choose', name: 'dish', required: true },
                {
                  unnamed: true,
                  items: () => [
                    h(SelectGroup, null, () => [h(SelectLabel, null, () => 'Desserts'), item('Cake')]),
                    item('Pizza'),
                  ],
                },
              ),
          },
        ),
      ]),
    );
    await settle();
    expect((await axe(document.body)).violations).toEqual([]);
    await user.click(screen.getByRole('combobox'));
    await screen.findByRole('listbox');
    await user.keyboard('{ArrowDown}');
    expect((await axe(document.body, WITHOUT_REGION)).violations).toEqual([]);
    await user.keyboard(' ');
    expect((await axe(document.body, WITHOUT_REGION)).violations).toEqual([]);
  });

  it('names the open listbox by the Label of its FormField, and an author aria-label still wins', async () => {
    const user = userEvent.setup();
    const field = (rootProps: Record<string, unknown>) => () =>
      h('main', [
        h(
          FormField,
          {},
          {
            label: () => h(Label, null, () => 'Dish'),
            default: () =>
              selectRoot({ placeholder: 'Choose', ...rootProps }, { unnamed: true, items: () => item('Cake') }),
          },
        ),
      ]);
    mountView(field({}));
    await user.click(screen.getByRole('combobox'));
    const listbox = await screen.findByRole('listbox', { name: 'Dish' });
    const label = document.querySelector('label');
    expect(label?.id).not.toBe('');
    expect(listbox.getAttribute('aria-labelledby')).toBe(label?.id);
    expect((await axe(document.body, WITHOUT_REGION)).violations).toEqual([]);
    cleanup();
    document.body.innerHTML = '';
    mountView(field({ 'aria-label': 'Meal' }));
    await user.click(screen.getByRole('combobox'));
    expect((await screen.findByRole('listbox', { name: 'Meal' })).hasAttribute('aria-labelledby')).toBe(false);
  });

  it('names the open listbox by an author id on the Label', async () => {
    const user = userEvent.setup();
    mountView(() =>
      h('main', [
        h(
          FormField,
          {},
          {
            label: () => h(Label, { id: 'mine' }, () => 'Dish'),
            default: () => selectRoot({ placeholder: 'Choose' }, { unnamed: true, items: () => item('Cake') }),
          },
        ),
      ]),
    );
    await user.click(screen.getByRole('combobox'));
    const listbox = await screen.findByRole('listbox', { name: 'Dish' });
    expect(document.querySelector('label')?.id).toBe('mine');
    expect(listbox.getAttribute('aria-labelledby')).toBe('mine');
  });

  it('warns in development about an option that holds a focusable element', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const user = userEvent.setup();
    mountView(() =>
      selectRoot({}, { items: () => h(ObjectItem, { value: 'Cake' }, () => h('a', { href: '#x' }, 'Cake')) }),
    );
    await user.click(screen.getByRole('combobox'));
    await screen.findByRole('listbox');
    await waitFor(() => {
      expect(warn.mock.calls.some(([message]) => String(message).includes('focusable'))).toBe(true);
    });
  });

  it('warns in development about a Select with no accessible name', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mountView(() => selectRoot({}, { unnamed: true, items: () => item('Cake') }));
    await waitFor(() => {
      expect(warn.mock.calls.some(([message]) => String(message).includes('accessible name'))).toBe(true);
    });
  });

  it('does not warn about a name when the Select is labelled', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mountView(selectView());
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(warn).not.toHaveBeenCalled();
  });
});

describe('Select data attributes', () => {
  it('emits only the data-* the meta declares on each part', async () => {
    mountView(() =>
      selectRoot(
        { modelValue: 'Cake', required: true },
        {
          items: () => [
            h(SelectGroup, null, () => [
              h(SelectLabel, null, () => 'Desserts'),
              item('Cake'),
              item('Pie', 'Pie', { disabled: true }),
            ]),
          ],
        },
      ),
    );
    await userEvent.click(screen.getByRole('combobox'));
    await settle();
    const { undeclared, found } = undeclaredData(selectAnatomy.classes, selectMeta.dataAttrs);
    expect(found).toEqual(expect.arrayContaining(['root', 'trigger', 'content', 'option', 'optionGroup']));
    expect(undeclared).toEqual([]);
  });
});
