// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { selectAnatomy } from '@cocokits/machines/select';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Select } from '../index';
import { Example, stubTopLayer, reasonsOf, Dishes } from './fixtures';

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
const active = (): string =>
  document.getElementById(trigger().getAttribute('aria-activedescendant') ?? '')?.textContent.trim() ?? '';

describe('Select rendered contract', () => {
  it('renders the root, trigger, placeholder and icon with the anatomy classes and no list while closed', () => {
    render(<Example />);
    const root = trigger().closest(`.${classes.root}`);
    expect(root?.tagName).toBe('DIV');
    expect(root?.getAttribute('data-state')).toBe('closed');
    expect(root?.hasAttribute('data-placeholder-shown')).toBe(true);
    expect(root?.hasAttribute('aria-label')).toBe(false);
    expect(trigger().tagName).toBe('BUTTON');
    expect(trigger().className).toBe(classes.trigger);
    expect(trigger().getAttribute('type')).toBe('button');
    expect(trigger().getAttribute('aria-haspopup')).toBe('listbox');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(trigger().hasAttribute('aria-controls')).toBe(false);
    expect(trigger().getAttribute('aria-label')).toBe('Dish');
    expect(trigger().querySelector(`.${classes.placeholder}`)?.textContent).toBe('Choose a dish');
    expect(trigger().querySelector(`.${classes.dropdownIcon}`)?.getAttribute('aria-hidden')).toBe('true');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('renders the listbox and options in the overlay container, not next to the trigger', async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(trigger());
    const list = await screen.findByRole('listbox');
    expect(list.className).toBe(classes.content);
    expect(list.closest(`.${classes.root}`)).toBeNull();
    expect(list.getAttribute('data-state')).toBe('open');
    expect(list.getAttribute('data-side')).toBe('bottom');
    expect(list.getAttribute('data-align')).toBe('start');
    expect(list.getAttribute('aria-label')).toBe('Dish');
    expect(trigger().getAttribute('aria-controls')).toBe(list.id);
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(screen.getAllByRole('option').map((node) => node.textContent.trim())).toEqual([
      'Cake',
      'Pizza',
      'Burger',
      'Steak',
    ]);
    expect(option('Cake').className).toBe(classes.option);
    expect(option('Cake').querySelector(`.${classes.optionIndicator}`)?.getAttribute('aria-hidden')).toBe('true');
    expect(option('Cake').querySelector(`.${classes.optionContent}`)?.textContent).toBe('Cake');
    expect(option('Pizza').getAttribute('aria-disabled')).toBe('true');
    expect(option('Pizza').hasAttribute('data-disabled')).toBe(true);
  });

  it('marks multiple on the root and the list', async () => {
    const user = userEvent.setup();
    render(<Example multiple />);
    await user.click(trigger());
    const list = await screen.findByRole('listbox');
    expect(list.getAttribute('aria-multiselectable')).toBe('true');
    expect(list.hasAttribute('data-multiple')).toBe(true);
    expect(trigger().closest(`.${classes.root}`)?.hasAttribute('data-multiple')).toBe(true);
  });

  it('keeps DOM focus on the trigger when it opens', async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    expect(document.activeElement).toBe(trigger());
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    expect(document.activeElement).toBe(trigger());
  });

  it('passes native div props to the root and keeps the machine attributes', () => {
    render(<Example data-testid="root" className="mine" id="custom" data-state="x" />);
    const root = screen.getByTestId('root');
    expect(root.className).toBe('cck-select mine');
    expect(root.hasAttribute('id')).toBe(false);
    expect(root.getAttribute('data-state')).toBe('closed');
  });

  it('forwards ref to the root element', () => {
    let node: HTMLDivElement | null = null;
    render(
      <Dishes
        ref={(element) => {
          node = element;
        }}
      />,
    );
    expect(node).toBe(trigger().closest(`.${classes.root}`));
  });

  it('throws a clear error for a part outside a Select.Root', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Select.Trigger />)).toThrow('<Select.Trigger> must be placed within <Select.Root>.');
    expect(() => render(<Select.Item value="x" />)).toThrow('<Select.Item> must be placed within <Select.Root>.');
    expect(() => render(<Select.Group />)).toThrow('<Select.Group> must be placed within <Select.Root>.');
    expect(() =>
      render(
        <Select.Root>
          <Select.Label>x</Select.Label>
        </Select.Root>,
      ),
    ).toThrow('<Select.Label> must be placed within <Select.Group>.');
  });
});

describe('Select opening', () => {
  it('opens on click with the first enabled option highlighted and reports the trigger reason', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} />);
    await user.click(trigger());
    await screen.findByRole('listbox');
    expect(trigger().getAttribute('aria-activedescendant')).toBe(option('Cake').id);
    expect(option('Cake').hasAttribute('data-highlighted')).toBe(true);
    expect(reasonsOf(onOpenChange)).toEqual([[true, 'trigger']]);
  });

  it.each([['{ArrowDown}'], ['{Alt>}{ArrowDown}{/Alt}'], ['{Enter}'], [' ']])('opens with %s', async (keys) => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    await user.keyboard(keys);
    expect(await screen.findByRole('listbox')).toBeTruthy();
    expect(active()).toBe('Cake');
  });

  it('opens on the selected option', async () => {
    const user = userEvent.setup();
    render(<Example defaultValue="Steak" />);
    await user.click(trigger());
    await screen.findByRole('listbox');
    expect(active()).toBe('Steak');
  });

  it('ArrowUp opens on the first option, End on the last, Home on the first', async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    await user.keyboard('{End}');
    await screen.findByRole('listbox');
    expect(active()).toBe('Steak');
    await user.keyboard('{Escape}');
    await gone();
    await user.keyboard('{ArrowUp}');
    await screen.findByRole('listbox');
    expect(active()).toBe('Cake');
    await user.keyboard('{Escape}');
    await gone();
    await user.keyboard('{Home}');
    await screen.findByRole('listbox');
    expect(active()).toBe('Cake');
  });

  it('opens by typing a character, on the option it finds', async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    await user.keyboard('s');
    await screen.findByRole('listbox');
    expect(active()).toBe('Steak');
  });

  it('never opens while disabled or read-only; read-only stays focusable and says so', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Example readOnly />);
    await user.tab();
    expect(document.activeElement).toBe(trigger());
    expect(trigger().getAttribute('aria-readonly')).toBe('true');
    await user.keyboard('{ArrowDown}');
    await user.click(trigger());
    expect(screen.queryByRole('listbox')).toBeNull();
    rerender(<Example disabled />);
    expect((trigger() as HTMLButtonElement).disabled).toBe(true);
    expect(trigger().closest(`.${classes.root}`)?.hasAttribute('data-disabled')).toBe(true);
    await user.click(trigger());
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('opens from the open prop and closes from it, and reports nothing for a parent write', async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(<Example open={false} onOpenChange={onOpenChange} />);
    rerender(<Example open onOpenChange={onOpenChange} />);
    expect(await screen.findByRole('listbox')).toBeTruthy();
    expect(active()).toBe('Cake');
    rerender(<Example open={false} onOpenChange={onOpenChange} />);
    await gone();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('keeps a controlled open state when the parent refuses the change', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Example open={false} onOpenChange={onOpenChange} />);
    await user.click(trigger());
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('listbox')).toBeNull();
  });
});

describe('Select trigger focus on a press', () => {
  // Safari (and Firefox, for the first press inside a frame) does not focus a button on a press: only the click arrives.
  it('focuses the trigger when the press did not, opens the list, and keeps focus on the trigger after Escape', async () => {
    const user = userEvent.setup();
    render(<Example />);
    expect(document.activeElement).not.toBe(trigger());
    fireEvent.click(trigger());
    await screen.findByRole('listbox');
    expect(document.activeElement).toBe(trigger());
    await user.keyboard('{Escape}');
    await gone();
    expect(document.activeElement).toBe(trigger());
  });

  it('focuses the trigger when a press closes the list', async () => {
    render(<Example />);
    fireEvent.click(trigger());
    await screen.findByRole('listbox');
    const other = document.createElement('button');
    document.body.append(other);
    other.focus();
    fireEvent.click(trigger());
    await gone();
    expect(document.activeElement).toBe(trigger());
  });
});
