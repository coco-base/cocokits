// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Profiler, useState, type ReactElement } from 'react';
import { selectAnatomy } from '@cocokits/machines/select';
import { DirectionProvider } from '@cocokits/react-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Dialog } from '../../dialog';
import { Popover } from '../../popover';
import { Select } from '../index';
import { ANCHOR_BOX, nextTask, reasonsOf, stubLayout, stubTopLayer, Dishes, Opt } from './fixtures';

const { classes } = selectAnatomy;

beforeEach(() => {
  stubTopLayer();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const trigger = (): HTMLElement => screen.getByRole('combobox');
const option = (name: string): HTMLElement => screen.getByRole('option', { name });
const gone = (): Promise<void> =>
  waitFor(() => {
    expect(screen.queryByRole('listbox')).toBeNull();
  });
const valueText = (): string | undefined => trigger().querySelector(`.${classes.value}`)?.textContent.trim();
const active = (): string =>
  document.getElementById(trigger().getAttribute('aria-activedescendant') ?? '')?.textContent.trim() ?? '';

describe('Select option groups', () => {
  it('groups options under a text label and a markup label, named by the label', async () => {
    const user = userEvent.setup();
    render(
      <Dishes>
        <Select.Group>
          <Select.Label>Desserts</Select.Label>
          <Opt value="Cake">Cake</Opt>
        </Select.Group>
        <Select.Group>
          <Select.Label>
            <b data-testid="mark">Mains</b> (hot)
          </Select.Label>
          <Opt value="Pizza">Pizza</Opt>
        </Select.Group>
      </Dishes>,
    );
    await user.click(trigger());
    const groups = await screen.findAllByRole('group');
    expect(groups.map((group) => group.className)).toEqual([classes.optionGroup, classes.optionGroup]);
    expect(screen.getByRole('group', { name: 'Desserts' })).toBeTruthy();
    expect(screen.getByRole('group', { name: 'Mains (hot)' })).toBeTruthy();
    expect(screen.getByTestId('mark').closest(`.${classes.optionGroupLabel}`)).not.toBeNull();
    expect(screen.getByRole('group', { name: 'Desserts' }).contains(option('Cake'))).toBe(true);
  });

  it('disables the options of a disabled group', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Dishes onValueChange={onValueChange}>
        <Select.Group disabled>
          <Select.Label>Sold out</Select.Label>
          <Opt value="Cake">Cake</Opt>
        </Select.Group>
        <Opt value="Pizza">Pizza</Opt>
      </Dishes>,
    );
    await user.click(trigger());
    const group = await screen.findByRole('group', { name: 'Sold out' });
    expect(group.getAttribute('aria-disabled')).toBe('true');
    expect(group.hasAttribute('data-disabled')).toBe(true);
    expect(option('Cake').getAttribute('aria-disabled')).toBe('true');
    expect(active()).toBe('Pizza');
    await user.click(option('Cake'));
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe('Select clearing option', () => {
  it('sets the empty string on a value of "" and shows the placeholder again, with the user reason', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Dishes placeholder="Choose" defaultValue="Cake" onValueChange={onValueChange}>
        <Opt value="">None</Opt>
        <Opt value="Cake">Cake</Opt>
      </Dishes>,
    );
    expect(valueText()).toBe('Cake');
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'None' }));
    await gone();
    expect(reasonsOf(onValueChange)).toEqual([['', 'user']]);
    expect(trigger().querySelector(`.${classes.placeholder}`)?.textContent).toBe('Choose');
    expect(trigger().closest(`.${classes.root}`)?.hasAttribute('data-placeholder-shown')).toBe(true);
  });
});

describe('Select object values (generic T)', () => {
  interface Dish {
    readonly id: number;
    readonly name: string;
  }
  const first: Dish = { id: 1, name: 'Cake' };
  const second: Dish = { id: 2, name: 'Pizza' };
  const dishes: readonly Dish[] = [first, second];

  function ObjectSelect({ onSeen }: { readonly onSeen?: (value: unknown) => void }): ReactElement {
    const [dish, setDish] = useState<Dish | null>({ id: 2, name: 'Pizza (copy)' });
    return (
      <Dishes<Dish>
        name="dish"
        value={dish}
        itemToStringLabel={(item) => item.name}
        itemToStringValue={(item) => item.name}
        isItemEqualToValue={(a, b) => a.id === b.id}
        onValueChange={(next) => {
          onSeen?.(next);
          setDish(next);
        }}
      >
        {dishes.map((item) => (
          <Opt<Dish> key={item.id} value={item}>
            {item.name}
          </Opt>
        ))}
      </Dishes>
    );
  }

  it('selects by isItemEqualToValue, shows itemToStringLabel and submits itemToStringValue', async () => {
    const user = userEvent.setup();
    const seen = vi.fn();
    const { container } = render(<ObjectSelect onSeen={seen} />);
    expect(valueText()).toBe('Pizza (copy)');
    expect(container.querySelector<HTMLInputElement>('input[name="dish"]')?.value).toBe('Pizza (copy)');
    await user.click(trigger());
    expect((await screen.findByRole('option', { name: 'Pizza' })).getAttribute('aria-selected')).toBe('true');
    await user.click(option('Cake'));
    await gone();
    expect(seen).toHaveBeenCalledWith({ id: 1, name: 'Cake' });
    expect(container.querySelector<HTMLInputElement>('input[name="dish"]')?.value).toBe('Cake');
  });

  it('uses itemToString for the typeahead text of an option with no text', async () => {
    const user = userEvent.setup();
    render(
      <Dishes<Dish> itemToStringLabel={(item) => item.name}>
        <Opt<Dish> value={first}>
          <svg aria-hidden="true" />
        </Opt>
        <Opt<Dish> value={second}>
          <svg aria-hidden="true" />
        </Opt>
      </Dishes>,
    );
    await user.tab();
    await user.keyboard('p');
    await screen.findByRole('listbox');
    expect(trigger().getAttribute('aria-activedescendant')).toBe(screen.getAllByRole('option')[1]?.id);
  });
});

describe('Select options with an inline object value', () => {
  interface Dish {
    readonly id: number;
    readonly name: string;
  }

  function InlineSelect({ onRender }: { readonly onRender: (phase: string) => void }): ReactElement {
    const [dish, setDish] = useState<Dish | null>(null);
    return (
      <Profiler
        id="select"
        onRender={(_id, phase) => {
          onRender(phase);
        }}
      >
        <Dishes<Dish>
          value={dish}
          itemToStringLabel={(item) => item.name}
          isItemEqualToValue={(a, b) => a.id === b.id}
          onValueChange={setDish}
        >
          <Opt<Dish> value={{ id: 1, name: 'Cake' }}>Cake</Opt>
          <Opt<Dish> value={{ id: 2, name: 'Pizza' }}>Pizza</Opt>
        </Dishes>
      </Profiler>
    );
  }

  it('registers once: a render of the parent causes no registry update of the Root', async () => {
    const user = userEvent.setup();
    const phases: string[] = [];
    const onRender = (phase: string): number => phases.push(phase);
    const { rerender } = render(<InlineSelect onRender={onRender} />);
    await user.click(trigger());
    await screen.findByRole('listbox');
    phases.length = 0;
    rerender(<InlineSelect onRender={onRender} />);
    expect(phases).toContain('update');
    expect(phases).not.toContain('nested-update');
  });

  it('still selects and shows the chosen value', async () => {
    const user = userEvent.setup();
    render(<InlineSelect onRender={() => undefined} />);
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Pizza' }));
    await gone();
    expect(valueText()).toBe('Pizza');
  });
});

describe('Select value part', () => {
  it('renders the children function with the value while something is selected', async () => {
    const user = userEvent.setup();
    const seen = vi.fn();
    render(
      <Select.Root multiple defaultValue={['Cake', 'Pizza']}>
        <Select.Trigger aria-label="Dish">
          <Select.Value<readonly string[]> placeholder="Choose">
            {(value) => {
              seen(value);
              return `${String(value.length)} selected`;
            }}
          </Select.Value>
        </Select.Trigger>
        <Select.Content>
          <Opt value="Cake">Cake</Opt>
          <Opt value="Pizza">Pizza</Opt>
          <Opt value="Steak">Steak</Opt>
        </Select.Content>
      </Select.Root>,
    );
    expect(valueText()).toBe('2 selected');
    expect(seen).toHaveBeenCalledWith(['Cake', 'Pizza']);
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Steak' }));
    expect(valueText()).toBe('3 selected');
  });

  it('renders children that are a node in place of the labels', () => {
    render(
      <Select.Root defaultValue="Cake">
        <Select.Trigger aria-label="Dish">
          <Select.Value>
            <b>Cake!</b>
          </Select.Value>
        </Select.Trigger>
      </Select.Root>,
    );
    expect(valueText()).toBe('Cake!');
  });

  it('shows the placeholder, not the children function, while nothing is selected', () => {
    const children = vi.fn(() => 'x');
    render(
      <Select.Root>
        <Select.Trigger aria-label="Dish">
          <Select.Value placeholder="Choose">{children}</Select.Value>
        </Select.Trigger>
      </Select.Root>,
    );
    expect(trigger().querySelector(`.${classes.placeholder}`)?.textContent).toBe('Choose');
    expect(children).not.toHaveBeenCalled();
  });
});

describe('Select labels from data', () => {
  const dishes = [
    { value: 'cake', label: 'Cake' },
    { value: 'pizza', label: 'Pizza' },
  ];

  it('shows the label of the items for the value, before the list ever mounted', () => {
    render(
      <Dishes defaultValue="pizza" items={dishes}>
        <Opt value="cake">Cake</Opt>
        <Opt value="pizza">Pizza</Opt>
      </Dishes>,
    );
    expect(valueText()).toBe('Pizza');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('accepts a record from value to label, and joins the labels of a multiple Select in value order', () => {
    render(
      <Dishes multiple defaultValue={['pizza', 'cake']} items={{ cake: 'Cake', pizza: 'Pizza' }}>
        <Opt value="cake">Cake</Opt>
      </Dishes>,
    );
    expect(valueText()).toBe('Pizza, Cake');
  });

  it('falls back to itemToStringLabel, then to the value as text', () => {
    const upper = (value: string): string => value.toUpperCase();
    const { unmount } = render(<Dishes defaultValue="steak" items={dishes} itemToStringLabel={upper} />);
    expect(valueText()).toBe('STEAK');
    unmount();
    render(<Dishes defaultValue="steak" items={dishes} />);
    expect(valueText()).toBe('steak');
  });
});

describe('Select dynamic options', () => {
  function Dynamic({ dishes }: { readonly dishes: readonly string[] }): ReactElement {
    return (
      <Dishes>
        {dishes.map((dish) => (
          <Opt key={dish} value={dish}>
            {dish}
          </Opt>
        ))}
      </Dishes>
    );
  }

  it('lists added, removed and reordered options in document order', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Dynamic dishes={['Cake', 'Pizza', 'Steak']} />);
    await user.click(trigger());
    const names = (): string[] => screen.getAllByRole('option').map((node) => node.textContent.trim());
    expect(names()).toEqual(['Cake', 'Pizza', 'Steak']);
    rerender(<Dynamic dishes={['Steak', 'Cake', 'Burger', 'Pizza']} />);
    await user.keyboard('{Home}');
    expect(names()).toEqual(['Steak', 'Cake', 'Burger', 'Pizza']);
    expect(active()).toBe('Steak');
    await user.keyboard('{ArrowDown}');
    expect(active()).toBe('Cake');
    await user.keyboard('{End}');
    expect(active()).toBe('Pizza');
  });
});

describe('Select right to left', () => {
  it('flips start and end placement, and leaves the vertical keys alone', async () => {
    const user = userEvent.setup();
    render(
      <DirectionProvider dir="rtl">
        <Dishes contentProps={{ side: 'start' }}>
          <Opt value="Cake">Cake</Opt>
          <Opt value="Pizza">Pizza</Opt>
        </Dishes>
      </DirectionProvider>,
    );
    await user.tab();
    await user.keyboard('{ArrowDown}');
    const list = await screen.findByRole('listbox');
    await waitFor(() => {
      expect(list.getAttribute('data-side')).toBe('start');
    });
    await user.keyboard('{ArrowDown}');
    expect(active()).toBe('Pizza');
    await user.keyboard('{ArrowUp}');
    expect(active()).toBe('Cake');
  });
});

describe('Select dir', () => {
  const dishes = (dir?: 'ltr' | 'rtl'): ReactElement => (
    <DirectionProvider dir="ltr">
      <Dishes contentProps={{ side: 'start' }} dir={dir}>
        <Opt value="Cake">Cake</Opt>
      </Dishes>
    </DirectionProvider>
  );

  it('renders only the own dir on the root and reaches the portaled list', async () => {
    const user = userEvent.setup();
    const { container } = render(dishes('rtl'));
    expect(container.querySelector(`.${classes.root}`)?.getAttribute('dir')).toBe('rtl');
    await user.tab();
    await user.keyboard('{ArrowDown}');
    const list = await screen.findByRole('listbox');
    await waitFor(() => {
      expect(list.getAttribute('data-side')).toBe('start');
    });
    expect(list.closest('[popover]')?.getAttribute('dir')).toBe('rtl');
  });

  it.each([
    { dir: 'rtl' as const, right: true },
    { dir: 'ltr' as const, right: false },
  ])('places side="start" on the $dir side of the trigger by the own dir', async ({ dir, right }) => {
    stubLayout(() => document.querySelector('[role="combobox"]'));
    const user = userEvent.setup();
    render(
      <DirectionProvider dir={dir === 'rtl' ? 'ltr' : 'rtl'}>
        <Dishes contentProps={{ side: 'start' }} dir={dir}>
          <Opt value="Cake">Cake</Opt>
        </Dishes>
      </DirectionProvider>,
    );
    await user.tab();
    await user.keyboard('{ArrowDown}');
    const list = await screen.findByRole('listbox');
    const placed = (): HTMLElement | null => list.closest<HTMLElement>('[style*="left"]');
    await waitFor(() => {
      expect(placed()?.style.left).not.toBe('0px');
    });
    const left = Number.parseFloat(placed()?.style.left ?? '');
    if (right) expect(left).toBeGreaterThanOrEqual(ANCHOR_BOX.left + ANCHOR_BOX.width);
    else expect(left + 50).toBeLessThanOrEqual(ANCHOR_BOX.left);
  });

  it('renders no dir attribute without it', () => {
    const { container } = render(dishes());
    expect(container.querySelector(`.${classes.root}`)?.hasAttribute('dir')).toBe(false);
  });
});

describe('Select nested overlays', () => {
  it('inside a Popover: Escape closes the listbox only, and a choice keeps the Popover open', async () => {
    const user = userEvent.setup();
    render(
      <Popover.Root>
        <Popover.Trigger>Settings</Popover.Trigger>
        <Popover.Content aria-label="Settings panel">
          <Dishes>
            <Opt value="Cake">Cake</Opt>
            <Opt value="Pizza">Pizza</Opt>
          </Dishes>
        </Popover.Content>
      </Popover.Root>,
    );
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    await screen.findByRole('dialog', { name: 'Settings panel' });
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Pizza' }));
    await gone();
    expect(screen.getByRole('dialog', { name: 'Settings panel' })).toBeTruthy();
    await user.click(trigger());
    await screen.findByRole('listbox');
    await user.keyboard('{Escape}');
    await gone();
    expect(screen.getByRole('dialog', { name: 'Settings panel' })).toBeTruthy();
  });

  it('inside a Popover: a press outside that the list refuses with cancel() keeps the Popover open', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn((open: boolean, details: { cancel(): void }) => {
      if (!open) details.cancel();
    });
    render(
      <>
        <button>Elsewhere</button>
        <Popover.Root>
          <Popover.Trigger>Settings</Popover.Trigger>
          <Popover.Content aria-label="Settings panel">
            <Dishes onOpenChange={onOpenChange}>
              <Opt value="Cake">Cake</Opt>
            </Dishes>
          </Popover.Content>
        </Popover.Root>
      </>,
    );
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    await screen.findByRole('dialog', { name: 'Settings panel' });
    await user.click(trigger());
    await screen.findByRole('listbox');
    await user.click(screen.getByRole('button', { name: 'Elsewhere' }));
    await nextTask();
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
    expect(screen.getByRole('listbox')).toBeTruthy();
    expect(screen.getByRole('dialog', { name: 'Settings panel' })).toBeTruthy();
  });

  it('inside a modal Dialog: the list renders inside the dialog, Escape closes it only, a choice keeps the dialog open', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Dialog.Root>
        <Dialog.Trigger>Order</Dialog.Trigger>
        <Dialog.Content aria-label="Order">
          <Dishes onValueChange={onValueChange}>
            <Opt value="Cake">Cake</Opt>
            <Opt value="Pizza">Pizza</Opt>
          </Dishes>
          <Dialog.Close>Cancel</Dialog.Close>
        </Dialog.Content>
      </Dialog.Root>,
    );
    await user.click(screen.getByRole('button', { name: 'Order' }));
    const dialog = await waitFor(() => {
      const found = document.querySelector('dialog[open]');
      if (!found) throw new Error('The dialog is not open yet.');
      return found;
    });
    await user.click(trigger());
    const list = await screen.findByRole('listbox');
    expect(dialog.contains(list)).toBe(true);
    await user.keyboard('{Escape}');
    await gone();
    expect(document.querySelector('dialog[open]')).toBe(dialog);
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Pizza' }));
    await gone();
    expect(onValueChange.mock.calls[0]?.[0]).toBe('Pizza');
    expect(document.querySelector('dialog[open]')).toBe(dialog);
  });
});
