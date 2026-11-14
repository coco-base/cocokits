import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideCckTheme } from '@cocokits/angular-core';
import { selectAnatomy } from '@cocokits/machines/select';
import { defineThemeConfig } from '@cocokits/shared';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckSelectImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';

const parts = [
  'root',
  'trigger',
  'placeholder',
  'value',
  'dropdownIcon',
  'content',
  'option',
  'optionIndicator',
  'optionContent',
  'optionGroup',
  'optionGroupLabel',
] as const;

// An option that targets every part.
const themeConfig = defineThemeConfig({
  name: 'test',
  components: {
    [selectAnatomy.block]: {
      probe: { attrName: 'probe', values: ['on'], default: 'on', partNames: [...parts] },
    },
  },
});

const template = `
  <cck-select aria-label="Dish" value="Cake">
    <cck-select-option-group label="Desserts"><cck-select-option value="Cake">Cake</cck-select-option></cck-select-option-group>
  </cck-select>`;

describe('Select theme', () => {
  beforeEach(() => {
    stubOverlayApis();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('puts the theme attribute on every part, the internal and the portaled ones included', async () => {
    const user = userEvent.setup();
    await render(
      `<cck-select aria-label="Dish" placeholder="Choose"><cck-select-option-group label="D"><cck-select-option value="Cake">Cake</cck-select-option></cck-select-option-group></cck-select>`,
      {
        imports: [...CckSelectImports],
        providers: [provideCckTheme(themeConfig)],
      },
    );
    expect(document.querySelector(`.${selectAnatomy.classes.placeholder}`)?.getAttribute('data-probe')).toBe('on');
    await user.click(screen.getByRole('combobox'));
    await screen.findByRole('listbox');
    for (const part of parts.filter((name) => name !== 'value')) {
      const element = document.querySelector(`.${selectAnatomy.classes[part]}`);
      expect(element, part).not.toBeNull();
      expect(element?.getAttribute('data-probe'), part).toBe('on');
    }
  });

  it('puts the theme attribute on the value part while something is selected', async () => {
    await render(template, { imports: [...CckSelectImports], providers: [provideCckTheme(themeConfig)] });
    expect(document.querySelector(`.${selectAnatomy.classes.value}`)?.getAttribute('data-probe')).toBe('on');
  });

  it('renders no theme attribute without a theme', async () => {
    const user = userEvent.setup();
    await render(template, { imports: [...CckSelectImports] });
    await user.click(screen.getByRole('combobox'));
    await screen.findByRole('listbox');
    expect(document.querySelector('[data-probe]')).toBeNull();
  });
});
