// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode, useState, type ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Select } from '../index';
import { Opt, stubTopLayer, trigger } from './fixtures';

beforeEach(() => {
  stubTopLayer();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const search = (): HTMLInputElement => screen.getByRole('combobox', { name: 'Search' });
const options = (): string[] =>
  screen
    .queryAllByRole('option')
    .filter((element) => !element.hasAttribute('hidden'))
    .map((element) => element.textContent.trim());
const triggerOf = (): HTMLElement => screen.getByRole('combobox', { name: 'Dish' });

function Searchable({
  onOpenChange,
  withGroup = false,
}: {
  readonly onOpenChange?: (open: boolean) => void;
  readonly withGroup?: boolean;
}): ReactElement {
  return (
    <StrictMode>
      <button>before</button>
      <Select.Root filter onOpenChange={onOpenChange}>
        <Select.Trigger aria-label="Dish">
          <Select.Value placeholder="Choose a dish" />
          <Select.Icon />
        </Select.Trigger>
        <Select.Content>
          <Select.Header>
            <Select.Search />
          </Select.Header>
          <Opt value="Cake">Cake</Opt>
          <Opt value="Burger">Burger</Opt>
          {withGroup && (
            <Select.Group>
              <Select.Label>Hot</Select.Label>
              <Opt value="Soup">Soup</Opt>
            </Select.Group>
          )}
          <Opt value="Steak">Steak</Opt>
          <Select.Empty>No dish found</Select.Empty>
          <Select.Footer>
            <button type="button">Add a dish</button>
          </Select.Footer>
        </Select.Content>
      </Select.Root>
    </StrictMode>
  );
}

const open = async (): Promise<void> => {
  await userEvent.click(triggerOf());
  await screen.findByRole('listbox');
};

describe('Select search', () => {
  it('renders the header, the search combobox, no empty part and the footer in the list', async () => {
    render(<Searchable />);
    await open();
    const list = screen.getByRole('listbox');
    expect(list.querySelector('.cck-select__header')?.tagName).toBe('DIV');
    expect(search().tagName).toBe('INPUT');
    expect(search().getAttribute('type')).toBe('search');
    expect(search().getAttribute('aria-expanded')).toBe('true');
    expect(search().getAttribute('aria-controls')).toBe(list.id);
    expect(search().getAttribute('aria-autocomplete')).toBe('list');
    expect(search().className).toBe('cck-select__search');
    expect(list.querySelector('.cck-select__empty')).toBeNull();
    expect(list.hasAttribute('data-empty')).toBe(false);
    expect(list.querySelector('.cck-select__footer')?.textContent).toBe('Add a dish');
  });

  it('moves the focus into the search input on open and keeps the trigger out of the highlight', async () => {
    render(<Searchable />);
    await open();
    await waitFor(() => {
      expect(document.activeElement).toBe(search());
    });
    expect(triggerOf().hasAttribute('aria-activedescendant')).toBe(false);
    expect(search().getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Cake' }).id);
  });

  it('narrows the options by contains, ignoring case, and highlights the first one left', async () => {
    render(<Searchable />);
    await open();
    await userEvent.type(search(), 'EAK');
    expect(options()).toEqual(['Steak']);
    expect(search().getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Steak' }).id);
    await userEvent.clear(search());
    await userEvent.type(search(), 'ur');
    expect(options()).toEqual(['Burger']);
  });

  it('shows the empty part as a polite status while nothing matches', async () => {
    render(<Searchable />);
    await open();
    await userEvent.type(search(), 'zzz');
    const empty = screen.getByRole('status');
    expect(empty.textContent).toBe('No dish found');
    expect(empty.className).toBe('cck-select__empty');
    expect(screen.getByRole('listbox').hasAttribute('data-empty')).toBe(true);
    expect(options()).toEqual([]);
    await userEvent.clear(search());
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('hides a group while the query matches none of its options', async () => {
    render(<Searchable withGroup />);
    await open();
    const group = screen.getByRole('group', { name: 'Hot' });
    expect(group.hasAttribute('hidden')).toBe(false);
    await userEvent.type(search(), 'cake');
    expect(group.hasAttribute('hidden')).toBe(true);
    await userEvent.clear(search());
    await userEvent.type(search(), 'sou');
    expect(group.hasAttribute('hidden')).toBe(false);
  });

  it('moves the highlight with the arrows over the shown options and chooses with Enter', async () => {
    const onOpenChange = vi.fn();
    render(<Searchable onOpenChange={onOpenChange} />);
    await open();
    await userEvent.keyboard('{ArrowDown}');
    expect(search().getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Burger' }).id);
    await userEvent.keyboard('{Enter}');
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).toBeNull();
    });
    expect(triggerOf().textContent).toBe('Burger');
    await waitFor(() => {
      expect(document.activeElement).toBe(triggerOf());
    });
  });

  it('clears the query when the list closes and returns the focus to the trigger on Escape', async () => {
    render(<Searchable />);
    await open();
    await userEvent.type(search(), 'cake');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).toBeNull();
    });
    await waitFor(() => {
      expect(document.activeElement).toBe(triggerOf());
    });
    await open();
    expect(search().value).toBe('');
    expect(options()).toEqual(['Cake', 'Burger', 'Steak']);
  });

  it('closes on Tab, as the Select does', async () => {
    render(<Searchable />);
    await open();
    await userEvent.tab();
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).toBeNull();
    });
  });

  it('does not close the list when a footer button is pressed, and the button takes the focus', async () => {
    render(<Searchable />);
    await open();
    const button = screen.getByRole('button', { name: 'Add a dish' });
    await userEvent.click(button);
    expect(screen.queryByRole('listbox')).not.toBeNull();
    expect(document.activeElement).toBe(button);
  });

  it('is controlled by an outer state without a search when filter is off', async () => {
    function Plain(): ReactElement {
      const [value, setValue] = useState<string | null>(null);
      return (
        <Select.Root
          value={value}
          onValueChange={(next) => {
            setValue(next);
          }}
        >
          <Select.Trigger aria-label="Dish">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Opt value="Cake">Cake</Opt>
            <Select.Empty>none</Select.Empty>
          </Select.Content>
        </Select.Root>
      );
    }
    render(<Plain />);
    await userEvent.click(trigger());
    await screen.findByRole('listbox');
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.queryByRole('combobox', { name: 'Search' })).toBeNull();
  });
});

describe('Select count and option parts', () => {
  function Multi({ value }: { readonly value: readonly string[] }): ReactElement {
    return (
      <Select.Root multiple defaultValue={value}>
        <Select.Trigger aria-label="Dishes">
          <Select.Value placeholder="Choose" />
          <Select.Count />
          <Select.Icon />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="Cake">
            <Select.OptionLeading>L</Select.OptionLeading>
            <Select.ItemText>Cake</Select.ItemText>
            <Select.OptionDescription>Sweet</Select.OptionDescription>
          </Select.Item>
          <Opt value="Burger">Burger</Opt>
          <Opt value="Steak">Steak</Opt>
        </Select.Content>
      </Select.Root>
    );
  }
  const count = (): Element | null => document.querySelector('.cck-select__count');

  it.each([
    ['nothing selected', [], null, ''],
    ['one value', ['Cake'], null, 'Cake'],
    ['two values', ['Cake', 'Steak'], '+1', 'Cake'],
    ['three values', ['Steak', 'Cake', 'Burger'], '+2', 'Steak'],
  ] as const)('shows the first value and the count for %s', (_name, value, text, first) => {
    render(<Multi value={value} />);
    expect(count()?.textContent ?? null).toBe(text);
    expect(document.querySelector('.cck-select__value')?.textContent ?? '').toBe(first);
  });

  it('follows a choice made in the list', async () => {
    render(<Multi value={['Cake']} />);
    expect(count()).toBeNull();
    await userEvent.click(trigger());
    await userEvent.click(await screen.findByRole('option', { name: 'Burger' }));
    expect(count()?.textContent).toBe('+1');
  });

  it('describes an option by its description and hides the leading part from assistive technology', async () => {
    render(<Multi value={[]} />);
    await userEvent.click(trigger());
    const cake = await screen.findByRole('option', { name: /Cake/ });
    const description = screen.getByText('Sweet');
    expect(description.className).toBe('cck-select__option-description');
    expect(cake.getAttribute('aria-describedby')).toBe(description.id);
    expect(screen.getByRole('option', { name: /Burger/ }).hasAttribute('aria-describedby')).toBe(false);
    const leading = screen.getByText('L');
    expect(leading.className).toBe('cck-select__option-leading');
    expect(leading.getAttribute('aria-hidden')).toBe('true');
  });
});
