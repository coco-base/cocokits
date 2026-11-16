// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { selectAnatomy } from '@cocokits/machines/select';
import { ThemeProvider } from '@cocokits/react-core';
import { defineThemeConfig } from '@cocokits/shared';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Select } from '../index';
import { stubTopLayer, Dishes, Opt } from './fixtures';

const parts = Object.keys(selectAnatomy.parts) as (keyof typeof selectAnatomy.parts)[];

// An option that targets every part of the anatomy.
const themeConfig = defineThemeConfig({
  name: 'test',
  components: {
    [selectAnatomy.block]: { probe: { attrName: 'probe', values: ['on'], default: 'on', partNames: parts } },
  },
});

beforeEach(() => {
  stubTopLayer();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

function Menu(): ReactElement {
  return (
    <Select.Root multiple filter defaultValue={['Cake', 'Steak']}>
      <Select.Trigger aria-label="Dish">
        <Select.Value />
        <Select.Count />
        <Select.Icon />
      </Select.Trigger>
      <Select.Content>
        <Select.Header>
          <Select.Search />
        </Select.Header>
        <Select.Group>
          <Select.Label>Desserts</Select.Label>
          <Select.Item value="Cake">
            <Select.OptionLeading>L</Select.OptionLeading>
            <Select.ItemIndicator />
            <Select.ItemText>Cake</Select.ItemText>
            <Select.OptionDescription>Sweet</Select.OptionDescription>
          </Select.Item>
          <Opt value="Steak">Steak</Opt>
        </Select.Group>
        <Select.Separator />
        <Select.Empty>No dish</Select.Empty>
        <Select.Footer>Actions</Select.Footer>
      </Select.Content>
    </Select.Root>
  );
}

describe('Select theme', () => {
  it('puts the theme attribute on every part, the internal and the portaled ones included', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider themeConfig={themeConfig}>
        <Menu />
      </ThemeProvider>,
    );
    await user.click(screen.getByRole('combobox'));
    await screen.findByRole('listbox');
    // The placeholder shows while nothing is selected, the empty part while nothing matches: tested below.
    for (const part of parts.filter((name) => name !== 'placeholder' && name !== 'empty')) {
      const element = document.querySelector(`.${selectAnatomy.classes[part]}`);
      expect(element, part).not.toBeNull();
      expect(element?.getAttribute('data-probe'), part).toBe('on');
    }
  });

  it('puts the theme attribute on the empty part while nothing matches', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider themeConfig={themeConfig}>
        <Menu />
      </ThemeProvider>,
    );
    await user.click(screen.getByRole('combobox'));
    await user.type(await screen.findByRole('combobox', { name: 'Search' }), 'zzz');
    expect(document.querySelector(`.${selectAnatomy.classes.empty}`)?.getAttribute('data-probe')).toBe('on');
  });

  it('puts the theme attribute on the placeholder while nothing is selected', () => {
    render(
      <ThemeProvider themeConfig={themeConfig}>
        <Dishes placeholder="Choose" />
      </ThemeProvider>,
    );
    expect(document.querySelector(`.${selectAnatomy.classes.placeholder}`)?.getAttribute('data-probe')).toBe('on');
  });

  it('renders no theme attribute without a theme', async () => {
    const user = userEvent.setup();
    render(<Menu />);
    await user.click(screen.getByRole('combobox'));
    await screen.findByRole('listbox');
    expect(document.querySelector('[data-probe]')).toBeNull();
  });
});
