// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen } from '@testing-library/vue';
import { h } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { selectAnatomy } from '@cocokits/machines/select';
import { defineThemeConfig } from '@cocokits/shared';
import { ThemeProvider } from '@cocokits/vue-core';
import { SelectGroup, SelectLabel, SelectSeparator } from '../index';
import { item, mountView, selectRoot, stubOverlayBrowser } from './fixtures';

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

const dishes = () =>
  selectRoot(
    { modelValue: 'Cake' },
    {
      items: () => [
        h(SelectGroup, null, () => [h(SelectLabel, null, () => 'Desserts'), item('Cake')]),
        h(SelectSeparator),
      ],
    },
  );

describe('Select theme', () => {
  it('puts the theme attribute on every part, the internal and the portaled ones included', async () => {
    const user = userEvent.setup();
    mountView(() => h(ThemeProvider, { themeConfig }, () => dishes()));
    await user.click(screen.getByRole('combobox'));
    await screen.findByRole('listbox');
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
