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
    <Dishes defaultValue="Cake">
      <Select.Group>
        <Select.Label>Desserts</Select.Label>
        <Opt value="Cake">Cake</Opt>
      </Select.Group>
      <Select.Separator />
    </Dishes>
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
    for (const part of parts.filter((name) => name !== 'placeholder')) {
      const element = document.querySelector(`.${selectAnatomy.classes[part]}`);
      expect(element, part).not.toBeNull();
      expect(element?.getAttribute('data-probe'), part).toBe('on');
    }
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
