// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, StrictMode, useState, type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DirectionProvider } from '@cocokits/react-core';
import { Tabs } from '../index';
import { Example, panelOf, selectedTabs, tab } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('Tabs rendered contract', () => {
  it('renders the list, a trigger per tab with a label, the one indicator and a panel per tab with the fixed classes', () => {
    const { container } = render(<Example defaultValue="account" />);
    const root = container.querySelector('.cck-tabs');
    expect(root?.tagName).toBe('DIV');
    expect(root?.getAttribute('data-orientation')).toBe('horizontal');
    const list = screen.getByRole('tablist', { name: 'Account settings' });
    expect(list.className).toBe('cck-tabs__list');
    expect(list.getAttribute('aria-orientation')).toBeNull();
    expect(list.children).toHaveLength(4);
    expect(list.lastElementChild?.className).toBe('cck-tabs__indicator');
    expect(list.lastElementChild?.getAttribute('aria-hidden')).toBe('true');
    expect(list.lastElementChild?.tagName).toBe('SPAN');
    for (const name of ['Account', 'Password', 'Notifications']) {
      expect(tab(name).tagName).toBe('BUTTON');
      expect(tab(name).className).toBe('cck-tabs__trigger');
      expect(tab(name).getAttribute('type')).toBe('button');
      const label = tab(name).querySelector('.cck-tabs__trigger-label');
      expect(label?.tagName).toBe('SPAN');
      expect(label?.textContent).toBe(name);
    }
    expect(container.querySelectorAll('.cck-tabs__panel')).toHaveLength(3);
  });

  it('links trigger and panel, selects the default value and hides the other panels', () => {
    render(<Example defaultValue="password" />);
    expect(selectedTabs()).toEqual(['Password']);
    expect(tab('Password').hasAttribute('data-selected')).toBe(true);
    expect(tab('Account').hasAttribute('data-selected')).toBe(false);
    const panel = panelOf('Password');
    expect(panel.getAttribute('role')).toBe('tabpanel');
    expect(panel.getAttribute('aria-labelledby')).toBe(tab('Password').id);
    expect(panel.getAttribute('tabindex')).toBe('0');
    expect(panel.hidden).toBe(false);
    expect(panel.hasAttribute('data-selected')).toBe(true);
    expect(panelOf('Account').hidden).toBe(true);
    expect(panelOf('Account').hasAttribute('data-selected')).toBe(false);
    expect(tab('Password').tabIndex).toBe(0);
    expect(tab('Account').tabIndex).toBe(-1);
  });

  it('selects the first enabled tab after the triggers have mounted when no value is given', () => {
    render(<Example lockPassword />);
    expect(selectedTabs()).toEqual(['Account']);
    expect(tab('Account').tabIndex).toBe(0);
  });

  it('marks the vertical orientation on the root, the list, the triggers and the panels', () => {
    const { container } = render(<Example orientation="vertical" defaultValue="account" />);
    expect(container.querySelector('.cck-tabs')?.getAttribute('data-orientation')).toBe('vertical');
    expect(screen.getByRole('tablist').getAttribute('aria-orientation')).toBe('vertical');
    expect(screen.getByRole('tablist').getAttribute('data-orientation')).toBe('vertical');
    expect(tab('Account').getAttribute('data-orientation')).toBe('vertical');
    expect(panelOf('Account').getAttribute('data-orientation')).toBe('vertical');
  });

  it('marks a disabled tab natively and with data-disabled, and keeps it visible', () => {
    render(<Example lockPassword defaultValue="account" />);
    expect((tab('Password') as HTMLButtonElement).disabled).toBe(true);
    expect(tab('Password').hasAttribute('data-disabled')).toBe(true);
    expect(tab('Account').hasAttribute('data-disabled')).toBe(false);
  });

  it('passes native props and refs through and keeps the machine attributes out of reach', () => {
    const rootRef = createRef<HTMLDivElement>();
    const triggerRef = createRef<HTMLButtonElement>();
    render(
      <Tabs.Root defaultValue="a" ref={rootRef} className="mine" data-testid="root">
        <Tabs.List aria-label="x">
          <Tabs.Trigger value="a" ref={triggerRef} role="button" id="custom" aria-selected={false} data-x="1">
            A
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="a" id="custom-panel" hidden>
          a
        </Tabs.Content>
      </Tabs.Root>,
    );
    expect(rootRef.current?.className).toBe('cck-tabs mine');
    expect(triggerRef.current?.getAttribute('role')).toBe('tab');
    expect(triggerRef.current?.id).not.toBe('custom');
    expect(triggerRef.current?.getAttribute('aria-selected')).toBe('true');
    expect(triggerRef.current?.getAttribute('data-x')).toBe('1');
    expect(document.getElementById('custom-panel')).toBeNull();
    expect(screen.getByRole('tabpanel').hidden).toBe(false);
  });

  it('renders through the render prop of a part', () => {
    render(
      <Tabs.Root defaultValue="a">
        <Tabs.List aria-label="x" render={<section />}>
          <Tabs.Trigger value="a" render={(props) => <a {...props} href="#a" />}>
            A
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="a" render={<article />}>
          a
        </Tabs.Content>
      </Tabs.Root>,
    );
    expect(screen.getByRole('tablist').tagName).toBe('SECTION');
    expect(screen.getByRole('tabpanel').tagName).toBe('ARTICLE');
    expect(screen.getByRole('tab').tagName).toBe('A');
  });

  it('throws a clear error when a part is used outside the Root', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Tabs.Trigger value="a">A</Tabs.Trigger>)).toThrow(
      'CocoKits: <Tabs.Trigger> must be placed within <Tabs.Root>.',
    );
  });
});

describe('Tabs value', () => {
  it('is uncontrolled: a click selects and reports the user reason and the event', async () => {
    const onValueChange = vi.fn();
    render(<Example defaultValue="account" onValueChange={onValueChange} />);
    await userEvent.click(tab('Password'));
    expect(selectedTabs()).toEqual(['Password']);
    expect(panelOf('Password').hidden).toBe(false);
    expect(onValueChange).toHaveBeenCalledTimes(1);
    const [value, details] = onValueChange.mock.calls[0] as [string, { reason: string; event: Event }];
    expect(value).toBe('password');
    expect(details.reason).toBe('user');
    expect(details.event).toBeInstanceOf(Event);
  });

  it('reports nothing for a click on the selected tab or a disabled tab', async () => {
    const onValueChange = vi.fn();
    render(<Example lockPassword defaultValue="account" onValueChange={onValueChange} />);
    await userEvent.click(tab('Account'));
    await userEvent.click(tab('Password'));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('is controlled: the callback fires and the parent decides', async () => {
    const onValueChange = vi.fn();
    const { rerender } = render(<Example value="account" onValueChange={onValueChange} />);
    await userEvent.click(tab('Password'));
    expect(onValueChange).toHaveBeenCalledWith('password', expect.objectContaining({ reason: 'user' }));
    expect(selectedTabs()).toEqual(['Account']);
    rerender(<Example value="notifications" onValueChange={onValueChange} />);
    expect(selectedTabs()).toEqual(['Notifications']);
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it('works as a controlled component with state', async () => {
    function Controlled(): ReactElement {
      const [value, setValue] = useState('account');
      return (
        <>
          <button
            onClick={() => {
              setValue('notifications');
            }}
          >
            Go
          </button>
          <Example
            value={value}
            onValueChange={(next) => {
              setValue(next);
            }}
          />
        </>
      );
    }
    render(<Controlled />);
    await userEvent.click(screen.getByRole('button', { name: 'Go' }));
    expect(selectedTabs()).toEqual(['Notifications']);
    await userEvent.click(tab('Account'));
    expect(selectedTabs()).toEqual(['Account']);
  });

  it('keeps the selection when the selected tab becomes disabled', () => {
    const { rerender } = render(<Example defaultValue="password" />);
    rerender(<Example defaultValue="password" lockPassword />);
    expect(selectedTabs()).toEqual(['Password']);
    expect(tab('Account').tabIndex).toBe(0);
    expect(tab('Password').tabIndex).toBe(-1);
  });

  it('keeps the first resolved tab selected when it becomes disabled later', () => {
    function Pinned({ lock }: { readonly lock: boolean }): ReactElement {
      return (
        <Tabs.Root>
          <Tabs.List aria-label="x">
            <Tabs.Trigger value="a" disabled={lock}>
              A
            </Tabs.Trigger>
            <Tabs.Trigger value="b">B</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="a">a</Tabs.Content>
          <Tabs.Content value="b">b</Tabs.Content>
        </Tabs.Root>
      );
    }
    const { rerender } = render(<Pinned lock={false} />);
    expect(selectedTabs()).toEqual(['A']);
    rerender(<Pinned lock />);
    expect(selectedTabs()).toEqual(['A']);
    expect(tab('B').tabIndex).toBe(0);
  });
});

describe('Tabs keyboard', () => {
  it('has one tab stop: Tab enters at the selected tab and the next Tab goes to its panel', async () => {
    const user = userEvent.setup();
    render(<Example defaultValue="password" />);
    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(tab('Password'));
    await user.tab();
    expect(document.activeElement).toBe(panelOf('Password'));
  });

  it('moves with the arrows, wraps, and selects in automatic mode', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Example defaultValue="account" onValueChange={onValueChange} />);
    tab('Account').focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tab('Password'));
    expect(selectedTabs()).toEqual(['Password']);
    await user.keyboard('{ArrowRight}{ArrowRight}');
    expect(document.activeElement).toBe(tab('Account'));
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(tab('Notifications'));
    expect(onValueChange.mock.calls.map((call: unknown[]) => call[0])).toEqual([
      'password',
      'notifications',
      'account',
      'notifications',
    ]);
    expect(tab('Notifications').tabIndex).toBe(0);
  });

  it('moves to the first and last enabled tab with Home and End', async () => {
    const user = userEvent.setup();
    render(<Example defaultValue="account" lockPassword />);
    tab('Account').focus();
    await user.keyboard('{End}');
    expect(document.activeElement).toBe(tab('Notifications'));
    await user.keyboard('{Home}');
    expect(document.activeElement).toBe(tab('Account'));
  });

  it('skips a disabled tab', async () => {
    const user = userEvent.setup();
    render(<Example defaultValue="account" lockPassword />);
    tab('Account').focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tab('Notifications'));
  });

  it('moves focus without selecting in manual mode, and selects with Enter and Space', async () => {
    const user = userEvent.setup();
    render(<Example defaultValue="account" activationMode="manual" />);
    tab('Account').focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tab('Password'));
    expect(selectedTabs()).toEqual(['Account']);
    expect(tab('Account').tabIndex).toBe(0);
    await user.keyboard('{Enter}');
    expect(selectedTabs()).toEqual(['Password']);
    await user.keyboard('{ArrowRight}');
    await user.keyboard(' ');
    expect(selectedTabs()).toEqual(['Notifications']);
  });

  it('uses Up and Down in a vertical list and ignores Left and Right', async () => {
    const user = userEvent.setup();
    render(<Example defaultValue="account" orientation="vertical" />);
    tab('Account').focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tab('Account'));
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(tab('Password'));
    await user.keyboard('{ArrowUp}{ArrowUp}');
    expect(document.activeElement).toBe(tab('Notifications'));
  });

  it('flips the horizontal arrows in rtl but not the vertical ones', async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <DirectionProvider dir="rtl">
        <Example defaultValue="account" />
      </DirectionProvider>,
    );
    tab('Account').focus();
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(tab('Password'));
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tab('Account'));
    unmount();
    render(
      <DirectionProvider dir="rtl">
        <Example defaultValue="account" orientation="vertical" />
      </DirectionProvider>,
    );
    tab('Account').focus();
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(tab('Password'));
  });

  it('does not handle a key with a modifier, and lets the author veto', async () => {
    const user = userEvent.setup();
    render(
      <Tabs.Root defaultValue="a">
        <Tabs.List aria-label="x">
          <Tabs.Trigger
            value="a"
            onKeyDown={(event) => {
              if (event.key === 'ArrowLeft') event.preventDefault();
            }}
          >
            A
          </Tabs.Trigger>
          <Tabs.Trigger
            value="b"
            onClick={(event) => {
              event.preventDefault();
            }}
          >
            B
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="a">a</Tabs.Content>
        <Tabs.Content value="b">b</Tabs.Content>
      </Tabs.Root>,
    );
    tab('A').focus();
    await user.keyboard('{Shift>}{ArrowRight}{/Shift}');
    expect(document.activeElement).toBe(tab('A'));
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(tab('A'));
    await user.click(tab('B'));
    expect(tab('A').getAttribute('aria-selected')).toBe('true');
  });

  it('marks the trigger focused by keyboard with data-focus-visible, and not after a pointer press', async () => {
    const user = userEvent.setup();
    render(<Example defaultValue="account" />);
    tab('Account').focus();
    await user.keyboard('{ArrowRight}');
    expect(tab('Password').hasAttribute('data-focus-visible')).toBe(true);
    expect(tab('Account').hasAttribute('data-focus-visible')).toBe(false);
    await user.click(tab('Notifications'));
    expect(tab('Notifications').hasAttribute('data-focus-visible')).toBe(false);
  });
});

describe('Tabs collection', () => {
  it('follows tabs added, removed and reordered', async () => {
    const user = userEvent.setup();
    function List({ names }: { readonly names: readonly string[] }): ReactElement {
      return (
        <StrictMode>
          <Tabs.Root defaultValue="a">
            <Tabs.List aria-label="x">
              {names.map((name) => (
                <Tabs.Trigger key={name} value={name}>
                  {name}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
            {names.map((name) => (
              <Tabs.Content key={name} value={name}>
                {name} body
              </Tabs.Content>
            ))}
          </Tabs.Root>
        </StrictMode>
      );
    }
    const { rerender } = render(<List names={['a', 'b', 'c']} />);
    rerender(<List names={['c', 'a']} />);
    await waitFor(() => {
      expect(screen.getAllByRole('tab').map((element) => element.textContent)).toEqual(['c', 'a']);
    });
    tab('a').focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tab('c'));
    rerender(<List names={['a', 'c']} />);
    tab('a').focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tab('c'));
  });
});
