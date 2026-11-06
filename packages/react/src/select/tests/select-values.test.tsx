// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Select } from '../index';
import { active, Dishes, Opt, reasonsOf, stubTopLayer, trigger, valueText } from './fixtures';

beforeEach(() => {
  stubTopLayer();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('Select value types', () => {
  it('types a single Select as T or null and a multiple one as a list', () => {
    function Single(): ReactElement {
      const [dish, setDish] = useState<string | null>(null);
      return (
        <Select.Root value={dish} onValueChange={setDish}>
          <Select.Trigger aria-label="Dish" />
        </Select.Root>
      );
    }
    function Multiple(): ReactElement {
      const [dishes, setDishes] = useState<readonly string[]>([]);
      return (
        <Select.Root multiple value={dishes} onValueChange={setDishes}>
          <Select.Trigger aria-label="Dish" />
        </Select.Root>
      );
    }
    function Wrong(): ReactElement {
      const [dish, setDish] = useState<string | null>(null);
      return (
        // @ts-expect-error a single value bound to a multiple Select
        <Select.Root multiple value={dish} onValueChange={setDish}>
          <Select.Trigger aria-label="Dish" />
        </Select.Root>
      );
    }
    render(
      <>
        <Single />
        <Multiple />
      </>,
    );
    expect(screen.getAllByRole('combobox')).toHaveLength(2);
    expect(Wrong).toBeTypeOf('function');
  });
});

describe('Select clearing items', () => {
  it('clears a single Select with a null item and reports null', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Dishes placeholder="Choose" defaultValue="Cake" onValueChange={onValueChange}>
        <Opt value={null}>None</Opt>
        <Opt value="Cake">Cake</Opt>
      </Dishes>,
    );
    expect(valueText()).toBe('Cake');
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'None' }));
    expect(reasonsOf(onValueChange)).toEqual([[null, 'user']]);
    expect(trigger().querySelector('.cck-select__placeholder')?.textContent).toBe('Choose');
    expect(trigger().closest('.cck-select')?.hasAttribute('data-placeholder-shown')).toBe(true);
  });

  it('starts empty as null and resets to null', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <form>
        <Dishes name="dish" onValueChange={onValueChange}>
          <Opt value="Cake">Cake</Opt>
        </Dishes>
      </form>,
    );
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Cake' }));
    onValueChange.mockClear();
    container.querySelector('form')?.reset();
    await waitFor(() => {
      expect(onValueChange).toHaveBeenCalledTimes(1);
    });
    expect(onValueChange.mock.calls[0]?.[0]).toBeNull();
  });
});

describe('Select multiple order', () => {
  it('keeps the values in selection order and shows the labels in that order', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Dishes multiple onValueChange={onValueChange}>
        <Opt value="Cake">Cake</Opt>
        <Opt value="Pizza">Pizza</Opt>
        <Opt value="Steak">Steak</Opt>
      </Dishes>,
    );
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Steak' }));
    await user.click(screen.getByRole('option', { name: 'Cake' }));
    expect(onValueChange.mock.calls.at(-1)?.[0]).toEqual(['Steak', 'Cake']);
    expect(valueText()).toBe('Steak, Cake');
  });
});

describe('Select type to search', () => {
  it('matches the textValue before the text of the item', async () => {
    const user = userEvent.setup();
    render(
      <Dishes>
        <Select.Item value="a" textValue="Zebra">
          <Select.ItemText>Apple</Select.ItemText>
        </Select.Item>
        <Opt value="b">Banana</Opt>
      </Dishes>,
    );
    await user.tab();
    await user.keyboard('z');
    await screen.findByRole('listbox');
    expect(trigger().getAttribute('aria-activedescendant')).toBe(screen.getAllByRole('option')[0]?.id);
  });

  it('matches the text of the ItemText, not an icon or other text in the item', async () => {
    const user = userEvent.setup();
    render(
      <Dishes>
        <Select.Item value="a">
          <span>Hidden</span>
          <Select.ItemText>Apple</Select.ItemText>
        </Select.Item>
        <Opt value="h">Honey</Opt>
      </Dishes>,
    );
    await user.tab();
    await user.keyboard('{ArrowDown}h');
    expect(active()).toBe('Honey');
  });

  it('ignores case and accents', async () => {
    const user = userEvent.setup();
    render(
      <Dishes>
        <Opt value="a">Apple</Opt>
        <Opt value="e">Éclair</Opt>
      </Dishes>,
    );
    await user.tab();
    await user.keyboard('{ArrowDown}e');
    expect(active()).toBe('Éclair');
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).toBeNull();
    });
  });

  it('takes a space as part of a running search, and a space with no search opens', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Dishes onValueChange={onValueChange}>
        <Opt value="n">New Jersey</Opt>
        <Opt value="y">New York</Opt>
        <Opt value="o">Ohio</Opt>
      </Dishes>,
    );
    await user.tab();
    await user.keyboard('{ArrowDown}new y');
    expect(active()).toBe('New York');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('listbox')).toBeTruthy();
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).toBeNull();
    });
    await new Promise((resolve) => setTimeout(resolve, 600));
    await user.keyboard(' ');
    expect(await screen.findByRole('listbox')).toBeTruthy();
  });
});

describe('Select disabled items and groups', () => {
  it('skips disabled items and the items of a disabled group for keys and typeahead, and never chooses them', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Dishes onValueChange={onValueChange}>
        <Opt value="a" disabled>
          Alpha
        </Opt>
        <Select.Group disabled>
          <Select.Label>Sold out</Select.Label>
          <Opt value="b">Beta</Opt>
        </Select.Group>
        <Select.Separator />
        <Opt value="g">Gamma</Opt>
      </Dishes>,
    );
    await user.tab();
    await user.keyboard('{ArrowDown}');
    expect(active()).toBe('Gamma');
    await user.keyboard('{ArrowUp}');
    expect(active()).toBe('Gamma');
    await user.keyboard('b');
    expect(active()).toBe('Gamma');
    await user.click(screen.getByRole('option', { name: 'Beta' }));
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe('Select labels from the trigger', () => {
  it('gives the aria-* of the trigger to the trigger and to the list label', async () => {
    const user = userEvent.setup();
    render(
      <>
        <span id="name">Meal</span>
        <Dishes label={null} triggerProps={{ 'aria-labelledby': 'name' }}>
          <Opt value="a">Alpha</Opt>
        </Dishes>
      </>,
    );
    expect(screen.getByRole('combobox', { name: 'Meal' })).toBe(trigger());
    await user.click(trigger());
    const list = await screen.findByRole('listbox', { name: 'Meal' });
    expect(list.getAttribute('aria-labelledby')).toBe('name');
  });
});
