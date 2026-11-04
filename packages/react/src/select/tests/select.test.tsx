// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactElement } from 'react';
import { selectAnatomy } from '@cocokits/machines/select';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Select } from '../index';
import { Example, nextFrame, stubTopLayer, reasonsOf, lastReason, must, Dishes, Opt } from './fixtures';

const { classes } = selectAnatomy;
let scrollIntoView: ReturnType<typeof stubTopLayer>;

beforeEach(() => {
  scrollIntoView = stubTopLayer();
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
const valueText = (): string | undefined => trigger().querySelector(`.${classes.value}`)?.textContent.trim();

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

describe('Select keyboard', () => {
  it('moves with the arrows, stops at the ends, skips the disabled option, and Home/End/PageUp/PageDown jump', async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    expect(active()).toBe('Cake');
    await user.keyboard('{ArrowDown}');
    expect(active()).toBe('Burger');
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    expect(active()).toBe('Steak');
    await user.keyboard('{ArrowUp}');
    expect(active()).toBe('Burger');
    await user.keyboard('{Home}');
    expect(active()).toBe('Cake');
    await user.keyboard('{End}');
    expect(active()).toBe('Steak');
    await user.keyboard('{PageUp}');
    expect(active()).toBe('Cake');
    await user.keyboard('{PageDown}');
    expect(active()).toBe('Steak');
  });

  it('finds an option by typing, and a pause empties the buffer', async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    await user.keyboard('{ArrowDown}s');
    expect(active()).toBe('Steak');
    await new Promise((resolve) => setTimeout(resolve, 600));
    await user.keyboard('b');
    expect(active()).toBe('Burger');
  });

  it('chooses with Enter and Space, closes a single Select and keeps the focus on the trigger', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onOpenChange = vi.fn();
    render(<Example onValueChange={onValueChange} onOpenChange={onOpenChange} />);
    await user.tab();
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    await gone();
    expect(valueText()).toBe('Burger');
    expect(document.activeElement).toBe(trigger());
    expect(reasonsOf(onValueChange)).toEqual([['Burger', 'user']]);
    expect(lastReason(onOpenChange)).toBe('select');
    await user.keyboard('{ArrowDown}{ArrowDown} ');
    await gone();
    expect(valueText()).toBe('Steak');
  });

  it('chooses and closes with Alt+ArrowUp', async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    await user.keyboard('{ArrowDown}{ArrowDown}{Alt>}{ArrowUp}{/Alt}');
    await gone();
    expect(valueText()).toBe('Burger');
  });

  it('closes with Escape and changes nothing', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onValueChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} onValueChange={onValueChange} />);
    await user.tab();
    await user.keyboard('{ArrowDown}{ArrowDown}{Escape}');
    await gone();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(lastReason(onOpenChange)).toBe('escape');
    expect(document.activeElement).toBe(trigger());
  });

  it('chooses the highlighted option on Tab and lets the focus move on', async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    await user.keyboard('{ArrowDown}{ArrowDown}');
    await user.tab();
    await gone();
    expect(valueText()).toBe('Burger');
    expect(document.activeElement).toBe(document.getElementById('after'));
  });

  it('scrolls the highlighted option into view at the nearest edge on a keyboard move, not on a pointer move', async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await nextFrame();
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' });
    scrollIntoView.mockClear();
    await user.keyboard('{ArrowDown}');
    await nextFrame();
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    scrollIntoView.mockClear();
    await user.hover(option('Steak'));
    await nextFrame();
    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});

describe('Select pointer', () => {
  it('highlights under the pointer, skips a disabled option, and a press in the list keeps the focus on the trigger', async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(trigger());
    await screen.findByRole('listbox');
    await user.hover(option('Steak'));
    expect(active()).toBe('Steak');
    await user.hover(option('Pizza'));
    expect(active()).toBe('Steak');
    await user.pointer({ keys: '[MouseLeft>]', target: option('Steak') });
    expect(document.activeElement).toBe(trigger());
  });

  it('chooses on click, marks it selected and closes', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange} />);
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Burger' }));
    await gone();
    expect(valueText()).toBe('Burger');
    expect(reasonsOf(onValueChange)).toEqual([['Burger', 'user']]);
    await user.click(trigger());
    await screen.findByRole('listbox');
    expect(option('Burger').getAttribute('aria-selected')).toBe('true');
    expect(option('Burger').hasAttribute('data-selected')).toBe(true);
    expect(option('Cake').getAttribute('aria-selected')).toBe('false');
  });

  it('does not choose a disabled option', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange} />);
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Pizza' }));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('listbox')).toBeTruthy();
  });

  it('lets a preventDefault in the option onClick veto the choice', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Dishes onValueChange={onValueChange}>
        <Opt
          value="Cake"
          onClick={(event) => {
            event.preventDefault();
          }}
        >
          Cake
        </Opt>
        <Opt value="Pizza">Pizza</Opt>
      </Dishes>,
    );
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Cake' }));
    expect(onValueChange).not.toHaveBeenCalled();
    await user.click(option('Pizza'));
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it('closes on an outside press with the outside-press reason, and not on a press inside the list', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} />);
    await user.click(trigger());
    await screen.findByRole('listbox');
    await user.click(must(document.getElementById('empty')));
    await gone();
    expect(lastReason(onOpenChange)).toBe('outside-press');
  });

  it('closes when the trigger is clicked again', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} />);
    await user.click(trigger());
    await screen.findByRole('listbox');
    await user.click(trigger());
    await gone();
    expect(lastReason(onOpenChange)).toBe('trigger');
  });
});

describe('Select multiple', () => {
  it('toggles values, stays open, and shows the values joined with a comma', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Example multiple onValueChange={onValueChange} />);
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Cake' }));
    await user.click(option('Steak'));
    expect(onValueChange.mock.calls.at(-1)?.[0]).toEqual(['Cake', 'Steak']);
    expect(screen.getByRole('listbox')).toBeTruthy();
    expect(option('Cake').getAttribute('aria-selected')).toBe('true');
    expect(valueText()).toBe('Cake, Steak');
    await user.click(option('Cake'));
    expect(onValueChange.mock.calls.at(-1)?.[0]).toEqual(['Steak']);
    expect(onValueChange).toHaveBeenCalledTimes(3);
  });
});

describe('Select value and open state', () => {
  function Controlled({ onSeen }: { readonly onSeen?: (value: unknown) => void }): ReactElement {
    const [value, setValue] = useState<string | null>('Cake');
    return (
      <>
        <Dishes
          value={value}
          onValueChange={(next) => {
            onSeen?.(next);
            setValue(next);
          }}
        >
          <Opt value="Cake">Cake</Opt>
          <Opt value="Pizza">Pizza</Opt>
        </Dishes>
        <p data-testid="selected">Selected: {String(value)}</p>
      </>
    );
  }

  it('is controlled with value and onValueChange', async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    expect(valueText()).toBe('Cake');
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Pizza' }));
    expect(screen.getByTestId('selected').textContent).toBe('Selected: Pizza');
    expect(valueText()).toBe('Pizza');
  });

  it('keeps the value when the parent refuses the change', async () => {
    const user = userEvent.setup();
    render(
      <Dishes value="Cake" onValueChange={() => undefined}>
        <Opt value="Cake">Cake</Opt>
        <Opt value="Pizza">Pizza</Opt>
      </Dishes>,
    );
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Pizza' }));
    expect(valueText()).toBe('Cake');
  });

  it('is uncontrolled with defaultValue and reports a change of the controlled mode in development', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { rerender } = render(<Example defaultValue="Burger" />);
    expect(valueText()).toBe('Burger');
    rerender(<Example value="Cake" />);
    expect(error.mock.calls.some(([message]) => String(message).includes('<Select.Root value>'))).toBe(true);
  });

  it('shows a value written from outside without calling onValueChange', () => {
    const onValueChange = vi.fn();
    const { rerender } = render(<Example value="Cake" onValueChange={onValueChange} />);
    rerender(<Example value="Steak" onValueChange={onValueChange} />);
    expect(valueText()).toBe('Steak');
    expect(onValueChange).not.toHaveBeenCalled();
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
