// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen } from '@testing-library/vue';
import { h } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { selectAnatomy } from '@cocokits/machines/select';
import { defineThemeConfig } from '@cocokits/shared';
import { ThemeProvider } from '@cocokits/vue-core';
import {
  SelectEmpty,
  SelectFooter,
  SelectGroup,
  SelectHeader,
  SelectItemIndicator,
  SelectItemText,
  SelectLabel,
  SelectOptionDescription,
  SelectOptionLeading,
  SelectSearch,
  SelectSeparator,
} from '../index';
import { mountView, ObjectItem, selectRoot, stubOverlayBrowser } from './fixtures';

const parts = Object.keys(selectAnatomy.parts) as (keyof typeof selectAnatomy.parts)[];

// An option that targets every part of the anatomy.
const themeConfig = defineThemeConfig({
  name: 'test',
  components: {
    [selectAnatomy.block]: { probe: { attrName: 'probe', values: ['on'], default: 'on', partNames: parts } },
  },
});

beforeEach(() => {
  stubOverlayBrowser();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

// Every part is on the page: a search, a footer, the count of a multiple Select and the parts of an option.
const dishes = () =>
  selectRoot(
    { modelValue: ['Cake', 'Steak'], multiple: true, filter: true },
    {
      items: () => [
        h(SelectHeader, null, () => h(SelectSearch)),
        h(SelectGroup, null, () => [
          h(SelectLabel, null, () => 'Desserts'),
          h(ObjectItem, { value: 'Cake' }, () => [
            h(SelectOptionLeading, null, () => 'icon'),
            h(SelectItemIndicator),
            h(SelectItemText, null, () => 'Cake'),
            h(SelectOptionDescription, null, () => 'Sweet'),
          ]),
        ]),
        h(SelectSeparator),
        h(SelectEmpty, null, () => 'No dish'),
        h(SelectFooter, null, () => 'Footer'),
      ],
    },
  );

describe('Select theme', () => {
  it('puts the theme attribute on every part, the internal and the portaled ones included', async () => {
    const user = userEvent.setup();
    mountView(() => h(ThemeProvider, { themeConfig }, () => dishes()));
    await user.click(screen.getByRole('combobox', { name: 'Dish' }));
    await screen.findByRole('listbox');
    await user.type(screen.getByRole('combobox', { name: 'Search' }), 'zzz');
    for (const part of parts.filter((name) => name !== 'placeholder')) {
      const element = document.querySelector(`.${selectAnatomy.classes[part]}`);
      expect(element, part).not.toBeNull();
      expect(element?.getAttribute('data-probe'), part).toBe('on');
    }
  });

  it('puts the theme attribute on the placeholder while nothing is selected', () => {
    mountView(() =>
      h(ThemeProvider, { themeConfig }, () => selectRoot({ placeholder: 'Choose' }, { items: () => [] })),
    );
    expect(document.querySelector(`.${selectAnatomy.classes.placeholder}`)?.getAttribute('data-probe')).toBe('on');
  });

  it('renders no theme attribute without a theme', async () => {
    const user = userEvent.setup();
    mountView(() => dishes());
    await user.click(screen.getByRole('combobox'));
    await screen.findByRole('listbox');
    expect(document.querySelector('[data-probe]')).toBeNull();
  });
});
