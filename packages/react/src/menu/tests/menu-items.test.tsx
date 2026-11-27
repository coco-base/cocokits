// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Menu, type MenuItemChangeDetails } from '../index';
import { expectFocus, menu, stubTopLayer, trigger } from './fixtures';

beforeEach(stubTopLayer);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const open = async (): Promise<void> => {
  await userEvent.click(trigger());
  await waitFor(() => {
    expect(menu()).not.toBeNull();
  });
};
const closed = (): Promise<void> =>
  waitFor(() => {
    expect(menu()).toBeNull();
  });
const checkbox = (name: string): HTMLElement => screen.getByRole('menuitemcheckbox', { name });
const radio = (name: string): HTMLElement => screen.getByRole('menuitemradio', { name });

function Checks({
  onCheckedChange,
}: {
  readonly onCheckedChange?: (checked: boolean, details: MenuItemChangeDetails) => void;
}): ReactElement {
  return (
    <Menu.Root>
      <Menu.Trigger>Actions</Menu.Trigger>
      <Menu.Content>
        <Menu.CheckboxItem defaultChecked onCheckedChange={onCheckedChange}>
          <Menu.ItemIndicator />
          Bold
        </Menu.CheckboxItem>
        <Menu.CheckboxItem disabled>Italic</Menu.CheckboxItem>
        <Menu.CheckboxItem
          onSelect={(event) => {
            event.preventDefault();
          }}
        >
          Underline
        </Menu.CheckboxItem>
      </Menu.Content>
    </Menu.Root>
  );
}

describe('Menu checkbox item', () => {
  it('renders menuitemcheckbox with aria-checked, data-state and the class', async () => {
    render(<Checks />);
    await open();
    expect(checkbox('Bold').className).toBe('cck-menu__checkbox-item');
    expect(checkbox('Bold').getAttribute('aria-checked')).toBe('true');
    expect(checkbox('Bold').getAttribute('data-state')).toBe('checked');
    expect(checkbox('Underline').getAttribute('aria-checked')).toBe('false');
    expect(checkbox('Underline').getAttribute('data-state')).toBe('unchecked');
    expect(checkbox('Italic').getAttribute('aria-disabled')).toBe('true');
  });

  it('toggles on a click and closes the menu, and reports the new state with the reason', async () => {
    const onCheckedChange = vi.fn<(checked: boolean, details: MenuItemChangeDetails) => void>();
    render(<Checks onCheckedChange={onCheckedChange} />);
    await open();
    await userEvent.click(checkbox('Bold'));
    await closed();
    expect(onCheckedChange).toHaveBeenCalledWith(false, expect.objectContaining({ reason: 'user' }));
  });

  it('toggles on Enter and closes, and on Space keeps the menu open', async () => {
    const onCheckedChange = vi.fn<(checked: boolean) => void>();
    render(<Checks onCheckedChange={onCheckedChange} />);
    await open();
    checkbox('Bold').focus();
    await userEvent.keyboard(' ');
    expect(menu()).not.toBeNull();
    expect(checkbox('Bold').getAttribute('aria-checked')).toBe('false');
    await userEvent.keyboard('{Enter}');
    await closed();
    expect(onCheckedChange.mock.calls.map(([next]) => next)).toEqual([false, true]);
  });

  it('changes nothing for a disabled item, which stays focusable', async () => {
    const onCheckedChange = vi.fn();
    render(<Checks onCheckedChange={onCheckedChange} />);
    await open();
    await userEvent.click(checkbox('Italic'));
    checkbox('Italic').focus();
    await userEvent.keyboard(' ');
    expect(menu()).not.toBeNull();
    expect(checkbox('Italic').getAttribute('aria-checked')).toBe('false');
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(checkbox('Italic'));
  });

  it('keeps the menu open when onSelect prevents the default, and still toggles', async () => {
    render(<Checks />);
    await open();
    await userEvent.click(checkbox('Underline'));
    expect(menu()).not.toBeNull();
    expect(checkbox('Underline').getAttribute('aria-checked')).toBe('true');
  });

  it('is controlled by checked', async () => {
    function Controlled(): ReactElement {
      const [on, setOn] = useState(false);
      return (
        <Menu.Root>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Content>
            <Menu.CheckboxItem
              checked={on}
              onCheckedChange={(next) => {
                setOn(next);
              }}
              onSelect={(event) => {
                event.preventDefault();
              }}
            >
              Bold
            </Menu.CheckboxItem>
          </Menu.Content>
        </Menu.Root>
      );
    }
    render(<Controlled />);
    await open();
    await userEvent.click(checkbox('Bold'));
    expect(checkbox('Bold').getAttribute('aria-checked')).toBe('true');
  });

  it('draws the indicator with the state of its item and aria-hidden', async () => {
    render(<Checks />);
    await open();
    const indicator = checkbox('Bold').querySelector('.cck-menu__item-indicator');
    expect(indicator?.tagName).toBe('SPAN');
    expect(indicator?.getAttribute('aria-hidden')).toBe('true');
    expect(indicator?.getAttribute('data-state')).toBe('checked');
  });

  it('draws the check icon in an empty indicator, and the content you give instead of it', async () => {
    render(
      <Menu.Root>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Content>
          <Menu.CheckboxItem defaultChecked>
            <Menu.ItemIndicator />
            Grid
          </Menu.CheckboxItem>
          <Menu.CheckboxItem>
            <Menu.ItemIndicator>x</Menu.ItemIndicator>
            Rulers
          </Menu.CheckboxItem>
        </Menu.Content>
      </Menu.Root>,
    );
    await open();
    const indicatorOf = (name: string): Element | null => checkbox(name).querySelector('.cck-menu__item-indicator');
    expect(indicatorOf('Grid')?.querySelector('[data-icon]')?.getAttribute('data-icon')).toBe('check');
    expect(indicatorOf('Rulers')?.querySelector('[data-icon]')).toBeNull();
    expect(indicatorOf('Rulers')?.textContent).toBe('x');
  });
});

function Radios({
  onValueChange,
  value,
}: {
  readonly onValueChange?: (value: string, details: MenuItemChangeDetails) => void;
  readonly value?: string;
}): ReactElement {
  return (
    <Menu.Root>
      <Menu.Trigger>Actions</Menu.Trigger>
      <Menu.Content>
        <Menu.RadioGroup defaultValue="name" value={value} onValueChange={onValueChange}>
          <Menu.GroupLabel>Sort by</Menu.GroupLabel>
          <Menu.RadioItem value="name">Name</Menu.RadioItem>
          <Menu.RadioItem
            value="date"
            onSelect={(event) => {
              event.preventDefault();
            }}
          >
            Date
          </Menu.RadioItem>
        </Menu.RadioGroup>
      </Menu.Content>
    </Menu.Root>
  );
}

describe('Menu radio group', () => {
  it('renders a group named by its label and radio items with aria-checked', async () => {
    render(<Radios />);
    await open();
    const group = screen.getByRole('group', { name: 'Sort by' });
    expect(group.className).toBe('cck-menu__radio-group');
    expect(group.getAttribute('aria-labelledby')).toBe(screen.getByText('Sort by').id);
    expect(radio('Name').getAttribute('aria-checked')).toBe('true');
    expect(radio('Date').getAttribute('aria-checked')).toBe('false');
    expect(radio('Name').className).toBe('cck-menu__radio-item');
  });

  it('sets the value on a press, reports it once, and a press on the checked item reports nothing', async () => {
    const onValueChange = vi.fn<(value: string, details: MenuItemChangeDetails) => void>();
    render(<Radios onValueChange={onValueChange} />);
    await open();
    await userEvent.click(radio('Name'));
    expect(onValueChange).not.toHaveBeenCalled();
    await open();
    await userEvent.click(radio('Date'));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith('date', expect.objectContaining({ reason: 'user' }));
    expect(radio('Date').getAttribute('aria-checked')).toBe('true');
    expect(radio('Name').getAttribute('aria-checked')).toBe('false');
  });

  it('checks on Space and keeps the menu open', async () => {
    render(<Radios />);
    await open();
    radio('Date').focus();
    await userEvent.keyboard(' ');
    expect(menu()).not.toBeNull();
    expect(radio('Date').getAttribute('aria-checked')).toBe('true');
  });

  it('is controlled by value', async () => {
    render(<Radios value="name" onValueChange={() => undefined} />);
    await open();
    await userEvent.click(radio('Date'));
    await act(() => Promise.resolve());
    expect(radio('Name').getAttribute('aria-checked')).toBe('true');
    expect(radio('Date').getAttribute('aria-checked')).toBe('false');
  });
});

describe('Menu group and item parts', () => {
  it('names a group by its label and leaves an unlabelled group unnamed', async () => {
    render(
      <Menu.Root>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Content>
          <Menu.Group aria-label="Own name">
            <Menu.Item>One</Menu.Item>
          </Menu.Group>
          <Menu.Group>
            <Menu.GroupLabel>Edit</Menu.GroupLabel>
            <Menu.Item>Two</Menu.Item>
          </Menu.Group>
          <Menu.Group data-plain="">
            <Menu.Item>Three</Menu.Item>
          </Menu.Group>
        </Menu.Content>
      </Menu.Root>,
    );
    await open();
    const groups = screen.getAllByRole('group');
    expect(groups.map((group) => group.className)).toEqual(['cck-menu__group', 'cck-menu__group', 'cck-menu__group']);
    expect(groups[0]?.getAttribute('aria-label')).toBe('Own name');
    expect(groups[1]?.getAttribute('aria-labelledby')).toBe(screen.getByText('Edit').id);
    expect(groups[2]?.hasAttribute('aria-labelledby')).toBe(false);
    // The label is no item: the arrow keys skip it.
    expect(screen.getAllByRole('menuitem')).toHaveLength(3);
  });

  it('renders leading, trailing and shortcut as spans, the first two hidden from assistive technology', async () => {
    render(
      <Menu.Root>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Content>
          <Menu.Item>
            <Menu.ItemLeading>L</Menu.ItemLeading>
            Save
            <Menu.ItemTrailing>T</Menu.ItemTrailing>
            <Menu.ItemShortcut>Ctrl+S</Menu.ItemShortcut>
          </Menu.Item>
        </Menu.Content>
      </Menu.Root>,
    );
    await open();
    const rows = [
      ['L', 'cck-menu__item-leading', 'true'],
      ['T', 'cck-menu__item-trailing', 'true'],
      ['Ctrl+S', 'cck-menu__item-shortcut', null],
    ] as const;
    for (const [text, className, hidden] of rows) {
      const part = screen.getByText(text);
      expect(part.tagName).toBe('SPAN');
      expect(part.className).toBe(className);
      expect(part.getAttribute('aria-hidden')).toBe(hidden);
    }
  });

  it('describes the item by its supporting text only while the text is mounted', async () => {
    function Described({ show }: { readonly show: boolean }): ReactElement {
      return (
        <Menu.Root defaultOpen>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Content>
            <Menu.Item>
              Delete
              {show && <Menu.ItemSupportingText>This cannot be undone.</Menu.ItemSupportingText>}
            </Menu.Item>
          </Menu.Content>
        </Menu.Root>
      );
    }
    const { rerender } = render(<Described show />);
    await waitFor(() => {
      expect(menu()).not.toBeNull();
    });
    const itemElement = screen.getByRole('menuitem');
    const text = screen.getByText('This cannot be undone.');
    expect(text.className).toBe('cck-menu__item-supporting-text');
    expect(itemElement.getAttribute('aria-describedby')).toBe(text.id);
    rerender(<Described show={false} />);
    await waitFor(() => {
      expect(itemElement.hasAttribute('aria-describedby')).toBe(false);
    });
  });

  it('throws for a part outside a menu', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Menu.CheckboxItem>Bold</Menu.CheckboxItem>)).toThrow(
      'CocoKits: <Menu.CheckboxItem> must be placed within <Menu.Root>.',
    );
    expect(() => render(<Menu.Sub>x</Menu.Sub>)).toThrow('CocoKits: <Menu.Sub> must be placed within <Menu.Root>.');
  });

  it('moves focus through checkbox items with the arrow keys like any item', async () => {
    render(<Checks />);
    await open();
    await expectFocus(checkbox('Bold'));
    await userEvent.keyboard('{ArrowDown}');
    await expectFocus(checkbox('Italic'));
  });
});
